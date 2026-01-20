const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// GET /api/reviews/note/:noteId - Get reviews for a specific note
router.get('/note/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;

    // 1. Fetch reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Fetch user details for each review (Manually joining to avoid schema complexity)
    // Get unique user IDs involved
    const userIds = [...new Set(reviews.map(r => r.user_id))];

    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email') // We might want to show name
            .in('id', userIds);
        
        if (profilesError) throw profilesError;

        // Map profiles to reviews
        const reviewsWithProfiles = reviews.map(review => {
            const profile = profiles.find(p => p.id === review.user_id);
            return {
                ...review,
                user: {
                    full_name: profile?.full_name || 'Anonymous Student',
                    // generate simple avatar using email or name if needed on frontend
                }
            };
        });

        return res.json(reviewsWithProfiles);
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reviews - Add a review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { noteId, rating, comment } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!noteId || !rating) {
        return res.status(400).json({ error: 'Note ID and Rating are required.' });
    }

    // Insert review
    // Supabase DB constraint ensures uniqueness (one review per user per note)
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ 
          user_id: userId, 
          note_id: noteId, 
          rating, 
          comment 
      }])
      .select()
      .single();

    if (error) {
        if (error.code === '23505') { // Unique violation code
            return res.status(400).json({ error: 'You have already reviewed this note.' });
        }
        throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
