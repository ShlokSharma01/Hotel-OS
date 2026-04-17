import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { StaffNav } from '../components/Navbar';
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from '../components/PageTransition';
import API from '../utils/api';

const TABS = ['Analytics', 'Rooms', 'Menu', 'Staff'];
const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'presidential'];
const MENU_CATS = ['breakfast', 'lunch', 'dinner', 'beverages', 'snacks'];
const COLORS = ['#2563eb', '#00d4ff', '#10b981', '#f59e0b', '#a78bfa'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1528', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ color: '#60a5fa', fontSize: 13 }}>{payload[0]?.name}: <strong>{payload[0]?.value}</strong></p>
    </div>
  );
};

export default function AdminPanel() {
  const [tab, setTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [menu, setMenu] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', type: 'standard', price: '', floor: '', description: '' });
  const [menuForm, setMenuForm] = useState({ name: '', category: 'beverages', price: '', description: '', preparationTime: 10 });

  useEffect(() => {
    API.get('/analytics/summary').then(r => setAnalytics(r.data)).catch(() => {});
    API.get('/rooms').then(r => setRooms(r.data)).catch(() => {});
    API.get('/admin/menu').then(r => setMenu(r.data)).catch(() => {});
    API.get('/admin/staff').then(r => setStaffList(r.data)).catch(() => {});
  }, []);

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      const r = await API.post('/rooms', roomForm);
      setRooms(prev => [...prev, r.data]);
      setShowRoomForm(false);
      setRoomForm({ roomNumber: '', type: 'standard', price: '', floor: '', description: '' });
      toast.success('Room added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const toggleRoomStatus = async (room) => {
    const next = { available: 'maintenance', maintenance: 'available', occupied: 'maintenance' }[room.status];
    try {
      const r = await API.patch(`/rooms/${room._id}`, { status: next });
      setRooms(prev => prev.map(rm => rm._id === room._id ? r.data : rm));
      toast.success(`Room ${room.roomNumber} → ${next}`);
    } catch { toast.error('Update failed'); }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      const r = await API.post('/admin/menu', menuForm);
      setMenu(prev => [...prev, r.data]);
      setShowMenuForm(false);
      setMenuForm({ name: '', category: 'beverages', price: '', description: '', preparationTime: 10 });
      toast.success('Menu item added');
    } catch { toast.error('Failed to add item'); }
  };

  const deleteMenuItem = async (id) => {
    try {
      await API.delete(`/admin/menu/${id}`);
      setMenu(prev => prev.filter(m => m._id !== id));
      toast.success('Item removed');
    } catch { toast.error('Failed'); }
  };

  const roomStatusColor = { available: '#10b981', occupied: '#2563eb', maintenance: '#f59e0b' };

  const pieData = analytics?.requestsByType?.map((r, i) => ({
    name: r._id, value: r.count, fill: COLORS[i % COLORS.length]
  })) || [];

  return (
    <PageTransition>
      <StaffNav />
      <div style={{ paddingTop: 88, minHeight: '100vh', maxWidth: 1300, margin: '0 auto', padding: '88px 24px 60px' }}>

        <FadeIn>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 28 }}>Admin Panel</h1>
        </FadeIn>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--navy-800)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              background: tab === t ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
              color: tab === t ? 'white' : '#94a3b8',
              border: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 600,
              transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── ANALYTICS ─── */}
          {tab === 'Analytics' && analytics && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StaggerContainer>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'Total Guests', value: analytics.totalGuests, icon: '👥', color: '#2563eb' },
                    { label: 'Checked In', value: analytics.checkedIn, icon: '🏨', color: '#00d4ff' },
                    { label: 'Occupancy Rate', value: `${analytics.occupancyRate}%`, icon: '📊', color: '#10b981' },
                    { label: 'Avg Rating', value: `${analytics.avgRating}⭐`, icon: '⭐', color: '#f59e0b' },
                    { label: 'Total Requests', value: analytics.totalRequests, icon: '📋', color: '#a78bfa' },
                    { label: 'Pending Requests', value: analytics.pendingRequests, icon: '⏳', color: '#ef4444' },
                  ].map((s, i) => (
                    <StaggerItem key={i}>
                      <div style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px' }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: s.color, marginTop: 8 }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 20, color: '#94a3b8' }}>GUEST CHECK-INS (LAST 7 DAYS)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.last7days}>
                      <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#475569' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Check-ins" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 20, color: '#94a3b8' }}>REQUESTS BY TYPE</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ROOMS ─── */}
          {tab === 'Rooms' && (
            <motion.div key="rooms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => setShowRoomForm(true)} className="btn-primary">+ Add Room</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {rooms.map((room, i) => (
                  <motion.div key={room._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#f1f5f9' }}>{room.roomNumber}</span>
                      <div style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: `${roomStatusColor[room.status]}15`,
                        color: roomStatusColor[room.status],
                        border: `1px solid ${roomStatusColor[room.status]}30`,
                      }}>{room.status}</div>
                    </div>
                    <p style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize', marginBottom: 4 }}>{room.type}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 14 }}>₹{room.price?.toLocaleString('en-IN')}<span style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>/night</span></p>
                    <button onClick={() => toggleRoomStatus(room)} style={{
                      width: '100%', padding: '8px', borderRadius: 8, fontSize: 12,
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                    }}>Toggle Status</button>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {showRoomForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                      style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%' }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Add New Room</h3>
                      <form onSubmit={addRoom}>
                        {[['Room Number', 'roomNumber', 'text', '101'], ['Price per Night (₹)', 'price', 'number', '2999'], ['Floor', 'floor', 'number', '1']].map(([label, name, type, ph]) => (
                          <div key={name} style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</label>
                            <input type={type} value={roomForm[name]} onChange={e => setRoomForm(f => ({ ...f, [name]: e.target.value }))} className="input-field" placeholder={ph} required={name !== 'floor'} />
                          </div>
                        ))}
                        <div style={{ marginBottom: 20 }}>
                          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Room Type</label>
                          <select value={roomForm.type} onChange={e => setRoomForm(f => ({ ...f, type: e.target.value }))} className="input-field" style={{ appearance: 'none' }}>
                            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button type="button" onClick={() => setShowRoomForm(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                          <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Add Room</button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── MENU ─── */}
          {tab === 'Menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => setShowMenuForm(true)} className="btn-primary">+ Add Item</button>
              </div>

              {MENU_CATS.filter(cat => menu.some(m => m.category === cat)).map(cat => (
                <div key={cat} style={{ marginBottom: 32 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 12 }}>{cat}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {menu.filter(m => m.category === cat).map((item, i) => (
                      <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.name}</div>
                          {item.description && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{item.description}</div>}
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>₹{item.price}</div>
                        </div>
                        <button onClick={() => deleteMenuItem(item._id)} style={{
                          width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: 14,
                        }}>×</button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {menu.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                  <p>No menu items yet. Add your first item.</p>
                </div>
              )}

              <AnimatePresence>
                {showMenuForm && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                      style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%' }}>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Add Menu Item</h3>
                      <form onSubmit={addMenuItem}>
                        {[['Item Name', 'name', 'text', 'e.g. Masala Chai'], ['Price (₹)', 'price', 'number', '99'], ['Description', 'description', 'text', 'Optional'], ['Prep Time (mins)', 'preparationTime', 'number', '10']].map(([label, name, type, ph]) => (
                          <div key={name} style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</label>
                            <input type={type} value={menuForm[name]} onChange={e => setMenuForm(f => ({ ...f, [name]: e.target.value }))} className="input-field" placeholder={ph} required={name !== 'description'} />
                          </div>
                        ))}
                        <div style={{ marginBottom: 20 }}>
                          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>Category</label>
                          <select value={menuForm.category} onChange={e => setMenuForm(f => ({ ...f, category: e.target.value }))} className="input-field" style={{ appearance: 'none' }}>
                            {MENU_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button type="button" onClick={() => setShowMenuForm(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                          <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Add Item</button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── STAFF ─── */}
          {tab === 'Staff' && (
            <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {staffList.map((s, i) => (
                  <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#60a5fa',
                    }}>{s.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{s.email}</div>
                      <div style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: s.role === 'admin' ? 'rgba(37,99,235,0.15)' : 'rgba(16,185,129,0.12)',
                        color: s.role === 'admin' ? '#60a5fa' : '#10b981',
                        border: `1px solid ${s.role === 'admin' ? 'rgba(37,99,235,0.25)' : 'rgba(16,185,129,0.2)'}`,
                      }}>{s.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {staffList.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <p>No staff accounts. Create one via the API with admin secret.</p>
                  <code style={{ fontSize: 12, color: '#60a5fa', display: 'block', marginTop: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                    POST /api/auth/staff/register
                  </code>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
