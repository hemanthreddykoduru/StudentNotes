const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// GET /api/notes - List all active notes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notes/:id - Get note details (Secured)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id']; // We will pass User ID from frontend if logged in

    // 1. Fetch Note Details
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // If no user, return basic info only (no file_url)
    if (!userId) {
        const { file_url, ...safeNote } = note;
        return res.json({ ...safeNote, hasAccess: false });
    }

    // 2. Check for Active Subscription
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .limit(1);

    if (subscriptions && subscriptions.length > 0) {
         return res.json({ ...note, file_url: note.file_url, hasAccess: true });
    }

    // 3. Check for Individual Purchase
    const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('note_id', id)
        .limit(1);

    if (purchases && purchases.length > 0) {
        return res.json({ ...note, file_url: note.file_url, hasAccess: true });
    }

    // 4. No Access - Strip file_url
    const { file_url, ...safeNote } = note;
    return res.json({ ...safeNote, hasAccess: false });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notes - Create a new note (Admin only)
router.post('/', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { title, subject, price, file_url, preview_url } = req.body;
    
    // Insert note
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, subject, price, file_url, preview_url }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notes/:id - Update a note (Admin only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const updates = req.body;
    
    // Update note
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notes/:id - Delete a note (Admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Delete note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
