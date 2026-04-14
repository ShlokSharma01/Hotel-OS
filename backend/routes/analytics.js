const router = require('express').Router();
const { Guest, Request, Feedback, Room } = require('../models');
const { authAdmin, authStaff } = require('../middleware/auth');

router.get('/summary', authStaff, async (req, res) => {
  try {
    const [totalGuests, checkedIn, totalRequests, pendingRequests, rooms, feedbacks] = await Promise.all([
      Guest.countDocuments(),
      Guest.countDocuments({ status: 'checked-in' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'pending' }),
      Room.find(),
      Feedback.find()
    ]);

    const avgRating = feedbacks.length
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    const occupancyRate = rooms.length
      ? Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100)
      : 0;

    const requestsByType = await Request.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const last7days = await Guest.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalGuests, checkedIn, totalRequests, pendingRequests,
      avgRating, occupancyRate,
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === 'available').length,
      requestsByType, last7days,
      satisfactionScore: Math.round(parseFloat(avgRating) * 20)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
