import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from '../components/PageTransition';

const stats = [
  { value: '74%', label: 'Faster Check-In' },
  { value: '35%', label: 'Better Service Response' },
  { value: '85%', label: 'Guest Satisfaction' },
  { value: '24/7', label: 'AI Concierge' },
];

const features = [
  {
    icon: '⚡',
    title: 'Digital Check-In',
    desc: 'Skip the queue. Enter your booking ID and get a digital room key in under 2 minutes.',
    color: '#2563eb',
  },
  {
    icon: '🤖',
    title: 'AI Concierge',
    desc: 'Order food, request housekeeping, report issues — all through natural conversation.',
    color: '#00d4ff',
  },
  {
    icon: '📊',
    title: 'Staff Dashboard',
    desc: 'Real-time request tracking with live updates and smart notifications for your team.',
    color: '#10b981',
  },
  {
    icon: '💳',
    title: 'Smart Checkout',
    desc: 'Automated billing with UPI, card, and net banking. Checkout in seconds.',
    color: '#f59e0b',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow orbs */}
        <div style={{
          position: 'fixed', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          top: -200, right: -100, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          bottom: 100, left: -100, pointerEvents: 'none',
        }} />

        {/* Nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '0 48px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'white',
            }}>H</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>Hotel OS</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/staff/login')} className="btn-ghost" style={{ padding: '8px 20px', fontSize: 13 }}>
              Staff Login
            </button>
            <button onClick={() => navigate('/checkin')} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
              Guest Check-In
            </button>
          </motion.div>
        </nav>

        {/* Hero */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '100px 24px 60px',
        }}>
          <FadeIn delay={0.1}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 20,
              background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
              marginBottom: 32, fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
              color: '#60a5fa', letterSpacing: '0.06em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              SMART HOTEL MANAGEMENT PLATFORM v1.0
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.0,
              marginBottom: 24, letterSpacing: '-0.03em',
            }}>
              The Future of<br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #00d4ff 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Hotel Experience</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <p style={{
              fontSize: 18, color: '#94a3b8', maxWidth: 560, lineHeight: 1.7,
              marginBottom: 48, fontFamily: 'Inter, sans-serif', fontWeight: 400,
            }}>
              AI-powered check-in, chatbot concierge, and real-time staff coordination —
              all in one cloud-native platform built for modern hospitality.
            </p>
          </FadeIn>

          <FadeIn delay={0.45}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <motion.button
                onClick={() => navigate('/checkin')}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 36px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
                  letterSpacing: '0.01em',
                }}>
                Guest Check-In →
              </motion.button>
              <motion.button
                onClick={() => navigate('/staff/login')}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 36px',
                  background: 'transparent', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}>
                Staff Portal
              </motion.button>
            </div>
          </FadeIn>
        </section>

        {/* Stats bar */}
        <FadeIn delay={0.5}>
          <div style={{
            maxWidth: 900, margin: '0 auto', padding: '0 24px 80px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
            background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {stats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                style={{
                  padding: '28px 24px', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: 'var(--navy-800)',
                }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 36, color: '#60a5fa', lineHeight: 1,
                }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Features */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 40, textAlign: 'center', marginBottom: 16,
            }}>Everything in one platform</h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 16, marginBottom: 60 }}>
              From arrival to departure — automated, seamless, delightful.
            </p>
          </FadeIn>

          <StaggerContainer>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {features.map((f, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.3)` }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: 'var(--navy-800)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 20, padding: '32px 28px', cursor: 'default',
                    }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${f.color}18`, border: `1px solid ${f.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, marginBottom: 20,
                    }}>{f.icon}</div>
                    <h3 style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18,
                      marginBottom: 10, color: '#f1f5f9',
                    }}>{f.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '40px 24px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          color: '#475569', fontSize: 13, fontFamily: 'Inter, sans-serif',
        }}>
          Hotel OS · Sharda University CSE Team · 2026
        </footer>
      </div>
    </PageTransition>
  );
}
