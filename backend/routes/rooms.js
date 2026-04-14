const router = require('express').Router();
const { Room } = require('../models');
const { authStaff, authAdmin } = require('../middleware/auth');

router.get('/', authStaff, async (req, res) => {
  try {
    const rooms = await Room.find().sort('roomNumber');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authAdmin, async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
