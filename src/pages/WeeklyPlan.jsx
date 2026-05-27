import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getColorHex, calcWeeksRemaining } from '../store/data';
import PageWrapper from '../components/PageWrapper';

export default function WeeklyPlan() {
  const { courses, weeklyPlan, updateWeeklyPlan, user } = useApp();
  const navigate = useNavigate();
  const [hours, setHours] = useState(weeklyPlan?.totalHoursAvailable || user?.defaultWeeklyHours || 6);

  const totalHoursTarget = hours;
  const hoursLogged = weeklyPlan?.hoursLogged || 0;
  const weekProgress = Math.min(Math.round((hoursLogged / totalHoursTarget) * 100), 100);

  // Calculate recommended allocation
  const totalPriorityWeight = courses.reduce((s, c) => s + (5 - c.priority), 0);
  const recommendations = courses.map(course => {
    const weight = (5 - course.priority) / Math.max(totalPriorityWeight, 1);
    const allocated = Math.round(totalHoursTarget * weight * 10) / 10;
    const weeksLeft = calcWeeksRemaining(course);
    const color = getColorHex(course.color);
    const nextResources = course.resources.filter(r => !r.completed).slice(0, 2);
    return { course, allocated, weeksLeft, color, nextResources };
  });

  const handleHoursChange = (val) => {
    setHours(val);
    updateWeeklyPlan({ ...weeklyPlan, totalHoursAvailable: val });
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Weekly plan</h1>
          <p style={{ marginTop: '0.3rem' }}>Week of May 25 – 31, 2026</p>
        </div>
      </div>

      {/* Hours budget */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>This week's budget</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hours available:</span>
            <input type="number" min={1} max={40} step={0.5} value={hours} onChange={e => handleHoursChange(parseFloat(e.target.value))}
              style={{ width: 70, padding: '0.35rem 0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', outline: 'none' }} />
          </div>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hoursLogged}h logged of {totalHoursTarget}h</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: weekProgress >= 100 ? '#10b981' : 'var(--accent)' }}>{weekProgress}%</span>
          </div>
          <div className="progress-track" style={{ height: 6 }}>
            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${weekProgress}%` }} transition={{ duration: 1 }} style={{ background: weekProgress >= 100 ? '#10b981' : 'var(--accent)' }} />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recommended this week</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {recommendations.map(({ course, allocated, weeksLeft, color, nextResources }, i) => (
          <motion.div key={course.id} className="card" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            style={{ borderLeft: `3px solid ${color}`, borderRadius: '0 14px 14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <h3 style={{ fontSize: '0.95rem', margin: 0 }}>{course.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginLeft: '1.15rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {allocated}h recommended
                  </span>
                  <span style={{ fontSize: '0.75rem', color: weeksLeft <= 2 ? '#f43f5e' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {weeksLeft <= 2 && <AlertTriangle size={12} />}
                    ~{weeksLeft}w to completion
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', flexShrink: 0 }} onClick={() => navigate(`/courses/${course.id}`)}>
                Open <ChevronRight size={13} />
              </button>
            </div>

            {nextResources.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginLeft: '1.15rem' }}>
                {nextResources.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--border-strong)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 'auto' }}>{r.estimatedMins < 60 ? `${r.estimatedMins}m` : `${Math.round(r.estimatedMins / 60 * 10) / 10}h`}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Deviation note */}
      <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <RotateCcw size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you spend more time on one course this week, Luminary will automatically recalculate the remaining weeks needed for all others. Your plans adjust — they don't break.
        </p>
      </div>
    </PageWrapper>
  );
}
