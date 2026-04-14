const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Guest, Order } = require('../models');
const { authGuest } = require('../middleware/auth');

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
  });
}

router.post('/initiate', authGuest, async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${req.guest.bookingId}_${Date.now()}`
    };
    const order = await getRazorpay().orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', authGuest, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ error: 'Invalid signature' });

    await Order.create({
      guestId: req.guest.id,
      bookingId: req.guest.bookingId,
      totalAmount: amount / 100,
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    await Guest.findByIdAndUpdate(req.guest.id, { status: 'checked-out' });

    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
