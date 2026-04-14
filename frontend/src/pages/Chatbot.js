import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import GuestNav from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const WELCOME = "Hello! I'm your AI Concierge. I can help you:\n\n🍽️ Order food & beverages\n🧹 Schedule housekeeping\n🔧 Report maintenance issues\n📍 Recommend local attractions\n\nWhat can I do for you today?";

const SUGGESTIONS = [
  "Order 2 coffees to my room",
  "Schedule housekeeping at 3 PM",
  "Report AC not working",
  "What restaurants are nearby?",
  "Request extra towels",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
      ))}
    </div>
  );
}

function ChatBubble({ msg, isNew }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 12, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.34, 1.2, 0.64, 1] }}
      style={{
        display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginRight: 10,
          background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, alignSelf: 'flex-end',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
          : 'rgba(30, 45, 82, 0.6)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
        fontSize: 14, lineHeight: 1.6, color: '#f1f5f9',
        whiteSpace: 'pre-wrap',
        backdropFilter: isUser ? 'none' : 'blur(12px)',
      }}>
        {msg.content}
        {msg.intent && msg.intent !== 'general' && !isUser && (
          <div style={{
            marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11, color: '#60a5fa', letterSpacing: '0.04em', fontWeight: 600,
          }}>
            ✓ {msg.intent.toUpperCase()} REQUEST CREATED
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Chatbot() {
  const { guest } = useAuth();
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME, isNew: false }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, isNew: true }]);
    setLoading(true);
    try {
      const res = await API.post('/chat/message', {
        message: msg, sessionId, guestName: guest?.name,
      });
      setSessionId(res.data.sessionId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply.replace(/^(ORDER_FOOD:|HOUSEKEEPING:|MAINTENANCE:)[^\n]+\n?/, '').trim(),
        intent: res.data.intent,
        isNew: true,
      }]);
      if (res.data.actionCreated) toast.success('Request sent to staff!');
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble right now. Please try again or contact the front desk at extension 0.",
        isNew: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <PageTransition>
      <GuestNav />
      <div style={{
        paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column',
        maxWidth: 800, margin: '0 auto',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(10,15,30,0.6)', backdropFilter: 'blur(20px)',
          }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🤖</div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>AI Concierge</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#10b981' }}>Online · Available 24/7</span>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, i) => <ChatBubble key={i} msg={msg} isNew={msg.isNew} />)}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(30,45,82,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {SUGGESTIONS.map((s, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => sendMessage(s)}
              style={{
                padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
                color: '#93c5fd', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                flexShrink: 0,
              }}>{s}</motion.button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 24px 24px',
          background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything... (Enter to send)"
              rows={1}
              style={{
                flex: 1, padding: '14px 16px', background: 'var(--navy-800)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                color: '#f1f5f9', fontSize: 14, resize: 'none', outline: 'none',
                fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <motion.button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              whileHover={input.trim() && !loading ? { scale: 1.06 } : {}}
              whileTap={{ scale: 0.94 }}
              style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(37,99,235,0.2)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, transition: 'all 0.2s',
                boxShadow: input.trim() ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
              }}>→</motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
