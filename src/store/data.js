export const SUBJECT_COLORS=[
  {id:'indigo',label:'Indigo',hex:'#6366f1'},{id:'rose',label:'Rose',hex:'#f43f5e'},
  {id:'teal',label:'Teal',hex:'#14b8a6'},{id:'amber',label:'Amber',hex:'#f59e0b'},
  {id:'violet',label:'Violet',hex:'#8b5cf6'},{id:'emerald',label:'Emerald',hex:'#10b981'},
  {id:'coral',label:'Coral',hex:'#fb7185'},{id:'sky',label:'Sky',hex:'#0ea5e9'},
];
export const RESOURCE_TYPES=['Article','Book','Video','Podcast','Essay','Course','Documentary','Other'];

function load(key,fallback){try{const r=localStorage.getItem(key);return r?JSON.parse(r):fallback;}catch{return fallback;}}
function save(key,value){localStorage.setItem(key,JSON.stringify(value));}

export const getStoredUser=()=>load('lum_user',null);
export const saveStoredUser=u=>save('lum_user',u);
export const getSession=()=>load('lum_session',null);
export const saveSession=s=>save('lum_session',s);
export const clearSession=()=>{localStorage.removeItem('lum_session');};

export function hashPassword(pw){let h=0;for(let i=0;i<pw.length;i++){h=((h<<5)-h)+pw.charCodeAt(i);h|=0;}return h.toString(36);}

export const getCourses=()=>load('lum_courses',[]);
export const getActivity=()=>load('lum_activity',[]);
export const saveCourses=c=>save('lum_courses',c);
export const saveActivity=a=>save('lum_activity',a);

export const getCourseById=id=>getCourses().find(c=>c.id===id);
export const getColorHex=colorId=>SUBJECT_COLORS.find(c=>c.id===colorId)?.hex||'#6366f1';

export function calcCourseProgress(course){
  if(!course.resources?.length)return 0;
  const total=course.resources.reduce((s,r)=>s+(r.estimatedMins||60),0);
  const done=course.resources.filter(r=>r.completed).reduce((s,r)=>s+(r.estimatedMins||60),0);
  return total===0?0:Math.round((done/total)*100);
}

export function calcTotalHours(course){
  return Math.round((course.resources||[]).reduce((s,r)=>s+(r.estimatedMins||60),0)/60*10)/10;
}

export function calcRemainingHours(course){
  return Math.round((course.resources||[]).filter(r=>!r.completed).reduce((s,r)=>s+(r.estimatedMins||60),0)/60*10)/10;
}

// ── Smart weekly schedule builder ──────────────────────────────────────────
// Given all courses and how many hours the user has this week,
// returns a list of {course, resource, allocMins, label, mode}
// Strategy:
//   1. Collect all pending resources across courses
//   2. Round-robin across courses (one slot per course) to ensure balance
//   3. For short resources (fit in remaining time, non-Book): complete them
//   4. For Books or resources that exceed remaining time: allocate a reading slice
export function buildWeeklySchedule(courses,totalHours){
  let remainingMins=totalHours*60;
  const schedule=[];

  // Build per-course pending queues
  const queues=courses.map(course=>({
    course,
    pending:(course.resources||[]).filter(r=>!r.completed),
  })).filter(q=>q.pending.length>0);

  if(!queues.length)return{schedule,usedMins:0,totalMins:totalHours*60};

  // Round-robin: keep pulling one from each course until time runs out
  let pass=0;
  while(remainingMins>5&&pass<50){
    let added=false;
    for(const q of queues){
      if(remainingMins<=5)break;
      const resource=q.pending[pass];
      if(!resource)continue;

      const estMins=resource.estimatedMins||60;
      const isBook=resource.type==='Book';

      if(isBook){
        // Never ask to "complete" a book in one week — always give a time slice
        const slice=Math.min(estMins,remainingMins,120); // cap at 2h per book per week
        if(slice<15)continue;
        const hrs=slice/60;
        const label=hrs>=1?'Read for '+(Number.isInteger(hrs)?hrs:hrs.toFixed(1))+'h this week':'Read for '+Math.round(slice)+'min this week';
        schedule.push({course:q.course,resource,allocMins:slice,label,mode:'partial'});
        remainingMins-=slice;
        added=true;
      }else if(estMins<=remainingMins){
        // Can complete it
        schedule.push({course:q.course,resource,allocMins:estMins,label:'Complete this resource',mode:'complete'});
        remainingMins-=estMins;
        added=true;
      }else if(remainingMins>=20){
        // Partial — watch/read as much as fits
        const slice=remainingMins;
        const hrs=slice/60;
        const label=hrs>=1?'Spend '+(Number.isInteger(hrs)?hrs:hrs.toFixed(1))+'h on this':'Spend '+Math.round(slice)+'min on this';
        schedule.push({course:q.course,resource,allocMins:slice,label,mode:'partial'});
        remainingMins=0;
        added=true;
        break;
      }
    }
    if(!added)break;
    pass++;
  }

  return{schedule,usedMins:totalHours*60-remainingMins,totalMins:totalHours*60};
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
    const nodeId='tag_'+tag;
    nodes.push({id:nodeId,label:tag,type:'concept',color:'#888'});
    data.connectedResources.forEach(rId=>links.push({source:rId,target:nodeId}));
  });
  return{nodes,links};
}
