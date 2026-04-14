// feedback.js
const router = require('express').Router();
const { Feedback } = require('../models');
const { authGuest } = require('../middleware/auth');

router.post('/', authGuest, async (req, res) => {
  try {
    const fb = await Feedback.create({ ...req.body, guestId: req.guest.id, bookingId: req.guest.bookingId });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
