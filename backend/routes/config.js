const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// GET /api/config/:key (Public)
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { data, error } = await supabase
            .from('app_config')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            // Return default defaults if table/key doesn't exist yet (Safe fallback)
            if (key === 'subscription_price') return res.json({ value: 100 });
            return res.status(404).json({ error: 'Config not found' });
        }

        res.json({ value: data.value });
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/config/:key (Admin Only)
router.post('/:key', requireAuth, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        // 1. Check if Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 2. Upsert Config
        const { error } = await supabase
            .from('app_config')
            .upsert({ key, value });

        if (error) throw error;

        res.json({ success: true, message: 'Config updated' });

    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
