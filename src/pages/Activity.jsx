import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Tag, ExternalLink, PenLine, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getColorHex } from '../store/data';
import PageWrapper from '../components/PageWrapper';

function MonthlyLetter({ activity, courses }) {
  const completions = activity.filter(a => a.type === 'completion');
  const essays = activity.filter(a => a.type === 'essay');
  const allTags = [...new Set(completions.flatMap(a => a.tags || []))];

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: '2rem', borderTop: '3px solid var(--accent)', background: 'var(--accent-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>What you know now — May 2026</h3>
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '1rem' }}>
        This month you completed {completions.length} {completions.length === 1 ? 'resource' : 'resources'} across {courses.length} courses{essays.length > 0 ? ` and wrote ${essays.length} ${essays.length === 1 ? 'essay' : 'essays'}` : ''}.
        Your thinking moved through ideas of {allTags.slice(0, 4).join(', ')}{allTags.length > 4 ? ', and more' : ''}.
      </p>
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {allTags.map(t => (
            <span key={t} className="tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.72rem' }}>
              <Tag size={9} /> {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ActivityEntry({ entry, course, i }) {
  const [expanded, setExpanded] = useState(false);
  const color = course ? getColorHex(course.color) : '#888';

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      style={{ borderLeft: `3px solid ${color}`, borderRadius: '0 14px 14px 0', padding: '0.9rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flex: 1, minWidth: 0 }}>
          <div style={{ marginTop: 2, flexShrink: 0 }}>
            {entry.type === 'essay'
              ? <PenLine size={16} style={{ color: '#f43f5e' }} />
              : <CheckCircle2 size={16} style={{ color }} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              {entry.type === 'essay' ? entry.essayTitle : entry.resourceTitle}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.date}</span>
              {course && <span style={{ fontSize: '0.72rem', color, fontWeight: 500 }}>{course.title}</span>}
              {entry.type === 'essay' && entry.link && (
                <a href={entry.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: '#f43f5e' }}>
                  <ExternalLink size={11} /> Read essay
                </a>
              )}
              {entry.type === 'essay' && <span style={{ fontSize: '0.68rem', padding: '0.12rem 0.5rem', borderRadius: 20, background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>Essay</span>}
            </div>
            {/* Tags inline */}
            {entry.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {entry.tags.map(t => (
                  <span key={t} className="tag" style={{ background: `${color}14`, color, border: `1px solid ${color}30`, fontSize: '0.68rem' }}>
                    <Tag size={9} /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {entry.note && (
          <button className="btn-icon" onClick={() => setExpanded(e => !e)} style={{ flexShrink: 0 }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && entry.note && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: `2px solid ${color}` }}>
              <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7 }}>"{entry.note}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Activity() {
  const { activity, courses } = useApp();

  return (
    <PageWrapper>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Activity</h1>
        <p style={{ marginTop: '0.3rem' }}>Your intellectual record</p>
      </div>

      <MonthlyLetter activity={activity} courses={courses} />

      <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontFamily: 'Inter', fontWeight: 500 }}>Recent</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {activity.map((entry, i) => {
          const course = courses.find(c => c.id === entry.courseId);
          return <ActivityEntry key={entry.id} entry={entry} course={course} i={i} />;
        })}
        {activity.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>Nothing here yet. Complete your first resource to start your record.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
