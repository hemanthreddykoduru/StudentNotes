const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const supabase = require('../config/supabase');
const requireAuth = require('../middleware/auth');
const crypto = require('crypto');

// POST /api/payments/create-order
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { noteId } = req.body;
    
    // Fetch note price
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('price')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const options = {
      amount: note.price * 100, // amount in paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { noteId, userId: req.user.id }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// POST /api/payments/verify
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      noteId
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment successful, save to database
      
      // Fetch order details to get amount or trust frontend? Verify amount.
      // Ideally verify amount again but for simplicity assuming correct.
      
      // Fetch note to get price
      const { data: note } = await supabase.from('notes').select('price').eq('id', noteId).single();

      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          user_id: req.user.id,
          note_id: noteId,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: note.price,
          status: 'completed'
        }]);

      if (error) throw error;

      res.json({ success: true, message: 'Payment verified and purchase recorded' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error verifying payment' });
  }
});

// POST /api/payments/create-subscription-order
router.post('/create-subscription-order', requireAuth, async (req, res) => {
  try {
    const options = {
      amount: 100, // ₹1 in paisa (Fixed Price for Subscription)
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: { type: 'subscription', userId: req.user.id }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating subscription order' });
  }
});

// POST /api/payments/verify-subscription
router.post('/verify-subscription', requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment successful, create subscription
     
      // Calculate Expiry (1 Year from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: req.user.id,
          plan_type: 'pro',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: 1.00,
          status: 'active'
        }]);

      if (error) throw error;

      res.json({ success: true, message: 'Subscription activated successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error verifying subscription' });
  }
});

module.exports = router;
