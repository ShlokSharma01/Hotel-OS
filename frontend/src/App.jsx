import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import CheckIn from './pages/CheckIn.jsx';
import GuestDashboard from './pages/GuestDashboard.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Checkout from './pages/Checkout.jsx';
import StaffLogin from './pages/StaffLogin.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function GuestRoute({ children }) {
  const { guest } = useAuth();
  return guest ? children : <Navigate to="/checkin" replace />;
}

function StaffRoute({ children }) {
  const { staff } = useAuth();
  return staff ? children : <Navigate to="/staff/login" replace />;
}

function AdminRoute({ children }) {
  const { staff } = useAuth();
  return staff?.role === 'admin' ? children : <Navigate to="/staff/login" replace />;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/guest" element={<GuestRoute><GuestDashboard /></GuestRoute>} />
        <Route path="/guest/chat" element={<GuestRoute><Chatbot /></GuestRoute>} />
        <Route path="/guest/checkout" element={<GuestRoute><Checkout /></GuestRoute>} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/dashboard" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1528',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0d1528' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0d1528' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
