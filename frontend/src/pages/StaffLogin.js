import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PageTransition, { FadeIn } from '../components/PageTransition';

export default function StaffLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginStaff } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/staff/login', form);
      loginStaff(res.data.token, res.data.staff);
      toast.success(`Welcome back, ${res.data.staff.name}!`);
      navigate(res.data.staff.role === 'admin' ? '/admin' : '/staff/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative',
      }}>
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse at 70% 30%, rgba(37,99,235,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <Link to="/" style={{ position: 'fixed', top: 24, left: 24, color: '#94a3b8', fontSize: 13, fontFamily: 'Syne, sans-serif' }}>← Home</Link>

        <FadeIn>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
                background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>👤</div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28 }}>Staff Portal</h1>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>Sign in to manage requests & operations</p>
            </div>

            <div style={{ background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field" placeholder="staff@hotel.com" required />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field" placeholder="••••••••" required />
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Signing In...' : 'Sign In →'}
                </motion.button>
              </form>

              <div style={{
                marginTop: 20, padding: '14px 16px', borderRadius: 10,
                background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)',
              }}>
                <p style={{ fontSize: 11, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>Demo Credentials</p>
                <p style={{ fontSize: 12, color: '#475569' }}>admin@hotel.com / admin123</p>
                <p style={{ fontSize: 12, color: '#475569' }}>staff@hotel.com / staff123</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
