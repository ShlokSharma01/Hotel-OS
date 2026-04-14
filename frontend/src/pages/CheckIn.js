import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PageTransition, { FadeIn } from '../components/PageTransition';

const steps = ['Booking Details', 'Identity', 'Confirmation'];

export default function CheckIn() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const [form, setForm] = useState({
    bookingId: '', email: '', name: '', phone: '', roomNumber: '', nights: 1,
  });
  const { loginGuest } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.bookingId || !form.email) return toast.error('Please fill in all fields');
    setStep(1);
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/guest/checkin', form);
      loginGuest(res.data.token, res.data.guest);
      setGuestData(res.data.guest);
      setStep(2);
      toast.success('Welcome! Check-in successful 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        position: 'relative',
      }}>
        {/* bg */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,212,255,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <Link to="/" style={{
          position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 8,
          color: '#94a3b8', fontSize: 13, fontFamily: 'Syne, sans-serif',
        }}>← Back</Link>

        <FadeIn>
          <div style={{ width: '100%', maxWidth: 480 }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'white',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
              }}>H</div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28 }}>
                Guest Check-In
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>Digital check-in — no queues, no paperwork</p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, padding: '0 8px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i < step ? '#10b981' : i === step ? '#2563eb' : '#162040',
                      border: `2px solid ${i < step ? '#10b981' : i === step ? '#2563eb' : '#1e2d52'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: i <= step ? 'white' : '#475569',
                      transition: 'all 0.3s',
                    }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize: 11, marginTop: 6,
                      color: i === step ? '#60a5fa' : '#475569',
                      fontFamily: 'Inter, sans-serif', fontWeight: 500,
                    }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      height: 1, flex: 0.5,
                      background: i < step ? '#10b981' : '#1e2d52',
                      transition: 'background 0.3s', marginTop: -16,
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'var(--navy-800)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
                    Enter Booking Details
                  </h2>
                  <form onSubmit={handleStep1}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Booking ID
                      </label>
                      <input name="bookingId" value={form.bookingId} onChange={handleChange}
                        className="input-field" placeholder="e.g. BK-2024-001" required />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Email Address
                      </label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        className="input-field" placeholder="your@email.com" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Room Number</label>
                        <input name="roomNumber" value={form.roomNumber} onChange={handleChange}
                          className="input-field" placeholder="e.g. 204" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Nights</label>
                        <input name="nights" type="number" min="1" value={form.nights} onChange={handleChange}
                          className="input-field" />
                      </div>
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                      Continue →
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'var(--navy-800)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
                    Identity Verification
                  </h2>
                  <form onSubmit={handleCheckIn}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Full Name</label>
                      <input name="name" value={form.name} onChange={handleChange}
                        className="input-field" placeholder="As on ID proof" required />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Phone Number</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        className="input-field" placeholder="+91 98765 43210" />
                    </div>
                    <div style={{
                      border: '2px dashed rgba(37,99,235,0.3)', borderRadius: 12,
                      padding: 24, textAlign: 'center', marginBottom: 24,
                      background: 'rgba(37,99,235,0.04)',
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                      <p style={{ color: '#94a3b8', fontSize: 13 }}>Upload Aadhaar / Passport</p>
                      <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>JPG, PNG or PDF · Max 5MB</p>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} id="idUpload" />
                      <label htmlFor="idUpload" style={{
                        display: 'inline-block', marginTop: 12, padding: '8px 16px',
                        background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
                        borderRadius: 8, fontSize: 12, color: '#60a5fa', cursor: 'pointer',
                      }}>Choose File</label>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="button" onClick={() => setStep(0)} className="btn-ghost"
                        style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                        ← Back
                      </button>
                      <motion.button type="submit" disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}
                        className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Checking In...' : 'Complete Check-In ✓'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 2 && guestData && (
                <motion.div key="step2"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ background: 'var(--navy-800)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    style={{
                      width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                      background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32,
                    }}>✓</motion.div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 8, color: '#10b981' }}>
                    Check-In Complete!
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>Welcome, {guestData.name}!</p>

                  <div style={{
                    background: 'var(--navy-900)', borderRadius: 16, padding: 24,
                    border: '1px solid var(--border)', marginBottom: 28, textAlign: 'left',
                  }}>
                    {[
                      ['Room Number', guestData.roomNumber],
                      ['Room PIN', guestData.roomPin],
                      ['Check-In', new Date(guestData.checkIn).toLocaleDateString()],
                      ['Check-Out', new Date(guestData.checkOut).toLocaleDateString()],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>{k}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#60a5fa', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {guestData.roomQR && (
                    <div style={{ marginBottom: 28 }}>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Digital Room Key</p>
                      <img src={guestData.roomQR} alt="Room QR" style={{ width: 140, height: 140, borderRadius: 12, border: '1px solid var(--border)' }} />
                    </div>
                  )}

                  <motion.button
                    onClick={() => navigate('/guest')}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    Go to My Dashboard →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
