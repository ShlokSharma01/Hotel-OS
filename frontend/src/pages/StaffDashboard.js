import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { StaffNav } from '../components/Navbar';
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from '../components/PageTransition';
import API from '../utils/api';

const TYPE_META = {
  food: { icon: '🍽️', color: '#f97316', label: 'Food & Beverage' },
  housekeeping: { icon: '🧹', color: '#a78bfa', label: 'Housekeeping' },
  maintenance: { icon: '🔧', color: '#ef4444', label: 'Maintenance' },
  other: { icon: '💬', color: '#60a5fa', label: 'General' },
};

const STATUS_ORDER = ['pending', 'in-progress', 'completed', 'cancelled'];

function RequestCard({ req, onUpdate }) {
  const meta = TYPE_META[req.type] || TYPE_META.other;
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await API.patch(`/requests/${req._id}`, { status });
      onUpdate(req._id, status);
      toast.success(`Request marked as ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const nextStatus = { pending: 'in-progress', 'in-progress': 'completed' }[req.status];

  const statusColors = { pending: '#f59e0b', 'in-progress': '#00d4ff', completed: '#10b981', cancelled: '#ef4444' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '20px', marginBottom: 12,
        borderLeft: `3px solid ${meta.color}`,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>{meta.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14 }}>{meta.label}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: `${statusColors[req.status]}18`, color: statusColors[req.status],
                border: `1px solid ${statusColors[req.status]}30`,
              }}>{req.status}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>{req.description}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>Room {req.roomNumber}</span>
              <span style={{ fontSize: 11, color: '#475569' }}>{new Date(req.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
              {req.totalAmount > 0 && <span style={{ fontSize: 11, color: '#10b981' }}>₹{req.totalAmount}</span>}
            </div>
          </div>
        </div>
        {nextStatus && req.status !== 'completed' && req.status !== 'cancelled' && (
          <motion.button
            onClick={() => updateStatus(nextStatus)} disabled={updating}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '8px 16px', borderRadius: 10, flexShrink: 0,
              background: nextStatus === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(0,212,255,0.1)',
              border: `1px solid ${nextStatus === 'completed' ? 'rgba(16,185,129,0.25)' : 'rgba(0,212,255,0.2)'}`,
              color: nextStatus === 'completed' ? '#10b981' : '#00d4ff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif',
              opacity: updating ? 0.6 : 1,
            }}>
            {nextStatus === 'in-progress' ? 'Accept' : 'Complete ✓'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function StaffDashboard() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

  const loadRequests = useCallback(async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
      setStats({
        pending: res.data.filter(r => r.status === 'pending').length,
        inProgress: res.data.filter(r => r.status === 'in-progress').length,
        completed: res.data.filter(r => r.status === 'completed').length,
      });
    } catch (err) {
      toast.error('Could not load requests');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadRequests();
    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('join-staff');
    socket.on('new-request', (req) => {
      setRequests(prev => [req, ...prev]);
      setStats(s => ({ ...s, pending: s.pending + 1 }));
      toast('New request from Room ' + req.roomNumber, { icon: TYPE_META[req.type]?.icon || '📋' });
    });
    socket.on('request-updated', (updated) => {
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
    });
    return () => socket.disconnect();
  }, [loadRequests]);

  const handleUpdate = (id, status) => {
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
  };

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    return true;
  });

  const statCards = [
    { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: '⏳' },
    { label: 'In Progress', value: stats.inProgress, color: '#00d4ff', icon: '⚡' },
    { label: 'Completed Today', value: stats.completed, color: '#10b981', icon: '✓' },
    { label: 'Total Requests', value: requests.length, color: '#a78bfa', icon: '📋' },
  ];

  return (
    <PageTransition>
      <StaffNav />
      <div style={{ paddingTop: 88, minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '88px 24px 60px' }}>

        <FadeIn>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 4 }}>Staff Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 13, color: '#10b981' }}>Live · Auto-updating</span>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <StaggerContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {statCards.map((s, i) => (
              <StaggerItem key={i}>
                <div style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: s.color }}>{s.value}</div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        {/* Filters */}
        <FadeIn delay={0.2}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#475569', marginRight: 4 }}>Status:</span>
            {['all', 'pending', 'in-progress', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: filter === f ? 'rgba(37,99,235,0.15)' : 'transparent',
                border: filter === f ? '1px solid rgba(37,99,235,0.35)' : '1px solid rgba(255,255,255,0.07)',
                color: filter === f ? '#60a5fa' : '#94a3b8',
                fontFamily: 'Syne, sans-serif', fontWeight: 500, transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>{f}</button>
            ))}
            <span style={{ fontSize: 12, color: '#475569', marginLeft: 8, marginRight: 4 }}>Type:</span>
            {['all', 'food', 'housekeeping', 'maintenance'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: typeFilter === t ? 'rgba(37,99,235,0.15)' : 'transparent',
                border: typeFilter === t ? '1px solid rgba(37,99,235,0.35)' : '1px solid rgba(255,255,255,0.07)',
                color: typeFilter === t ? '#60a5fa' : '#94a3b8',
                fontFamily: 'Syne, sans-serif', fontWeight: 500, transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>{t === 'all' ? '🌐 all' : `${TYPE_META[t].icon} ${t}`}</button>
            ))}
            <button onClick={loadRequests} style={{
              marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, fontSize: 12,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
              color: '#94a3b8', cursor: 'pointer',
            }}>↻ Refresh</button>
          </div>
        </FadeIn>

        {/* Requests */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p>No requests matching filters</p>
          </motion.div>
        ) : (
          <div>
            <p style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>{filtered.length} request{filtered.length !== 1 ? 's' : ''}</p>
            <AnimatePresence>
              {filtered.map(req => <RequestCard key={req._id} req={req} onUpdate={handleUpdate} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
