import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, getCourses, getWeeklyPlan, getActivity, saveUser, saveCourses, saveWeeklyPlan, saveActivity } from '../store/data';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('lum_theme') || 'dark');
  const [user, setUser] = useState(getUser);
  const [courses, setCourses] = useState(getCourses);
  const [weeklyPlan, setWeeklyPlan] = useState(getWeeklyPlan);
  const [activity, setActivity] = useState(getActivity);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lum_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const updateUser = useCallback(u => { saveUser(u); setUser(u); }, []);
  const updateCourses = useCallback(c => { saveCourses(c); setCourses(c); }, []);
  const updateWeeklyPlan = useCallback(w => { saveWeeklyPlan(w); setWeeklyPlan(w); }, []);
  const updateActivity = useCallback(a => { saveActivity(a); setActivity(a); }, []);

  const addCourse = useCallback(course => {
    const updated = [...courses, course];
    updateCourses(updated);
  }, [courses, updateCourses]);

  const completeResource = useCallback((courseId, resourceId, { note, tags, essayLink }) => {
    const updated = courses.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        resources: c.resources.map(r => {
          if (r.id !== resourceId) return r;
          return { ...r, completed: true, completedAt: new Date().toISOString().split('T')[0], note, tags };
        }),
      };
    });
    updateCourses(updated);
    const course = courses.find(c => c.id === courseId);
    const resource = course?.resources.find(r => r.id === resourceId);
    const newEntry = {
      id: `a${Date.now()}`, type: 'completion', resourceId, courseId,
      date: new Date().toISOString().split('T')[0],
      resourceTitle: resource?.title || '', note, tags,
    };
    updateActivity([newEntry, ...activity]);
    const newStreak = user.studyStreak + 1;
    updateUser({ ...user, studyStreak: newStreak });
  }, [courses, activity, user, updateCourses, updateActivity, updateUser]);

  const addEssayLink = useCallback((courseId, resourceId, link, essayTitle) => {
    const updated = courses.map(c => {
      if (c.id !== courseId) return c;
      return { ...c, resources: c.resources.map(r => r.id === resourceId ? { ...r, essayLink: link } : r) };
    });
    updateCourses(updated);
    const newEntry = {
      id: `a${Date.now()}`, type: 'essay', resourceId, courseId,
      date: new Date().toISOString().split('T')[0],
      essayTitle, link,
    };
    updateActivity([newEntry, ...activity]);
    updateUser({ ...user, writingStreak: user.writingStreak + 1 });
  }, [courses, activity, user, updateCourses, updateActivity, updateUser]);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, user, courses, weeklyPlan, activity,
      addCourse, completeResource, addEssayLink, updateCourses, updateWeeklyPlan,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
