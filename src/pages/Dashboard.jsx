import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, PenLine, BookOpen, Clock, ArrowRight, Shuffle, Brain, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calcCourseProgress, getColorHex } from '../store/data';
import PageWrapper from '../components/PageWrapper';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 24);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { user, courses, weeklyPlan, activity } = useApp();
  const navigate = useNavigate();
  const [bonusUnlocked] = useState(false); // becomes true when weekly target is hit

  const totalHoursLogged = weeklyPlan?.hoursLogged || 0;
  const totalHoursTarget = weeklyPlan?.totalHoursAvailable || 6;
  const weekProgress = Math.min(Math.round((totalHoursLogged / totalHoursTarget) * 100), 100);
  const weekComplete = weekProgress >= 100;

  const pendingEssays = courses.flatMap(c =>
    c.resources.filter(r => r.completed && r.essayPrompt && !r.essayLink).map(r => ({ ...r, courseName: c.title, courseColor: c.color }))
  );

  const totalCompleted = courses.reduce((s, c) => s + c.resources.filter(r => r.completed).length, 0);
  const totalResources = courses.reduce((s, c) => s + c.resources.length, 0);

  const recentActivity = activity.slice(0, 3);

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem', fontFamily: 'Inter' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} ✦
        </motion.h1>
      </div>

      {/* Streak Row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div className="streak-badge">
          <Flame size={14} /> {user?.studyStreak} week study streak
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: 20, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)', fontSize: '0.8rem', fontWeight: 600, color: '#14b8a6' }}>
          <PenLine size={14} /> {user?.writingStreak} writing streak
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
        {[
          { icon: BookOpen, label: 'Active courses', value: courses.length, color: 'var(--accent)' },
          { icon: Clock,    label: 'Hours this week', value: totalHoursLogged, color: '#14b8a6', suffix: `/ ${totalHoursTarget}h` },
          { icon: Flame,    label: 'Resources done', value: totalCompleted, color: '#f59e0b', suffix: `/ ${totalResources}` },
          { icon: PenLine,  label: 'Essays written', value: activity.filter(a => a.type === 'essay').length, color: '#f43f5e' },
        ].map(({ icon: Icon, label, value, color, suffix }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <Icon size={18} style={{ color, marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
              <AnimatedNumber value={Math.round(value)} />
              {suffix && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 400 }}> {suffix}</span>}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>{label}</p>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* This Week */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.2rem' }}>This week</h3>
                <p style={{ margin: 0, fontSize: '0.78rem' }}>May 25 – 31, 2026</p>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }} onClick={() => navigate('/plan')}>
                View plan <ArrowRight size={13} />
              </button>
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{totalHoursLogged}h of {totalHoursTarget}h</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: weekComplete ? '#10b981' : 'var(--accent)' }}>{weekProgress}%</span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{ background: weekComplete ? '#10b981' : 'var(--accent)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {weeklyPlan?.assignments?.map(a => {
                const course = courses.find(c => c.id === a.courseId);
                if (!course) return null;
                const color = getColorHex(course.color);
                return (
                  <div key={a.courseId} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: 'var(--bg-secondary)', cursor: 'pointer' }}
                    onClick={() => navigate(`/courses/${course.id}`)}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{a.allocatedHours}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pending essays */}
          {pendingEssays.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="card" style={{ borderColor: 'rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertCircle size={15} style={{ color: '#f43f5e' }} />
                  <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#f43f5e' }}>Essays pending</h3>
                </div>
                {pendingEssays.slice(0, 2).map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: getColorHex(r.courseColor), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                    <PenLine size={13} style={{ color: '#f43f5e', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active courses */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h3>Courses</h3>
                <button className="btn-icon" onClick={() => navigate('/courses')}><ChevronRight size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {courses.map(course => {
                  const pct = calcCourseProgress(course);
                  const color = getColorHex(course.color);
                  return (
                    <div key={course.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{course.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{pct}%</span>
                      </div>
                      <div className="progress-track">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.6 }} style={{ background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h3>Recent</h3>
                <button className="btn-icon" onClick={() => navigate('/activity')}><ChevronRight size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentActivity.map(a => {
                  const course = courses.find(c => c.id === a.courseId);
                  const color = course ? getColorHex(course.color) : '#888';
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.type === 'essay' ? `Essay: ${a.essayTitle}` : a.resourceTitle}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bonus section — unlocks when week is complete */}
      <AnimatePresence>
        {(weekComplete || true) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, delay: weekComplete ? 0 : 0.6 }}
            style={{ marginTop: '1.75rem' }}
          >
            <div style={{ padding: '0.5rem 0 0.75rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', fontWeight: 500 }}>
                {weekComplete ? '✦ Bonus unlocked — you hit your weekly target' : '✦ Preview — complete your week to unlock'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: weekComplete ? 1 : 0.45 }}>
                <div className="card" style={{ cursor: weekComplete ? 'pointer' : 'default', borderStyle: weekComplete ? 'solid' : 'dashed', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shuffle size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Serendipity</p>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>Spin for a random resource</p>
                  </div>
                </div>
                <div className="card" style={{ cursor: weekComplete ? 'pointer' : 'default', borderStyle: weekComplete ? 'solid' : 'dashed', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(20,184,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Brain size={18} style={{ color: '#14b8a6' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Mood pick</p>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>Match material to your energy</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
