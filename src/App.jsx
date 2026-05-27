import{BrowserRouter,Routes,Route,Navigate,useLocation}from'react-router-dom';
import{AppProvider,useApp}from'./context/AppContext';
import TopNav from'./components/TopNav';
import StarField from'./components/StarField';
import Dashboard from'./pages/Dashboard';
import Courses from'./pages/Courses';
import CourseDetail from'./pages/CourseDetail';
import WeeklyPlan from'./pages/WeeklyPlan';
import Activity from'./pages/Activity';
import KnowledgeGraph from'./pages/KnowledgeGraph';
import Login from'./pages/Login';
import Signup from'./pages/Signup';

function AuthGate({children}){
  const{session}=useApp();
  const location=useLocation();
  if(!session)return<Navigate to="/login" state={{from:location}} replace/>;
  return children;
}

function AppShell(){
  const{session}=useApp();
  const location=useLocation();
  const isAuth=['/login','/signup'].includes(location.pathname);

  return(
    <div className="app-shell">
      <StarField/>
      {!isAuth&&session&&<TopNav/>}
      <main className={isAuth?undefined:'main-content'}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login"  element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/"       element={<AuthGate><Dashboard/></AuthGate>}/>
          <Route path="/courses"    element={<AuthGate><Courses/></AuthGate>}/>
          <Route path="/courses/:id" element={<AuthGate><CourseDetail/></AuthGate>}/>
          <Route path="/plan"       element={<AuthGate><WeeklyPlan/></AuthGate>}/>
          <Route path="/activity"   element={<AuthGate><Activity/></AuthGate>}/>
          <Route path="/graph"      element={<AuthGate><KnowledgeGraph/></AuthGate>}/>
          <Route path="*"           element={<Navigate to="/"/>}/>
        </Routes>
      </main>
    </div>
  );
}

export default function App(){
  return(
    <AppProvider>
      <BrowserRouter basename="/luminary">
        <AppShell/>
      </BrowserRouter>
    </AppProvider>
  );
}
