require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
  });
  console.log('Connected to MongoDB');

  const { Guest, Room, Staff, MenuItem } = require('./models');

  await Promise.all([Guest.deleteMany({}), Room.deleteMany({}), Staff.deleteMany({}), MenuItem.deleteMany({})]);
  console.log('Cleared existing data');

  const adminHash = await bcrypt.hash('admin123', 12);
  const staffHash = await bcrypt.hash('staff123', 12);
  await Staff.insertMany([
    { name: 'Admin User', email: 'admin@hotel.com', passwordHash: adminHash, role: 'admin' },
    { name: 'Front Desk', email: 'staff@hotel.com', passwordHash: staffHash, role: 'frontDesk' },
    { name: 'Service Staff', email: 'service@hotel.com', passwordHash: staffHash, role: 'service' },
  ]);
  console.log('Staff created');

  await Room.insertMany([
    { roomNumber: '101', type: 'standard', price: 2999, floor: 1, status: 'available' },
    { roomNumber: '102', type: 'standard', price: 2999, floor: 1, status: 'available' },
    { roomNumber: '201', type: 'deluxe', price: 4999, floor: 2, status: 'available' },
    { roomNumber: '202', type: 'deluxe', price: 4999, floor: 2, status: 'available' },
    { roomNumber: '204', type: 'deluxe', price: 4999, floor: 2, status: 'available' },
    { roomNumber: '301', type: 'suite', price: 8999, floor: 3, status: 'available' },
    { roomNumber: '401', type: 'presidential', price: 14999, floor: 4, status: 'available' },
  ]);
  console.log('Rooms created');

  await MenuItem.insertMany([
    { name: 'Masala Chai', category: 'beverages', price: 80, isAvailable: true },
    { name: 'Filter Coffee', category: 'beverages', price: 90, isAvailable: true },
    { name: 'Cold Coffee', category: 'beverages', price: 150, isAvailable: true },
    { name: 'Aloo Paratha', category: 'breakfast', price: 180, isAvailable: true },
    { name: 'English Breakfast', category: 'breakfast', price: 350, isAvailable: true },
    { name: 'Dal Makhani', category: 'lunch', price: 280, isAvailable: true },
    { name: 'Chicken Biryani', category: 'lunch', price: 380, isAvailable: true },
    { name: 'Paneer Butter Masala', category: 'lunch', price: 320, isAvailable: true },
    { name: 'Butter Chicken', category: 'dinner', price: 420, isAvailable: true },
    { name: 'Veg Thali', category: 'dinner', price: 350, isAvailable: true },
    { name: 'French Fries', category: 'snacks', price: 180, isAvailable: true },
    { name: 'Samosa', category: 'snacks', price: 80, isAvailable: true },
  ]);
  console.log('Menu created');

  const QRCode = require('qrcode');
  const pin = '4829';
  const qrCode = await QRCode.toDataURL(JSON.stringify({ bookingId: 'BK-DEMO-001', pin }));
  await Guest.create({
    bookingId: 'BK-DEMO-001',
    name: 'Demo Guest',
    email: 'guest@demo.com',
    phone: '+91 98765 43210',
    roomNumber: '204',
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 2 * 86400000),
    status: 'checked-in',
    roomPin: pin,
    roomQR: qrCode,
  });
  console.log('Demo guest created');

  console.log('\nSeed complete!');
  console.log('Guest:  BK-DEMO-001 / guest@demo.com');
  console.log('Admin:  admin@hotel.com / admin123');
  console.log('Staff:  staff@hotel.com / staff123');
  process.exit(0);
}

seed().catch(err => { console.error(err.message); process.exit(1); });
