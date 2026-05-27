export const SUBJECT_COLORS=[
  {id:'indigo',label:'Indigo',hex:'#6366f1'},{id:'rose',label:'Rose',hex:'#f43f5e'},
  {id:'teal',label:'Teal',hex:'#14b8a6'},{id:'amber',label:'Amber',hex:'#f59e0b'},
  {id:'violet',label:'Violet',hex:'#8b5cf6'},{id:'emerald',label:'Emerald',hex:'#10b981'},
  {id:'coral',label:'Coral',hex:'#fb7185'},{id:'sky',label:'Sky',hex:'#0ea5e9'},
];
export const RESOURCE_TYPES=['Article','Book','Video','Podcast','Essay','Course','Documentary','Other'];

function load(key,fallback){try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback;}catch{return fallback;}}
function save(key,value){localStorage.setItem(key,JSON.stringify(value));}

// Auth — stored as {name, email, passwordHash}
export const getStoredUser=()=>load('lum_user',null);
export const saveStoredUser=u=>save('lum_user',u);
export const getSession=()=>load('lum_session',null);
export const saveSession=s=>save('lum_session',s);
export const clearSession=()=>{localStorage.removeItem('lum_session');};

// Simple hash (not cryptographic — replace with bcrypt when adding Supabase)
export function hashPassword(pw){let h=0;for(let i=0;i<pw.length;i++){h=((h<<5)-h)+pw.charCodeAt(i);h|=0;}return h.toString(36);}

export const getCourses=()=>load('lum_courses',[]);
export const getWeeklyPlan=()=>load('lum_weekly',{weekStart:'',weekEnd:'',totalHoursAvailable:6,hoursLogged:0,assignments:[]});
export const getActivity=()=>load('lum_activity',[]);
export const saveCourses=c=>save('lum_courses',c);
export const saveWeeklyPlan=w=>save('lum_weekly',w);
export const saveActivity=a=>save('lum_activity',a);

export const getCourseById=id=>getCourses().find(c=>c.id===id);
export const getColorHex=colorId=>SUBJECT_COLORS.find(c=>c.id===colorId)?.hex||'#6366f1';

export function calcCourseProgress(course){
  if(!course.resources?.length)return 0;
  return Math.round((course.resources.filter(r=>r.completed).length/course.resources.length)*100);
}
export function calcWeeksRemaining(course){
  const remaining=course.resources?.filter(r=>!r.completed)||[];
  const totalMins=remaining.reduce((s,r)=>s+(r.estimatedMins||60),0);
  return Math.ceil((totalMins/60)/Math.max(course.weeklyHours||1,0.5));
}
export function getWeeklyRecommendation(resource,weeklyHours){
  if(resource.type==='Book'){
    const hrs=Math.min(weeklyHours,2);
    return{mode:'hours',label:`Read for ${hrs}h this week`};
  }
  return{mode:'complete',label:'Complete this resource'};
}
export function getKnowledgeGraphData(){
  const courses=getCourses();
  const nodes=[],links=[],tagMap={};
  courses.forEach(course=>{
    (course.resources||[]).filter(r=>r.completed&&r.tags?.length).forEach(resource=>{
      nodes.push({id:resource.id,label:resource.title.split('—')[0].trim(),type:'resource',courseId:course.id,color:getColorHex(course.color)});
      resource.tags.forEach(tag=>{
        if(!tagMap[tag])tagMap[tag]={connectedResources:[]};
        tagMap[tag].connectedResources.push(resource.id);
      });
    });
  });
  Object.entries(tagMap).forEach(([tag,data])=>{
    const nodeId=`tag_${tag}`;
    nodes.push({id:nodeId,label:tag,type:'concept',color:'#888'});
    data.connectedResources.forEach(rId=>links.push({source:rId,target:nodeId}));
  });
  return{nodes,links};
}
