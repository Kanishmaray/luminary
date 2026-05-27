import{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{Flame,PenLine,BookOpen,Clock,ChevronRight,Shuffle,Brain,AlertCircle}from'lucide-react';
import{useApp}from'../context/AppContext';
import{calcCourseProgress,getColorHex,getStoredUser}from'../store/data';
import PageWrapper from'../components/PageWrapper';

function Counter({value}){
  const[n,setN]=useState(0);
  useEffect(()=>{let i=0;const s=Math.ceil(value/20);const t=setInterval(()=>{i+=s;if(i>=value){setN(value);clearInterval(t);}else setN(i);},35);return()=>clearInterval(t);},[value]);
  return<span>{n}</span>;
}

export default function Dashboard(){
  const{courses,weeklyPlan,activity,session}=useApp();
  const navigate=useNavigate();
  const user=getStoredUser();
  const hoursLogged=weeklyPlan?.hoursLogged||0;
  const hoursTarget=weeklyPlan?.totalHoursAvailable||6;
  const weekPct=Math.min(Math.round((hoursLogged/hoursTarget)*100),100);
  const weekDone=weekPct>=100;
  const pendingEssays=courses.flatMap(c=>c.resources.filter(r=>r.completed&&r.essayPrompt&&!r.essayLink).map(r=>({...r,courseName:c.title,courseColor:c.color})));
  const totalDone=courses.reduce((s,c)=>s+c.resources.filter(r=>r.completed).length,0);
  const totalRes=courses.reduce((s,c)=>s+c.resources.length,0);
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':'hour'<17?'Good afternoon':'Good evening';

  return(
    <PageWrapper>
      {/* Header */}
      <div style={{marginBottom:'2.5rem'}}>
        <p style={{color:'var(--text-muted)',fontSize:'0.78rem',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'}}>
          {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}
        </p>
        <h1 style={{fontSize:'2.8rem',letterSpacing:'-0.02em'}}>
          {greeting}, <em style={{fontStyle:'italic',color:'var(--accent)'}}>{session?.name?.split(' ')[0]}</em>
        </h1>
        <div style={{display:'flex',gap:'0.6rem',marginTop:'0.85rem',flexWrap:'wrap'}}>
          <div className="streak-badge"><Flame size={13}/>{user?.studyStreak||0} week streak</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.35rem',padding:'0.28rem 0.75rem',borderRadius:20,background:'rgba(20,184,166,0.1)',border:'1px solid rgba(20,184,166,0.22)',fontSize:'0.78rem',fontWeight:600,color:'#14b8a6'}}>
            <PenLine size={13}/>{user?.writingStreak||0} writing streak
          </div>
        </div>
      </div>

      {courses.length===0?(
        <div style={{textAlign:'center',padding:'5rem 2rem'}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.6rem',fontWeight:500,color:'var(--text-primary)',marginBottom:'0.75rem'}}>Your universe awaits</p>
          <p style={{color:'var(--text-muted)',marginBottom:'1.5rem'}}>Add your first course to begin.</p>
          <button className="btn btn-primary" onClick={()=>navigate('/courses')}>Add a course →</button>
        </div>
      ):(
        <>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.85rem',marginBottom:'2rem'}}>
            {[
              {icon:BookOpen,label:'Courses',value:courses.length,color:'var(--accent)'},
              {icon:Clock,label:'Hours this week',value:hoursLogged,color:'#14b8a6',suffix:`/ ${hoursTarget}h`},
              {icon:Flame,label:'Completed',value:totalDone,color:'#f59e0b',suffix:`/ ${totalRes}`},
              {icon:PenLine,label:'Essays',value:activity.filter(a=>a.type==='essay').length,color:'#f43f5e'},
            ].map(({icon:Icon,label,value,color,suffix})=>(
              <div key={label} className="card" style={{textAlign:'center',padding:'1.1rem'}}>
                <Icon size={16} style={{color,marginBottom:'0.5rem'}}/>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:600,color:'var(--text-primary)',lineHeight:1}}>
                  <Counter value={Math.round(value)}/>
                  {suffix&&<span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:400}}> {suffix}</span>}
                </div>
                <p style={{fontSize:'0.72rem',color:'var(--text-muted)',margin:'0.25rem 0 0',letterSpacing:'0.04em'}}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:'1.25rem'}}>
            {/* This week */}
            <div className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
                <div>
                  <h3>This week</h3>
                  <p style={{margin:'0.1rem 0 0',fontSize:'0.78rem'}}>
                    {new Date().toLocaleDateString('en-GB',{month:'short',day:'numeric'})} — {new Date(Date.now()+6*86400000).toLocaleDateString('en-GB',{month:'short',day:'numeric'})}
                  </p>
                </div>
                <button className="btn btn-ghost" style={{fontSize:'0.78rem',padding:'0.3rem 0.7rem'}} onClick={()=>navigate('/plan')}>View plan →</button>
              </div>
              <div style={{marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.35rem'}}>
                  <span style={{fontSize:'0.78rem',color:'var(--text-secondary)'}}>{hoursLogged}h of {hoursTarget}h</span>
                  <span style={{fontSize:'0.78rem',fontWeight:600,color:weekDone?'#10b981':'var(--accent)'}}>{weekPct}%</span>
                </div>
                <div className="progress-track" style={{height:4}}>
                  <div className="progress-fill" style={{width:`${weekPct}%`,background:weekDone?'#10b981':'var(--accent)'}}/>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.45rem'}}>
                {courses.map(c=>{
                  const pct=calcCourseProgress(c);
                  const color=getColorHex(c.color);
                  return(
                    <div key={c.id} style={{cursor:'pointer'}} onClick={()=>navigate(`/courses/${c.id}`)}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.2rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          <div style={{width:6,height:6,borderRadius:'50%',background:color,flexShrink:0}}/>
                          <span style={{fontSize:'0.82rem',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{c.title}</span>
                        </div>
                        <span style={{fontSize:'0.72rem',color:'var(--text-muted)',flexShrink:0}}>{pct}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`,background:color}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              {pendingEssays.length>0&&(
                <div className="card" style={{borderColor:'rgba(244,63,94,0.2)',background:'rgba(244,63,94,0.03)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <AlertCircle size={14} style={{color:'#f43f5e'}}/><h3 style={{fontSize:'0.9rem',margin:0,color:'#f43f5e'}}>Essays pending</h3>
                  </div>
                  {pendingEssays.slice(0,2).map(r=>(
                    <div key={r.id} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.4rem 0',borderBottom:'1px solid var(--border)'}}>
                      <div style={{width:5,height:5,borderRadius:'50%',background:getColorHex(r.courseColor),flexShrink:0}}/>
                      <span style={{flex:1,fontSize:'0.8rem',color:'var(--text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.85rem'}}>
                  <h3>Recent</h3>
                  <button className="btn-icon" onClick={()=>navigate('/activity')}><ChevronRight size={16}/></button>
                </div>
                {activity.slice(0,4).map(a=>{
                  const course=courses.find(c=>c.id===a.courseId);
                  const color=course?getColorHex(course.color):'#888';
                  return(
                    <div key={a.id} style={{display:'flex',gap:'0.6rem',marginBottom:'0.6rem',alignItems:'flex-start'}}>
                      <div style={{width:5,height:5,borderRadius:'50%',background:color,flexShrink:0,marginTop:5}}/>
                      <div style={{minWidth:0}}>
                        <p style={{margin:0,fontSize:'0.8rem',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {a.type==='essay'?`Essay: ${a.essayTitle}`:a.resourceTitle}
                        </p>
                        <p style={{margin:0,fontSize:'0.7rem',color:'var(--text-muted)'}}>{a.date}</p>
                      </div>
                    </div>
                  );
                })}
                {activity.length===0&&<p style={{fontSize:'0.82rem',color:'var(--text-muted)',fontStyle:'italic'}}>Nothing yet — complete your first resource.</p>}
              </div>
            </div>
          </div>

          {/* Bonus section */}
          <div style={{marginTop:'1.75rem',paddingTop:'1.5rem',borderTop:'1px solid var(--border)'}}>
            <p style={{fontSize:'0.7rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.75rem',fontWeight:600}}>
              {weekDone?'✦ Bonus unlocked':'✦ Complete your week to unlock these'}
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',opacity:weekDone?1:0.4,pointerEvents:weekDone?'auto':'none'}}>
              {[
                {icon:Shuffle,color:'var(--accent)',bg:'rgba(99,102,241,0.1)',title:'Serendipity',desc:'Spin for a random resource'},
                {icon:Brain,color:'#14b8a6',bg:'rgba(20,184,166,0.1)',title:'Mood pick',desc:'Match material to your energy'},
              ].map(({icon:Icon,color,bg,title,desc})=>(
                <div key={title} className="card" style={{display:'flex',alignItems:'center',gap:'0.85rem',cursor:'pointer'}}>
                  <div style={{width:38,height:38,borderRadius:12,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={18} style={{color}}/>
                  </div>
                  <div>
                    <p style={{margin:0,fontWeight:600,fontSize:'0.9rem',color:'var(--text-primary)'}}>{title}</p>
                    <p style={{margin:0,fontSize:'0.75rem'}}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
