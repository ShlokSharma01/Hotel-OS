import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GuestNav from '../components/Navbar';
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from '../components/PageTransition';
import API from '../utils/api';

const quickActions = [
  { icon: '🍽️', label: 'Order Food', desc: 'F&B to your room', path: '/guest/chat', color: '#f97316' },
  { icon: '🧹', label: 'Housekeeping', desc: 'Schedule cleaning', path: '/guest/chat', color: '#a78bfa' },
  { icon: '🔧', label: 'Maintenance', desc: 'Report an issue', path: '/guest/chat', color: '#ef4444' },
  { icon: '💳', label: 'Checkout', desc: 'Pay & leave', path: '/guest/checkout', color: '#10b981' },
];

export default function GuestDashboard() {
  const { guest } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get('/requests/guest').then(r => setRequests(r.data)).catch(() => {});
  }, []);

  const checkIn = guest?.checkIn ? new Date(guest.checkIn) : new Date();
  const checkOut = guest?.checkOut ? new Date(guest.checkOut) : new Date(Date.now() + 86400000);
  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000));
  const daysLeft = Math.max(0, Math.ceil((checkOut - new Date()) / 86400000));

  const statusColor = { pending: '#f59e0b', 'in-progress': '#00d4ff', completed: '#10b981', cancelled: '#ef4444' };
  const typeIcon = { food: '🍽️', housekeeping: '🧹', maintenance: '🔧', other: '💬' };

  return (
    <PageTransition>
      <GuestNav />
      <div style={{ paddingTop: 88, minHeight: '100vh', maxWidth: 1100, margin: '0 auto', padding: '88px 24px 60px' }}>

        {/* Welcome header */}
        <FadeIn>
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(0,212,255,0.06) 100%)',
            border: '1px solid rgba(37,99,235,0.2)', borderRadius: 20, padding: '32px',
            marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 20,
          }}>
            <div>
              <p style={{ fontSize: 12, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Welcome back</p>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 4 }}>
                {guest?.name || 'Guest'}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                Room <strong style={{ color: '#60a5fa' }}>{guest?.roomNumber}</strong> · {nights} night{nights !== 1 ? 's' : ''} stay
              </p>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                ['Check-In', checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })],
                ['Check-Out', checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })],
                ['Days Left', daysLeft.toString()],
              ].map(([k, v]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#f1f5f9' }}>{v}</div>
                  <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.1}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Quick Actions</h2>
        </FadeIn>
        <StaggerContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
            {quickActions.map((a, i) => (
              <StaggerItem key={i}>
                <motion.div
                  onClick={() => navigate(a.path)}
                  whileHover={{ y: -4, boxShadow: `0 16px 40px rgba(0,0,0,0.3)` }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, padding: '24px 20px', cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${a.color}18`, border: `1px solid ${a.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 14,
                  }}>{a.icon}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{a.desc}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Recent Requests */}
        <FadeIn delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>My Requests</h2>
            <button onClick={() => navigate('/guest/chat')} style={{
              fontSize: 12, color: '#60a5fa', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600,
            }}>+ New Request</button>
          </div>

          {requests.length === 0 ? (
            <div style={{
              background: 'var(--navy-800)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '40px', textAlign: 'center', color: '#475569',
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 14 }}>No requests yet. Chat with our AI Concierge to get started.</p>
              <button onClick={() => navigate('/guest/chat')} className="btn-primary"
                style={{ marginTop: 20, justifyContent: 'center' }}>
                Open Concierge
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.slice(0, 8).map((r, i) => (
                <motion.div key={r._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'var(--navy-800)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 20 }}>{typeIcon[r.type]}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9' }}>{r.description}</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        {new Date(r.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                    background: `${statusColor[r.status]}18`,
                    color: statusColor[r.status],
                    border: `1px solid ${statusColor[r.status]}30`,
                    whiteSpace: 'nowrap',
                  }}>{r.status}</div>
                </motion.div>
              ))}
            </div>
          )}
        </FadeIn>

        {/* Chatbot CTA */}
        <FadeIn delay={0.3}>
          <motion.div
            whileHover={{ scale: 1.01 }} onClick={() => navigate('/guest/chat')}
            style={{
              marginTop: 32, cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(0,212,255,0.08))',
              border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20,
              padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 20,
            }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🤖</div>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                AI Concierge Available 24/7
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>
                Order food, request services, or ask about local attractions — just chat naturally.
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#60a5fa', fontSize: 20, flexShrink: 0 }}>→</span>
          </motion.div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
