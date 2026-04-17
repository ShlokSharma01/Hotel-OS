import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import GuestNav from '../components/Navbar';
import PageTransition, { FadeIn } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <motion.button key={s} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
          onClick={() => onChange(s)}
          style={{
            fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
            filter: s <= value ? 'none' : 'grayscale(1) opacity(0.3)',
            transition: 'filter 0.2s',
          }}>⭐</motion.button>
      ))}
    </div>
  );
}

export default function Checkout() {
  const { guest, logoutGuest } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '', categories: { checkin: 0, service: 0, cleanliness: 0, food: 0 } });

  useEffect(() => {
    if (!guest?._id) return;
    API.get(`/billing/${guest._id}`)
      .then(r => setBilling(r.data))
      .catch(() => toast.error('Could not load bill'))
      .finally(() => setLoading(false));
  }, [guest]);

  const handlePayment = async () => {
    if (!billing) return;
    setPaying(true);
    try {
      const res = await API.post('/payment/initiate', { amount: billing.breakdown.total });
      const { orderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId,
        amount, currency,
        name: 'Hotel OS',
        description: `Room ${guest.roomNumber} · ${billing.nights} Night${billing.nights !== 1 ? 's' : ''}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            });
            setPaid(true);
            setShowFeedback(true);
            toast.success('Payment successful! Thank you for staying with us 🎉');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: guest.name, email: guest.email },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  const submitFeedback = async () => {
    if (feedback.rating === 0) return toast.error('Please rate your stay');
    try {
      await API.post('/feedback', feedback);
      toast.success('Thank you for your feedback!');
      logoutGuest();
      navigate('/');
    } catch { toast.error('Could not submit feedback'); }
  };

  if (loading) return (
    <PageTransition>
      <GuestNav />
      <div style={{ paddingTop: 88, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb' }} />
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <GuestNav />
      <div style={{ paddingTop: 88, minHeight: '100vh', maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>

        <FadeIn>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>Checkout</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>Review your stay and complete payment</p>
        </FadeIn>

        {billing && (
          <FadeIn delay={0.1}>
            {/* Stay Summary */}
            <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 20, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Stay Summary</h2>
              {[
                ['Guest', billing.guest.name],
                ['Room', billing.guest.roomNumber],
                ['Check-In', new Date(billing.checkIn).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })],
                ['Check-Out', new Date(billing.checkOut).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })],
                ['Duration', `${billing.nights} Night${billing.nights !== 1 ? 's' : ''}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 20, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Bill Breakdown</h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Room Charges (₹{billing.breakdown.pricePerNight?.toLocaleString('en-IN')}/night × {billing.nights})</span>
                <span style={{ fontSize: 13 }}>₹{billing.breakdown.roomCharge?.toLocaleString('en-IN')}</span>
              </div>

              {billing.breakdown.serviceRequests?.map((sr, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>🍽️ {sr.description}</span>
                  <span style={{ fontSize: 13 }}>₹{sr.amount?.toLocaleString('en-IN') || 0}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>GST & Taxes (12%)</span>
                <span style={{ fontSize: 13 }}>₹{billing.breakdown.taxes?.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>Total Amount</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#60a5fa' }}>
                  ₹{billing.breakdown.total?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {!paid && (
              <FadeIn delay={0.2}>
                <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 16, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Payment Method</h2>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                    {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map(m => (
                      <div key={m} style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                        fontSize: 12, color: '#93c5fd',
                      }}>{m}</div>
                    ))}
                  </div>
                  <motion.button onClick={handlePayment} disabled={paying}
                    whileHover={!paying ? { scale: 1.02, y: -2 } : {}} whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 15, opacity: paying ? 0.7 : 1 }}>
                    {paying ? 'Opening Payment...' : `Pay ₹${billing.breakdown.total?.toLocaleString('en-IN')} via Razorpay`}
                  </motion.button>
                  <p style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 10 }}>
                    🔒 Secured by Razorpay · PCI DSS Compliant
                  </p>
                </div>
              </FadeIn>
            )}
          </FadeIn>
        )}

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(2,8,23,0.85)',
                backdropFilter: 'blur(12px)', zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              }}>
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                  background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center',
                }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
                  Payment Successful!
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>
                  Thank you for staying with us. How was your experience?
                </p>

                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Overall Rating</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <StarRating value={feedback.rating} onChange={r => setFeedback(f => ({ ...f, rating: r }))} />
                  </div>
                </div>

                <textarea
                  value={feedback.comment}
                  onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Tell us about your stay... (optional)"
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', background: 'var(--navy-900)',
                    border: '1px solid var(--border-bright)', borderRadius: 12,
                    color: '#f1f5f9', fontSize: 13, resize: 'none', outline: 'none',
                    fontFamily: 'Inter, sans-serif', marginBottom: 20,
                  }} />

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { logoutGuest(); navigate('/'); }} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                    Skip
                  </button>
                  <button onClick={submitFeedback} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    Submit & Leave ✓
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
