import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BookOpen, Clock, Target, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calcCourseProgress, calcWeeksRemaining, getColorHex, SUBJECT_COLORS, RESOURCE_TYPES } from '../store/data';
import PageWrapper from '../components/PageWrapper';

const PRIORITIES = ['Highest','High','Medium','Low'];

function AddCourseModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', color: 'indigo', weeklyHours: 2, priority: 1, targetWeeks: 12 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({ ...form, id: `c${Date.now()}`, resources: [], startDate: new Date().toISOString().split('T')[0] });
    onClose();
  };

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>New course</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Course title *</label>
            <input className="input" placeholder="e.g. Art History: The Renaissance" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label>Description</label>
            <textarea className="input" rows={2} placeholder="What will you explore?" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Weekly hours</label>
              <input className="input" type="number" min={0.5} max={20} step={0.5} value={form.weeklyHours} onChange={e => set('weeklyHours', parseFloat(e.target.value))} />
            </div>
            <div>
              <label>Target duration (weeks)</label>
              <input className="input" type="number" min={1} max={52} value={form.targetWeeks} onChange={e => set('targetWeeks', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label>Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', parseInt(e.target.value))} style={{ cursor: 'pointer' }}>
              {PRIORITIES.map((p, i) => <option key={p} value={i + 1}>{p}</option>)}
            </select>
          </div>
          <div>
            <label>Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {SUBJECT_COLORS.map(c => (
                <button key={c.id} type="button" onClick={() => set('color', c.id)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c.hex, border: form.color === c.id ? `3px solid var(--text-primary)` : '3px solid transparent',
                  cursor: 'pointer', transition: 'transform 0.15s', transform: form.color === c.id ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create course</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Courses() {
  const { courses, addCourse } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Courses</h1>
          <p style={{ marginTop: '0.3rem' }}>{courses.length} active {courses.length === 1 ? 'course' : 'courses'}</p>
        </div>
        <motion.button className="btn btn-primary" onClick={() => setShowAdd(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Plus size={16} /> New course
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {courses.map((course, i) => {
          const pct = calcCourseProgress(course);
          const weeksLeft = calcWeeksRemaining(course);
          const color = getColorHex(course.color);
          return (
            <motion.div key={course.id} className="card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ cursor: 'pointer', borderTop: `3px solid ${color}`, transition: 'all 0.2s' }}
              onClick={() => navigate(`/courses/${course.id}`)}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={17} style={{ color }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 20, background: `${color}18`, color }}>
                  Priority {course.priority}
                </span>
              </div>
              <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem', lineHeight: 1.3 }}>{course.title}</h3>
              <p style={{ fontSize: '0.8rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.resources.filter(r => r.completed).length} / {course.resources.length} resources</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }} style={{ background: color }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {course.weeklyHours}h/week
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Target size={12} /> ~{weeksLeft}w left
                  </span>
                </div>
                <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} onAdd={addCourse} />}
      </AnimatePresence>
    </PageWrapper>
  );
}
