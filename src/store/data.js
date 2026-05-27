export const SUBJECT_COLORS = [
  { id: 'indigo',  label: 'Indigo',  hex: '#6366f1' },
  { id: 'rose',    label: 'Rose',    hex: '#f43f5e' },
  { id: 'teal',    label: 'Teal',    hex: '#14b8a6' },
  { id: 'amber',   label: 'Amber',   hex: '#f59e0b' },
  { id: 'violet',  label: 'Violet',  hex: '#8b5cf6' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'coral',   label: 'Coral',   hex: '#fb7185' },
  { id: 'sky',     label: 'Sky',     hex: '#0ea5e9' },
];

export const RESOURCE_TYPES = ['Article','Book','Video','Podcast','Essay','Course','Documentary','Other'];

const SEED = {
  user: { name: 'Kanishma', email: 'kanishmaray@gmail.com', studyStreak: 7, writingStreak: 3, joinedAt: '2026-05-01', defaultWeeklyHours: 6 },
  courses: [
    {
      id: 'c1', title: 'Art History: The Western Canon',
      description: 'From cave paintings to the Baroque — tracing the evolution of visual art through Western civilisation.',
      color: 'rose', weeklyHours: 3, priority: 1, targetWeeks: 12, startDate: '2026-05-05',
      resources: [
        { id: 'r1', title: 'Ways of Seeing — John Berger', type: 'Book', url: '', estimatedMins: 240, order: 1, completed: true, completedAt: '2026-05-10', note: "Berger's argument about the male gaze completely reframed how I look at Renaissance nudes. The idea that women are depicted as conscious of being seen changes everything.", tags: ['gaze','gender','representation','power'], essayPrompt: 'How does the concept of the gaze shape your interpretation of a specific artwork?', essayLink: 'https://kanishmaray.substack.com/p/ways-of-seeing' },
        { id: 'r2', title: 'The Story of Art — E.H. Gombrich (Ch. 1–5)', type: 'Book', url: '', estimatedMins: 180, order: 2, completed: true, completedAt: '2026-05-14', note: 'The idea that there is no such thing as Art, only artists — humble and radical at the same time.', tags: ['historiography','artists','perception'], essayPrompt: null, essayLink: null },
        { id: 'r3', title: 'Cave Art and the Origins of Image-Making', type: 'Video', url: '', estimatedMins: 45, order: 3, completed: true, completedAt: '2026-05-17', note: "The handprints at Chauvet feel like someone saying 'I was here.' 36,000 years of the same human impulse.", tags: ['prehistory','origins','identity'], essayPrompt: null, essayLink: null },
        { id: 'r4', title: "On the Museum's Ruins — Douglas Crimp", type: 'Essay', url: '', estimatedMins: 60, order: 4, completed: true, completedAt: '2026-05-21', note: 'Postmodern critique of the museum as a space of power. Connects directly to Berger on institutional framing.', tags: ['museum','power','postmodernism','institutional critique'], essayPrompt: null, essayLink: null },
        { id: 'r5', title: 'The Renaissance: Was It a Thing? — Crash Course', type: 'Video', url: '', estimatedMins: 15, order: 5, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
        { id: 'r6', title: "Lives of the Artists — Giorgio Vasari (selections)", type: 'Book', url: '', estimatedMins: 120, order: 6, completed: false, completedAt: null, note: null, tags: [], essayPrompt: 'Choose one artist from Vasari and argue whether his account reveals more about the artist or about Vasari himself.', essayLink: null },
        { id: 'r7', title: 'The Botticelli Syndrome — podcast ep.', type: 'Podcast', url: '', estimatedMins: 50, order: 7, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
        { id: 'r8', title: 'Michelangelo and the Sistine Chapel', type: 'Documentary', url: '', estimatedMins: 90, order: 8, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
      ],
    },
    {
      id: 'c2', title: 'Philosophy of Mind',
      description: "Consciousness, perception, free will, and the hard problem. What does it mean to have an inner life?",
      color: 'violet', weeklyHours: 2, priority: 2, targetWeeks: 16, startDate: '2026-05-12',
      resources: [
        { id: 'r9', title: 'What Is It Like to Be a Bat? — Thomas Nagel', type: 'Essay', url: '', estimatedMins: 45, order: 1, completed: true, completedAt: '2026-05-15', note: "Nagel's point about subjective experience being irreducible to physical description is the most haunting thing I've read this year.", tags: ['consciousness','qualia','subjectivity','phenomenology'], essayPrompt: null, essayLink: null },
        { id: 'r10', title: 'The Hard Problem of Consciousness — David Chalmers', type: 'Essay', url: '', estimatedMins: 60, order: 2, completed: true, completedAt: '2026-05-20', note: 'The distinction between easy and hard problems is deceptively simple but completely shifts the terrain of the debate.', tags: ['consciousness','hard problem','Chalmers','explanatory gap'], essayPrompt: 'Do you think the hard problem is a genuine philosophical problem or a category error?', essayLink: null },
        { id: 'r11', title: "Descartes' Error — Antonio Damasio (Ch. 1–4)", type: 'Book', url: '', estimatedMins: 150, order: 3, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
        { id: 'r12', title: 'The Embodied Mind — Varela, Thompson, Rosch', type: 'Book', url: '', estimatedMins: 200, order: 4, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
      ],
    },
    {
      id: 'c3', title: 'Aesthetics',
      description: "What is beauty? What makes something art? From Kant's disinterested pleasure to contemporary aesthetics.",
      color: 'teal', weeklyHours: 1, priority: 3, targetWeeks: 10, startDate: '2026-05-19',
      resources: [
        { id: 'r13', title: 'Critique of Judgement — Kant (§§1–22)', type: 'Book', url: '', estimatedMins: 180, order: 1, completed: true, completedAt: '2026-05-24', note: "Kant's claim that aesthetic judgements are universal yet subjective — that when I say 'this is beautiful' I am implicitly demanding agreement — is wild. It connects to Berger in an unexpected way.", tags: ['beauty','aesthetics','Kant','universality','subjectivity'], essayPrompt: null, essayLink: null },
        { id: 'r14', title: 'The Aesthetic Dimension — Herbert Marcuse', type: 'Book', url: '', estimatedMins: 120, order: 2, completed: false, completedAt: null, note: null, tags: [], essayPrompt: null, essayLink: null },
      ],
    },
  ],
  weeklyPlan: {
    weekStart: '2026-05-25', weekEnd: '2026-05-31',
    totalHoursAvailable: 6, hoursLogged: 2.5,
    assignments: [
      { courseId: 'c1', resourceIds: ['r5','r6'], allocatedHours: 2.5 },
      { courseId: 'c2', resourceIds: ['r11'], allocatedHours: 2 },
      { courseId: 'c3', resourceIds: ['r14'], allocatedHours: 1.5 },
    ],
  },
  activityLog: [
    { id: 'a1', type: 'completion', resourceId: 'r13', courseId: 'c3', date: '2026-05-24', resourceTitle: 'Critique of Judgement — Kant', note: "Kant's claim that aesthetic judgements are universal yet subjective is wild.", tags: ['beauty','Kant','aesthetics','universality'] },
    { id: 'a2', type: 'completion', resourceId: 'r10', courseId: 'c2', date: '2026-05-20', resourceTitle: 'The Hard Problem of Consciousness — Chalmers', note: 'The distinction between easy and hard problems completely shifts the terrain.', tags: ['consciousness','Chalmers','hard problem'] },
    { id: 'a3', type: 'essay', resourceId: 'r1', courseId: 'c1', date: '2026-05-18', resourceTitle: 'Ways of Seeing', essayTitle: 'The Gaze and the Canvas', link: 'https://kanishmaray.substack.com/p/ways-of-seeing' },
    { id: 'a4', type: 'completion', resourceId: 'r4', courseId: 'c1', date: '2026-05-21', resourceTitle: "On the Museum's Ruins — Douglas Crimp", note: 'Postmodern critique of the museum as a space of power.', tags: ['museum','power','postmodernism'] },
    { id: 'a5', type: 'completion', resourceId: 'r3', courseId: 'c1', date: '2026-05-17', resourceTitle: 'Cave Art and the Origins of Image-Making', note: "The handprints at Chauvet feel like someone saying 'I was here.'", tags: ['prehistory','origins','identity'] },
  ],
};

function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export const getUser = () => load('lum_user', SEED.user);
export const getCourses = () => load('lum_courses', SEED.courses);
export const getWeeklyPlan = () => load('lum_weekly', SEED.weeklyPlan);
export const getActivity = () => load('lum_activity', SEED.activityLog);
export const saveUser = u => save('lum_user', u);
export const saveCourses = c => save('lum_courses', c);
export const saveWeeklyPlan = w => save('lum_weekly', w);
export const saveActivity = a => save('lum_activity', a);

export const getCourseById = id => getCourses().find(c => c.id === id);
export const getColorHex = colorId => SUBJECT_COLORS.find(c => c.id === colorId)?.hex || '#6366f1';

export function calcCourseProgress(course) {
  if (!course.resources?.length) return 0;
  return Math.round((course.resources.filter(r => r.completed).length / course.resources.length) * 100);
}

export function calcWeeksRemaining(course) {
  const remaining = course.resources?.filter(r => !r.completed) || [];
  const totalMins = remaining.reduce((s, r) => s + (r.estimatedMins || 60), 0);
  const hoursPerWeek = course.weeklyHours || 1;
  return Math.ceil((totalMins / 60) / hoursPerWeek);
}

export function getKnowledgeGraphData() {
  const courses = getCourses();
  const nodes = [], links = [], tagMap = {};
  courses.forEach(course => {
    (course.resources || []).filter(r => r.completed && r.tags?.length).forEach(resource => {
      nodes.push({ id: resource.id, label: resource.title.split('—')[0].trim(), type: 'resource', courseId: course.id, color: getColorHex(course.color) });
      resource.tags.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = { connectedResources: [] };
        tagMap[tag].connectedResources.push(resource.id);
      });
    });
  });
  Object.entries(tagMap).forEach(([tag, data]) => {
    const nodeId = `tag_${tag}`;
    nodes.push({ id: nodeId, label: tag, type: 'concept', color: '#888' });
    data.connectedResources.forEach(rId => links.push({ source: rId, target: nodeId }));
  });
  return { nodes, links };
}
