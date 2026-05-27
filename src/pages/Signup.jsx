import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { saveUser, getUser } from '../store/data';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    const user = getUser();
    saveUser({ ...user, name: form.name, email: form.email });
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <Sparkles size={32} style={{ color: 'var(--accent)' }} />
          </motion.div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Begin your journey</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create your intellectual universe</p>
        </div>
        <div className="modal" style={{ borderRadius: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Your name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Kanishma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>
            <div>
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>
            <div>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: '2.25rem' }} />
              </div>
            </div>
            {error && <p style={{ color: '#f43f5e', fontSize: '0.8rem' }}>{error}</p>}
            <motion.button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Start learning <ArrowRight size={16} />
            </motion.button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
