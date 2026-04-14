const router = require('express').Router();
const { Room, MenuItem, Staff, Guest } = require('../models');
const { authAdmin } = require('../middleware/auth');

router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/menu', authAdmin, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/menu/:id', authAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/menu/:id', authAdmin, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/staff', authAdmin, async (req, res) => {
  try {
    const staff = await Staff.find({}, '-passwordHash');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/staff/:id', authAdmin, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/guests', authAdmin, async (req, res) => {
  try {
    const guests = await Guest.find().sort('-createdAt').limit(50);
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
