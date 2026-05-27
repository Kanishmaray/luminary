import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Clock, ExternalLink, Tag, PenLine, X, Plus, ChevronDown, ChevronUp, BookOpen, Video, Headphones, FileText, Film, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getColorHex, RESOURCE_TYPES, SUBJECT_COLORS } from '../store/data';
import PageWrapper from '../components/PageWrapper';

const TYPE_ICONS = { Book: BookOpen, Video, Podcast: Headphones, Essay: FileText, Documentary: Film, Article: Globe, Course: BookOpen, Other: Globe };

function ResourceIcon({ type, size = 15, color }) {
  const Icon = TYPE_ICONS[type] || Globe;
  return <Icon size={size} style={{ color }} />;
}

// Constellation SVG
function Constellation({ resources, color }) {
  const completed = resources.filter(r => r.completed);
  const total = resources.length;
  if (total === 0) return null;

  const W = 320, H = 180;
  const positions = resources.map((_, i) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const radius = Math.min(W, H) * 0.36;
    return { x: W / 2 + radius * Math.cos(angle), y: H / 2 + radius * Math.sin(angle) };
  });

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      {/* Lines between completed consecutive nodes */}
      {resources.map((r, i) => {
        if (!r.completed) return null;
        const next = resources[i + 1];
        if (!next?.completed) return null;
        return (
          <motion.line key={`l${i}`} x1={positions[i].x} y1={positions[i].y} x2={positions[i+1].x} y2={positions[i+1].y}
            stroke={color} strokeWidth={1} strokeOpacity={0.4}
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }} />
        );
      })}
      {/* Stars */}
      {resources.map((r, i) => {
        const { x, y } = positions[i];
        const done = r.completed;
        return (
          <g key={r.id}>
            {done && (
              <motion.circle cx={x} cy={y} r={10} fill={color} fillOpacity={0.1}
                animate={{ r: [10, 14, 10] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }} />
            )}
            <motion.circle cx={x} cy={y} r={done ? 5 : 3}
              fill={done ? color : 'none'} stroke={color} strokeWidth={1.5}
              strokeOpacity={done ? 1 : 0.4} fillOpacity={done ? 1 : 0}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 + 0.2 }} />
            <motion.text x={x} y={y + 16} textAnchor="middle" fontSize={8} fill={color} fillOpacity={done ? 0.7 : 0.3}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.4 }}>
              {i + 1}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}

// Completion modal
function CompleteModal({ resource, courseColor, onClose, onComplete }) {
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleKeyDown = e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } };

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal" initial={{ scale: 0.95, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Mark complete</h2>
            <p style={{ fontSize: '0.8rem', margin: 0, maxWidth: 380 }}>{resource.title}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resource.essayPrompt && (
            <div style={{ padding: '0.75rem', borderRadius: 10, background: 'var(--accent-soft)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                💡 Essay prompt: {resource.essayPrompt}
              </p>
            </div>
          )}
          <div>
            <label>Your note</label>
            <textarea className="input" rows={4} placeholder="What struck you? What confused you? What connects to something else?" value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <div>
            <label>Add to your knowledge vault (press Enter after each tag)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', minHeight: 44 }}>
              {tags.map(t => (
                <span key={t} className="tag" style={{ background: `${courseColor}20`, color: courseColor, border: `1px solid ${courseColor}40` }}>
                  {t} <button onClick={() => setTags(prev => prev.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0 0 2px', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleKeyDown} onBlur={addTag}
                placeholder={tags.length === 0 ? 'aesthetics, representation...' : ''} style={{ border: 'none', outline: 'none', background: 'none', fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1, minWidth: 120 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <motion.button className="btn btn-primary" onClick={() => onComplete({ note, tags })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ background: courseColor }}>
              <CheckCircle2 size={15} /> Add to vault ✦
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add Resource modal
function AddResourceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', type: 'Article', url: '', estimatedMins: 30, essayPrompt: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" initial={{ scale: 0.95, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2>Add resource</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!form.title.trim()) return; onAdd({ ...form, id: `r${Date.now()}`, order: Date.now(), completed: false, completedAt: null, note: null, tags: [], essayLink: null }); onClose(); }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Title *</label>
            <input className="input" placeholder="e.g. Ways of Seeing — John Berger" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)} style={{ cursor: 'pointer' }}>
                {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Est. time (mins)</label>
              <input className="input" type="number" min={5} max={600} value={form.estimatedMins} onChange={e => set('estimatedMins', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label>URL (optional)</label>
            <input className="input" type="url" placeholder="https://" value={form.url} onChange={e => set('url', e.target.value)} />
          </div>
          <div>
            <label>Essay prompt (optional)</label>
            <input className="input" placeholder="A question to answer after consuming this" value={form.essayPrompt} onChange={e => set('essayPrompt', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add resource</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, completeResource, updateCourses } = useApp();
  const course = courses.find(c => c.id === id);

  const [completing, setCompleting] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showAddResource, setShowAddResource] = useState(false);

  if (!course) return <PageWrapper><p>Course not found.</p></PageWrapper>;

  const color = getColorHex(course.color);
  const completed = course.resources.filter(r => r.completed);
  const pct = Math.round((completed.length / Math.max(course.resources.length, 1)) * 100);

  const handleComplete = ({ note, tags }) => {
    completeResource(id, completing.id, { note, tags });
    setCompleting(null);
  };

  const handleAddResource = (resource) => {
    const updated = courses.map(c => c.id === id ? { ...c, resources: [...c.resources, resource] } : c);
    updateCourses(updated);
  };

  const toggleExpand = rId => setExpanded(e => ({ ...e, [rId]: !e[rId] }));

  return (
    <PageWrapper>
      {/* Back */}
      <button onClick={() => navigate('/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
        <ArrowLeft size={15} /> Back to courses
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Priority {course.priority} · {course.weeklyHours}h/week</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{course.title}</h1>
          <p style={{ marginBottom: '1rem' }}>{course.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, maxWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completed.length} / {course.resources.length} complete</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
              </div>
              <div className="progress-track">
                <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ background: color }} />
              </div>
            </div>
          </div>
        </div>
        {/* Constellation */}
        <div style={{ flexShrink: 0, padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Constellation resources={course.resources} color={color} />
        </div>
      </div>

      {/* Resources */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Syllabus</h2>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => setShowAddResource(true)}>
          <Plus size={14} /> Add resource
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {course.resources.sort((a, b) => a.order - b.order).map((resource, i) => {
          const isExpanded = expanded[resource.id];
          return (
            <motion.div key={resource.id} className="card"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ borderLeft: `3px solid ${resource.completed ? color : 'var(--border)'}`, borderRadius: '0 12px 12px 0', padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <button onClick={() => !resource.completed && setCompleting(resource)}
                  style={{ background: 'none', border: 'none', cursor: resource.completed ? 'default' : 'pointer', flexShrink: 0, padding: '2px 0', color: resource.completed ? color : 'var(--border-strong)' }}>
                  {resource.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: resource.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: resource.completed ? 'none' : 'none' }}>
                      {i + 1}. {resource.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <ResourceIcon type={resource.type} size={12} color="var(--text-muted)" /> {resource.type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={11} /> {resource.estimatedMins < 60 ? `${resource.estimatedMins}m` : `${Math.round(resource.estimatedMins / 60 * 10) / 10}h`}
                    </span>
                    {resource.completed && resource.completedAt && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Done {resource.completedAt}</span>
                    )}
                    {resource.essayPrompt && !resource.essayLink && resource.completed && (
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 20, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', fontWeight: 500 }}>Essay due</span>
                    )}
                    {resource.essayLink && (
                      <a href={resource.essayLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: color }} onClick={e => e.stopPropagation()}>
                        <ExternalLink size={11} /> Essay
                      </a>
                    )}
                  </div>
                  {/* Tags */}
                  {resource.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      {resource.tags.map(t => (
                        <span key={t} className="tag" style={{ background: `${color}14`, color, border: `1px solid ${color}30`, fontSize: '0.68rem' }}>
                          <Tag size={9} /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {resource.note && (
                    <button className="btn-icon" onClick={() => toggleExpand(resource.id)}>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  )}
                  {!resource.completed && (
                    <button className="btn btn-ghost" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setCompleting(resource)}>
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded note */}
              <AnimatePresence>
                {isExpanded && resource.note && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: `2px solid ${color}` }}>
                      <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{resource.note}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {completing && (
          <CompleteModal resource={completing} courseColor={color} onClose={() => setCompleting(null)} onComplete={handleComplete} />
        )}
        {showAddResource && (
          <AddResourceModal onClose={() => setShowAddResource(false)} onAdd={handleAddResource} />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
