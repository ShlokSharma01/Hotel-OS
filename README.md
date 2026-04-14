# 🏨 Hotel OS — Smart Hotel Management Platform

> AI-powered check-in · Chatbot concierge · Real-time staff dashboard · Razorpay checkout

Built by Sharda University CSE Team | Based on the Hotel OS research paper.

---

## 📁 Project Structure

```
hotel-os/
├── backend/          ← Node.js + Express + Socket.io API
│   ├── config/       ← MongoDB connection
│   ├── middleware/   ← JWT auth (guest / staff / admin)
│   ├── models/       ← Mongoose schemas (Guest, Room, Request, etc.)
│   ├── routes/       ← All API endpoints
│   ├── server.js     ← Entry point
│   ├── seed.js       ← Demo data seeder
│   └── .env.example  ← Environment variables template
└── frontend/         ← React 18 + Framer Motion + Recharts
    ├── public/
    └── src/
        ├── pages/    ← Landing, CheckIn, GuestDashboard, Chatbot,
        │               Checkout, StaffLogin, StaffDashboard, AdminPanel
        ├── components/ ← Navbar, PageTransition animations
        ├── context/  ← AuthContext (guest + staff)
        └── utils/    ← Axios API client
```

---

## ⚡ Quick Start (Local Development)

### 1. Clone & Install

```bash
# Backend
cd hotel-os/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your real values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hotel-os
JWT_SECRET=your_super_secret_key_min_32_chars
GROQ_API_KEY=sk-...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api  ← already set
```

### 4. Seed Demo Data

```bash
cd backend
node seed.js
```

This creates:
- **Guest:** Booking ID `BK-DEMO-001` | Email `guest@demo.com`
- **Admin:** `admin@hotel.com` / `admin123`
- **Staff:** `staff@hotel.com` / `staff123`
- 9 rooms (standard → presidential)
- 17 menu items

### 5. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

Open http://localhost:3000

---

## 🎯 Features & Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Marketing hero, stats, features |
| Guest Check-In | `/checkin` | 3-step digital check-in with QR key |
| Guest Dashboard | `/guest` | Stay overview, quick actions, requests |
| AI Concierge | `/guest/chat` | OpenAI-powered chatbot — orders food, schedules housekeeping, reports issues |
| Checkout | `/guest/checkout` | Itemised bill + Razorpay payment + feedback |
| Staff Login | `/staff/login` | JWT auth for staff/admin |
| Staff Dashboard | `/staff/dashboard` | Live request feed via Socket.io, accept/complete requests |
| Admin Panel | `/admin` | Analytics charts, room management, menu management, staff list |

---

## 🚀 Deployment

### Backend → Railway

1. Push `backend/` folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set all environment variables from `.env.example`
4. Deploy — Railway auto-detects Node.js

### Frontend → Vercel

1. Push `frontend/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Set `REACT_APP_API_URL=https://your-railway-url.railway.app/api`
4. Deploy

### Database → MongoDB Atlas

1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist `0.0.0.0/0` (or your Railway IP)
4. Copy connection string → `MONGODB_URI` in Railway env vars
5. Run seed: `node seed.js` (with Atlas URI in `.env`)

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/guest/checkin` | None | Guest check-in → JWT + QR |
| POST | `/api/auth/staff/login` | None | Staff login → JWT |
| POST | `/api/auth/staff/register` | Admin Secret | Create staff account |
| GET | `/api/rooms` | Staff | List all rooms |
| POST | `/api/chat/message` | Guest JWT | Send message to AI chatbot |
| POST | `/api/requests` | Guest JWT | Create service request |
| GET | `/api/requests` | Staff JWT | Get all requests |
| PATCH | `/api/requests/:id` | Staff JWT | Update request status |
| GET | `/api/billing/:guestId` | Guest JWT | Get itemised bill |
| POST | `/api/payment/initiate` | Guest JWT | Create Razorpay order |
| POST | `/api/payment/verify` | Guest JWT | Verify payment signature |
| POST | `/api/feedback` | Guest JWT | Submit post-checkout feedback |
| GET | `/api/analytics/summary` | Staff JWT | Dashboard stats |
| GET | `/api/admin/menu` | Public | Get menu items |
| POST | `/api/admin/menu` | Admin JWT | Add menu item |
| GET | `/api/admin/staff` | Admin JWT | List staff |

---

## 🧱 Tech Stack

**Frontend:** React 18 · React Router v6 · Framer Motion · Recharts · Socket.io Client · Axios · React Hot Toast

**Backend:** Node.js 20 · Express 4 · Socket.io · Mongoose · JWT · Bcryptjs · Multer · QRCode

**Database:** MongoDB Atlas

**Payments:** Razorpay (UPI + Card + Net Banking)

**AI:** Groq (chatbot NLP)

**Deployment:** Vercel (frontend) · Railway (backend) · MongoDB Atlas (DB)

**Design:** Dark Navy + Electric Blue · Syne + Inter fonts · Framer Motion animations

---

## 📝 Environment Variables Reference

```env
# Required
MONGODB_URI          MongoDB Atlas connection string
JWT_SECRET           Secret key for JWT signing (min 32 chars)
GROQ_API_KEY       From platform.GROQ.com
RAZORPAY_KEY_ID      From razorpay.com dashboard
RAZORPAY_KEY_SECRET  From razorpay.com dashboard

# Optional (for ID document uploads)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Server
PORT                 Default: 5000
FRONTEND_URL         Your Vercel URL (for CORS)
NODE_ENV             development or production
```

---

Updated: April 14, 2026

## 👥 Team

Sharda University, Department of Computer Science & Engineering  
Shlok Sharma
---

*Hotel OS — Reducing check-in time by 74%, improving service response by 35%, increasing guest satisfaction to 85%.*
