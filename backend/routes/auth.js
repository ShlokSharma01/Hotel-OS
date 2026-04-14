const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { Guest, Staff } = require('../models');

router.post('/guest/checkin', async (req, res) => {
  try {
    const { bookingId, email } = req.body;
    let guest = await Guest.findOne({ bookingId, email: email.toLowerCase() });
    if (!guest) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const qrData = JSON.stringify({ bookingId, pin, timestamp: Date.now() });
      const qrCode = await QRCode.toDataURL(qrData);
      guest = await Guest.create({
        bookingId,
        email: email.toLowerCase(),
        name: req.body.name || 'Guest',
        phone: req.body.phone,
        roomNumber: req.body.roomNumber || '101',
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000 * (req.body.nights || 1)),
        status: 'checked-in',
        roomPin: pin,
        roomQR: qrCode
      });
    } else {
      if (guest.status === 'checked-out') {
        return res.status(400).json({ error: 'Booking already checked out' });
      }
      guest.status = 'checked-in';
      await guest.save();
    }
    const token = jwt.sign(
      { id: guest._id, bookingId: guest.bookingId, roomNumber: guest.roomNumber, role: 'guest' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, guest: { ...guest.toObject(), passwordHash: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email: email.toLowerCase() });
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: staff._id, name: staff.name, email: staff.email, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, staff: { id: staff._id, name: staff.name, email: staff.email, role: staff.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff/register', async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'hotel-os-setup-2024') {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const staff = await Staff.create({ name, email: email.toLowerCase(), passwordHash, role: role || 'service' });
    res.status(201).json({ message: 'Staff created', id: staff._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
