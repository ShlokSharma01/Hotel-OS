require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const chatRoutes = require('./routes/chat');
const requestRoutes = require('./routes/requests');
const billingRoutes = require('./routes/billing');
const paymentRoutes = require('./routes/payment');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel OS Backend is running 🚀',
    endpoints: [
      '/api/auth',
      '/api/rooms',
      '/api/chat',
      '/api/requests',
      '/api/billing',
      '/api/payment',
      '/api/feedback',
      '/api/analytics',
      '/api/admin',
      '/health'
    ]
  });
});
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-staff', () => socket.join('staff-room'));
  socket.on('join-guest', (guestId) => socket.join(`guest-${guestId}`));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Hotel OS Backend running on port ${PORT}`));
