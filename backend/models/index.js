const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  roomNumber: String,
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['pending', 'checked-in', 'checked-out'], default: 'pending' },
  idDocumentUrl: String,
  roomPin: String,
  roomQR: String,
  createdAt: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['standard', 'deluxe', 'suite', 'presidential'], default: 'standard' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  floor: Number,
  amenities: [String],
  image: String,
  description: String
});

const RequestSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  bookingId: String,
  roomNumber: String,
  type: { type: String, enum: ['food', 'housekeeping', 'maintenance', 'other'], required: true },
  description: { type: String, required: true },
  items: [{ name: String, quantity: Number, price: Number }],
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  assignedTo: String,
  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  bookingId: String,
  items: [{ name: String, quantity: Number, price: Number }],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentId: String,
  razorpayOrderId: String,
  createdAt: { type: Date, default: Date.now }
});

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['frontDesk', 'service', 'admin'], default: 'service' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  bookingId: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  categories: {
    checkin: Number,
    service: Number,
    cleanliness: Number,
    food: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const ChatLogSchema = new mongoose.Schema({
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  bookingId: String,
  sessionId: String,
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    intent: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'beverages', 'snacks'], required: true },
  price: { type: Number, required: true },
  description: String,
  isAvailable: { type: Boolean, default: true },
  image: String,
  preparationTime: Number
});

module.exports = {
  Guest: mongoose.model('Guest', GuestSchema),
  Room: mongoose.model('Room', RoomSchema),
  Request: mongoose.model('Request', RequestSchema),
  Order: mongoose.model('Order', OrderSchema),
  Staff: mongoose.model('Staff', StaffSchema),
  Feedback: mongoose.model('Feedback', FeedbackSchema),
  ChatLog: mongoose.model('ChatLog', ChatLogSchema),
  MenuItem: mongoose.model('MenuItem', MenuItemSchema)
};
