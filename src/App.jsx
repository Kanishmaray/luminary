import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import StarField from './components/StarField';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import WeeklyPlan from './pages/WeeklyPlan';
import Activity from './pages/Activity';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AppShell() {
  const location = useLocation();
  const { theme } = useApp();
  const isAuth = ['/login', '/signup'].includes(location.pathname);

  if (isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <StarField />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <StarField />
      <Sidebar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/courses"    element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/plan"       element={<WeeklyPlan />} />
            <Route path="/activity"   element={<Activity />} />
            <Route path="/graph"      element={<KnowledgeGraph />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
