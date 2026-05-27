import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, CalendarDays, ScrollText, Network, Sun, Moon, LogOut, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses',  icon: BookOpen,        label: 'Courses' },
  { to: '/plan',     icon: CalendarDays,    label: 'Weekly Plan' },
  { to: '/activity', icon: ScrollText,      label: 'Activity' },
  { to: '/graph',    icon: Network,         label: 'Knowledge Graph' },
];

export default function Sidebar() {
  const { theme, toggleTheme, user } = useApp();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
        background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0', zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Luminary
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          your intellectual universe
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.875rem',
            fontWeight: 500, transition: 'all 0.15s',
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
            textDecoration: 'none',
          })}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div style={{ padding: '0 0.85rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 600, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.[0] || 'K'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>student & scholar</p>
          </div>
        </div>
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.875rem',
          background: 'transparent', color: 'var(--text-muted)', width: '100%', textAlign: 'left',
          transition: 'all 0.15s', border: 'none', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button onClick={() => navigate('/login')} style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.6rem 0.85rem', borderRadius: 10, fontSize: '0.875rem',
          background: 'transparent', color: 'var(--text-muted)', width: '100%', textAlign: 'left',
          transition: 'all 0.15s', border: 'none', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </motion.aside>
  );
}
