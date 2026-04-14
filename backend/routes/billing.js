const router = require('express').Router();
const { Guest, Request } = require('../models');
const { authGuest } = require('../middleware/auth');

router.get('/:guestId', authGuest, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    const checkIn = new Date(guest.checkIn);
    const checkOut = new Date(guest.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    const pricePerNight = { standard: 2999, deluxe: 4999, suite: 8999, presidential: 14999 }[guest.roomType] || 2999;
    const roomCharge = pricePerNight * nights;

    const serviceRequests = await Request.find({
      bookingId: guest.bookingId,
      type: 'food',
      status: { $ne: 'cancelled' }
    });

    const serviceCharges = serviceRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const taxes = Math.round((roomCharge + serviceCharges) * 0.12);
    const total = roomCharge + serviceCharges + taxes;

    res.json({
      guest: {
        name: guest.name,
        email: guest.email,
        roomNumber: guest.roomNumber,
        bookingId: guest.bookingId
      },
      checkIn: guest.checkIn,
      checkOut: guest.checkOut,
      nights,
      breakdown: {
        roomCharge,
        pricePerNight,
        serviceCharges,
        serviceRequests: serviceRequests.map(r => ({
          description: r.description,
          amount: r.totalAmount,
          date: r.createdAt
        })),
        taxes,
        total
      }
    });
  } catch (err) {
    console.error('Billing error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;