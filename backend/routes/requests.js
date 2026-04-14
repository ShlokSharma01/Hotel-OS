const router = require('express').Router();
const { Request } = require('../models');
const { authGuest, authStaff } = require('../middleware/auth');

router.post('/', authGuest, async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      guestId: req.guest.id,
      bookingId: req.guest.bookingId,
      roomNumber: req.guest.roomNumber
    });
    req.app.get('io').to('staff-room').emit('new-request', request);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authStaff, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const requests = await Request.find(filter).sort('-createdAt').limit(100);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authStaff, async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    req.app.get('io').to('staff-room').emit('request-updated', request);
    req.app.get('io').to(`guest-${request.guestId}`).emit('request-updated', request);
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/guest', authGuest, async (req, res) => {
  try {
    const requests = await Request.find({ bookingId: req.guest.bookingId }).sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
