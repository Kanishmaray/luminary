import{createContext,useContext,useState,useEffect,useCallback}from'react';
import{getStoredUser,saveStoredUser,getSession,saveSession,clearSession,getCourses,getWeeklyPlan,getActivity,saveCourses,saveWeeklyPlan,saveActivity,hashPassword}from'../store/data';

const AppContext=createContext(null);

export function AppProvider({children}){
  const[theme,setTheme]=useState(()=>localStorage.getItem('lum_theme')||'dark');
  const[session,setSession]=useState(getSession);
  const[courses,setCourses]=useState(getCourses);
  const[weeklyPlan,setWeeklyPlan]=useState(getWeeklyPlan);
  const[activity,setActivity]=useState(getActivity);

  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('lum_theme',theme);},[theme]);

  const toggleTheme=()=>setTheme(t=>t==='dark'?'light':'dark');

  // Auth
  const signup=useCallback((name,email,password)=>{
    const existing=getStoredUser();
    if(existing&&existing.email===email)return{error:'Account already exists.'};
    const user={name,email,passwordHash:hashPassword(password),studyStreak:0,writingStreak:0,joinedAt:new Date().toISOString().split('T')[0],defaultWeeklyHours:6};
    saveStoredUser(user);
    const sess={email,name};saveSession(sess);setSession(sess);
    return{success:true};
  },[]);

  const login=useCallback((email,password)=>{
    const user=getStoredUser();
    if(!user||user.email!==email)return{error:'No account found with that email.'};
    if(user.passwordHash!==hashPassword(password))return{error:'Incorrect password.'};
    const sess={email,name:user.name};saveSession(sess);setSession(sess);
    return{success:true};
  },[]);

  const logout=useCallback(()=>{clearSession();setSession(null);},[]);

  const updateCourses=useCallback(c=>{saveCourses(c);setCourses(c);},[]);
  const updateWeeklyPlan=useCallback(w=>{saveWeeklyPlan(w);setWeeklyPlan(w);},[]);
  const updateActivity=useCallback(a=>{saveActivity(a);setActivity(a);},[]);

  const addCourse=useCallback(course=>{
    const updated=[...courses,course];updateCourses(updated);
  },[courses,updateCourses]);

  const deleteCourse=useCallback(courseId=>{
    const updated=courses.filter(c=>c.id!==courseId);updateCourses(updated);
    const updatedActivity=activity.filter(a=>a.courseId!==courseId);updateActivity(updatedActivity);
  },[courses,activity,updateCourses,updateActivity]);

  const completeResource=useCallback((courseId,resourceId,{note,tags})=>{
    const updated=courses.map(c=>{
      if(c.id!==courseId)return c;
      return{...c,resources:c.resources.map(r=>r.id!==resourceId?r:{...r,completed:true,completedAt:new Date().toISOString().split('T')[0],note,tags})};
    });
    updateCourses(updated);
    const course=courses.find(c=>c.id===courseId);
    const resource=course?.resources.find(r=>r.id===resourceId);
    const entry={id:`a${Date.now()}`,type:'completion',resourceId,courseId,date:new Date().toISOString().split('T')[0],resourceTitle:resource?.title||'',note,tags};
    updateActivity([entry,...activity]);
    const user=getStoredUser();
    if(user){saveStoredUser({...user,studyStreak:(user.studyStreak||0)+1});}
  },[courses,activity,updateCourses,updateActivity]);

  const addEssayLink=useCallback((courseId,resourceId,link,essayTitle)=>{
    const updated=courses.map(c=>c.id!==courseId?c:{...c,resources:c.resources.map(r=>r.id!==resourceId?r:{...r,essayLink:link})});
    updateCourses(updated);
    const entry={id:`a${Date.now()}`,type:'essay',resourceId,courseId,date:new Date().toISOString().split('T')[0],essayTitle,link};
    updateActivity([entry,...activity]);
    const user=getStoredUser();
    if(user){saveStoredUser({...user,writingStreak:(user.writingStreak||0)+1});}
  },[courses,activity,updateCourses,updateActivity]);

  const user=getStoredUser();

  return(
    <AppContext.Provider value={{theme,toggleTheme,session,user,courses,weeklyPlan,activity,signup,login,logout,addCourse,deleteCourse,completeResource,addEssayLink,updateCourses,updateWeeklyPlan}}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp=()=>useContext(AppContext);
