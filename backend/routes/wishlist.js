const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// GET /api/wishlist - Get current user's wishlist
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select(`
                note_id,
                created_at,
                notes:notes (*)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to return list of notes
        const notes = data.map(item => ({
            ...item.notes,
            added_to_wishlist_at: item.created_at
        }));

        res.json(notes);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/wishlist/:noteId - Add note to wishlist
router.post('/:noteId', requireAuth, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { error } = await supabase
            .from('wishlist')
            .insert({
                user_id: req.user.id,
                note_id: noteId
            });

        if (error) {
            // Ignore unique violation if already in wishlist
            if (error.code === '23505') { // Postgres unique_violation code
                return res.status(200).json({ message: 'Already in wishlist' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/wishlist/:noteId - Remove note from wishlist
router.delete('/:noteId', requireAuth, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', req.user.id)
            .eq('note_id', noteId);

        if (error) throw error;

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
