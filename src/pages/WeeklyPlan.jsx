import{useState,useEffect}from'react';
import{Link}from'react-router-dom';
import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS,getWeeklyRecommendation}from'../store/data';
import PageWrapper from'../components/PageWrapper';

function getWeekBounds(){
  const now=new Date();
  const day=now.getDay();
  const monday=new Date(now);monday.setDate(now.getDate()-(day===0?6:day-1));
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  const fmt=d=>d.toISOString().split('T')[0];
  return{start:fmt(monday),end:fmt(sunday)};
}
function formatDate(s){
  if(!s)return'';
  const d=new Date(s);
  return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();
}

export default function WeeklyPlan(){
  const{courses,weeklyPlan,updateWeeklyPlan}=useApp();
  const[hoursAvailable,setHoursAvailable]=useState(weeklyPlan.totalHoursAvailable||6);
  const week=getWeekBounds();

  // Build suggested assignments: one pending resource per course, filtered by hours
  const suggestions=[];
  let hoursUsed=0;
  courses.forEach(course=>{
    const pending=(course.resources||[]).filter(r=>!r.completed);
    if(!pending.length)return;
    const resource=pending[0];
    const rec=getWeeklyRecommendation(resource,course.weeklyHours||3);
    const estHrs=(resource.estimatedMins||60)/60;
    const allocHrs=rec.mode==='hours'?Math.min(course.weeklyHours||3,2):Math.min(estHrs,hoursAvailable-hoursUsed);
    if(hoursUsed+allocHrs>hoursAvailable+0.5)return;
    hoursUsed+=allocHrs;
    suggestions.push({course,resource,rec,allocHrs});
  });

  const hex=c=>SUBJECT_COLORS.find(x=>x.id===c)?.hex||'#6366f1';
  const TYPE_ICONS={'Article':'📄','Book':'📚','Video':'🎬','Podcast':'🎙','Essay':'✍️','Course':'🎓','Documentary':'🎞','Other':'🔗'};

  return(
    <PageWrapper>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{marginBottom:'2.5rem'}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.3rem'}}>Weekly Plan</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.95rem'}}>
            {formatDate(week.start)} — {formatDate(week.end)}
          </p>
        </div>

        {/* Hours input */}
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,padding:'1.4rem',marginBottom:'2rem',display:'flex',alignItems:'center',gap:'1.5rem',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200}}>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem',fontWeight:500,marginBottom:'0.3rem'}}>Hours available this week</p>
            <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Adjust to fit your schedule and the plan updates automatically.</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
            <button onClick={()=>setHoursAvailable(h=>Math.max(1,h-0.5))}
              style={{width:32,height:32,borderRadius:'50%',background:'var(--bg-surface)',border:'1px solid var(--border)',color:'var(--text)',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
            <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:'2rem',fontWeight:600,minWidth:60,textAlign:'center'}}>{hoursAvailable}h</span>
            <button onClick={()=>setHoursAvailable(h=>Math.min(40,h+0.5))}
              style={{width:32,height:32,borderRadius:'50%',background:'var(--bg-surface)',border:'1px solid var(--border)',color:'var(--text)',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
          </div>
        </div>

        {/* Suggestions */}
        {courses.length===0?(
          <div style={{textAlign:'center',padding:'4rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.4}}>🗓</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.4rem'}}>No courses yet</p>
            <p style={{fontSize:'0.9rem',marginBottom:'1rem'}}>Add courses to generate your weekly plan.</p>
            <Link to="/courses" style={{color:'var(--accent)',fontWeight:600,textDecoration:'none',fontSize:'0.9rem'}}>Add your first course →</Link>
          </div>
        ):suggestions.length===0?(
          <div style={{textAlign:'center',padding:'4rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.4}}>🎉</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.4rem'}}>All caught up!</p>
            <p style={{fontSize:'0.9rem'}}>No pending resources this week. Add more to your courses.</p>
          </div>
        ):(
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',fontWeight:600}}>This Week's Focus</h2>
              <span style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>{hoursUsed.toFixed(1)}h of {hoursAvailable}h planned</span>
            </div>

            {/* Hours bar */}
            <div style={{height:6,background:'var(--bg-surface)',borderRadius:6,overflow:'hidden',marginBottom:'1.5rem'}}>
              {suggestions.map((s,i)=>{
                const w=(s.allocHrs/hoursAvailable)*100;
                return<div key={i} style={{height:'100%',width:w+'%',background:hex(s.course.color),display:'inline-block',transition:'width 0.5s ease'}}/>;
              })}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {suggestions.map(({course,resource,rec,allocHrs},i)=>{
                const h=hex(course.color);
                return(
                  <div key={resource.id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',display:'flex',gap:0}}>
                    {/* Color strip */}
                    <div style={{width:4,background:'linear-gradient(to bottom,'+h+','+h+'88)',flexShrink:0}}/>
                    <div style={{padding:'1.2rem',flex:1,display:'flex',gap:'1rem',alignItems:'flex-start',flexWrap:'wrap'}}>
                      <span style={{fontSize:'1.4rem',flexShrink:0}}>{TYPE_ICONS[resource.type]||'🔗'}</span>
                      <div style={{flex:1,minWidth:200}}>
                        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap',marginBottom:'0.3rem'}}>
                          <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.95rem'}}>{resource.title}</span>
                          <span style={{fontSize:'0.72rem',padding:'0.15rem 0.5rem',background:h+'22',color:h,borderRadius:20,fontWeight:600}}>{course.name}</span>
                        </div>
                        <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.5rem'}}>{resource.type}</p>
                        {/* The recommendation — the key bit */}
                        <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.45rem 0.9rem',background:h+'12',border:'1px solid '+h+'33',borderRadius:8}}>
                          <span style={{fontSize:'0.9rem'}}>{rec.mode==='hours'?'⏱':'✅'}</span>
                          <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.88rem',color:h}}>{rec.label}</span>
                        </div>
                      </div>
                      <Link to={'/courses/'+course.id} style={{padding:'0.5rem 0.9rem',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',textDecoration:'none',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.8rem',fontWeight:500,flexShrink:0,alignSelf:'flex-start'}}>
                        Open →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
