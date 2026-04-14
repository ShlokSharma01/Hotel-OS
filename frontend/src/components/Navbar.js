import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function GuestNav() {
  const { guest, logoutGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/guest', label: 'Dashboard' },
    { path: '/guest/chat', label: 'Concierge' },
    { path: '/guest/checkout', label: 'Checkout' },
  ];

  const handleLogout = () => {
    logoutGuest();
    toast.success('Checked out successfully');
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Link to="/guest" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'white'
        }}>H</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Hotel OS</span>
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {links.map(link => (
          <Link key={link.path} to={link.path} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13,
            fontFamily: 'Syne, sans-serif', fontWeight: 500,
            color: location.pathname === link.path ? '#60a5fa' : '#94a3b8',
            background: location.pathname === link.path ? 'rgba(37,99,235,0.12)' : 'transparent',
            transition: 'all 0.2s',
          }}>{link.label}</Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {guest && (
          <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
            Room <strong style={{ color: '#60a5fa' }}>{guest.roomNumber}</strong>
          </span>
        )}
        <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
          Checkout
        </button>
      </div>
    </motion.nav>
  );
}

export function StaffNav() {
  const { staff, logoutStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutStaff();
    navigate('/staff/login');
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10, 15, 30, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'white'
        }}>H</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
          Hotel OS <span style={{ color: '#475569', fontWeight: 400 }}>— Staff</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {staff?.role === 'admin' && (
          <Link to="/admin" style={{
            fontSize: 13, color: location.pathname === '/admin' ? '#60a5fa' : '#94a3b8',
            fontFamily: 'Syne, sans-serif', fontWeight: 500,
          }}>Admin</Link>
        )}
        <div style={{
          padding: '6px 12px', borderRadius: 20,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          fontSize: 12, color: '#10b981', fontFamily: 'Inter, sans-serif',
        }}>
          {staff?.name} · {staff?.role}
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
          Sign Out
        </button>
      </div>
    </motion.nav>
  );
}
