const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || profile.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Server error checking admin status' });
    }
};

// GET /api/analytics/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        // 1. Total Users
        const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');

        if (usersError) throw usersError;

        // 2. Total Notes
        const { count: totalNotes, error: notesError } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true });

        if (notesError) throw notesError;

        // 3. Financials (Revenue)
        // Fetch all successful purchase amounts
        const { data: purchases, error: purchaseError } = await supabase
            .from('purchases')
            .select('amount, created_at')
            .eq('status', 'paid'); // Assuming 'paid' is the success status we set

        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('amount, created_at')
            .eq('status', 'active'); // Or 'paid', checking schema.sql it says 'active'/'expired'

        if (purchaseError) throw purchaseError;
        if (subError) throw subError;

        // Calculate Total Revenue
        const purchaseRevenue = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
        const subRevenue = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);
        const totalRevenue = purchaseRevenue + subRevenue;

        // 4. Daily Revenue (Last 30 Days)
        const dailyRevenue = {};
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Process Purchases
        [...purchases, ...subscriptions].forEach(txn => {
            const date = new Date(txn.created_at);
            if (date >= thirtyDaysAgo) {
                const dateStr = date.toISOString().split('T')[0];
                dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + Number(txn.amount);
            }
        });

        // Format for Recharts
        const chartData = Object.keys(dailyRevenue)
            .sort()
            .map(date => ({
                date,
                revenue: dailyRevenue[date]
            }));

        // 5. Top Selling Notes
        // We need to count occurrences of note_id in purchases
        // Fetch all purchases with note details
        const { data: notePurchases, error: npError } = await supabase
            .from('purchases')
            .select('note_id, notes(title)')
            .eq('status', 'paid');
        
        if (npError) throw npError;

        const noteSales = {};
        notePurchases.forEach(p => {
             const title = p.notes?.title || 'Unknown Note';
             noteSales[title] = (noteSales[title] || 0) + 1;
        });

        const topNotes = Object.entries(noteSales)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        res.json({
            totalUsers,
            totalNotes,
            totalRevenue,
            chartData,
            topNotes
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
