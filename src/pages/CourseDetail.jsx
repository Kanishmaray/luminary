import{useState,useEffect,useRef}from'react';
import{useParams,Link}from'react-router-dom';
import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS,getWeeklyRecommendation}from'../store/data';
import PageWrapper from'../components/PageWrapper';

// ─────────────────────────────────────────────
// Glowy pulsating constellation
// ─────────────────────────────────────────────
function Constellation({resources,color}){
  const hex=color||'#6366f1';
  const completed=resources.filter(r=>r.completed);
  const pending=resources.filter(r=>!r.completed);

  // stable positions per resource
  function stablePos(id,i,total,radius){
    const angle=(i/total)*Math.PI*2-Math.PI/2;
    return{x:150+radius*Math.cos(angle),y:120+radius*Math.sin(angle)};
  }

  const completedPositions=completed.map((r,i)=>({...stablePos(r.id,i,Math.max(completed.length,1),80),...r}));
  const pendingPositions=pending.map((r,i)=>({...stablePos(r.id,i,Math.max(pending.length,1),110),...r}));

  return(
    <div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'radial-gradient(ellipse at center,'+hex+'08 0%,transparent 70%)'}}>
      <style>{`
        @keyframes pulseGlow{0%,100%{opacity:.7;r:4px;filter:url(#starBlur)}50%{opacity:1;r:6px;filter:url(#starBlurBig)}}
        @keyframes orbitDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(1px,-2px)}}
        @keyframes connectPulse{0%,100%{stroke-opacity:.15}50%{stroke-opacity:.45}}
        @keyframes pendingPulse{0%,100%{opacity:.3;r:3px}50%{opacity:.6;r:4px}}
        .star-glow{animation:pulseGlow 2.8s ease-in-out infinite}
        .star-orbit{animation:orbitDrift 4s ease-in-out infinite}
        .star-pending{animation:pendingPulse 3.5s ease-in-out infinite}
        .connect-line{animation:connectPulse 3s ease-in-out infinite}
      `}</style>
      <svg viewBox="0 0 300 240" style={{width:'100%',maxWidth:300}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="starBlur" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="starBlurBig" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id={'cg'+hex.replace('#','')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={hex} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={hex} stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Nebula glow */}
        <ellipse cx="150" cy="120" rx="90" ry="70" fill={'url(#cg'+hex.replace('#','')+')'} opacity="0.5"/>

        {/* Connection lines between completed stars */}
        {completedPositions.map((a,i)=>completedPositions.slice(i+1).map((b,j)=>{
          const dist=Math.hypot(a.x-b.x,a.y-b.y);
          if(dist>120)return null;
          return(<line key={a.id+b.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hex} strokeWidth="0.8" className="connect-line" style={{animationDelay:(i*0.4)+'s'}}/>);
        }))}

        {/* Pending (dim) stars */}
        {pendingPositions.map((r,i)=>(
          <g key={r.id} className="star-orbit" style={{animationDelay:(i*0.7)+'s'}}>
            <circle cx={r.x} cy={r.y} r="2.5" fill={hex} opacity="0.2" className="star-pending" style={{animationDelay:(i*0.5)+'s'}}/>
          </g>
        ))}

        {/* Center core */}
        <g>
          <circle cx="150" cy="120" r="7" fill={hex} opacity="0.15"/>
          <circle cx="150" cy="120" r="4" fill={hex} opacity="0.5" className="star-glow"/>
          <circle cx="150" cy="120" r="2" fill="#fff" opacity="0.9"/>
        </g>

        {/* Completed glowy stars */}
        {completedPositions.map((r,i)=>(
          <g key={r.id} className="star-orbit" style={{animationDelay:(i*0.6)+'s'}}>
            {/* outer glow */}
            <circle cx={r.x} cy={r.y} r="12" fill={hex} opacity="0.08"/>
            <circle cx={r.x} cy={r.y} r="7" fill={hex} opacity="0.12"/>
            {/* animated star */}
            <circle cx={r.x} cy={r.y} r="4.5" fill={hex} opacity="0.8" className="star-glow" style={{animationDelay:(i*0.4)+'s'}}/>
            {/* bright core */}
            <circle cx={r.x} cy={r.y} r="2" fill="#fff" opacity="0.95"/>
            {/* cross sparkle */}
            <line x1={r.x-7} y1={r.y} x2={r.x+7} y2={r.y} stroke={hex} strokeWidth="0.5" opacity="0.4"/>
            <line x1={r.x} y1={r.y-7} x2={r.x} y2={r.y+7} stroke={hex} strokeWidth="0.5" opacity="0.4"/>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Complete Resource Modal
// ─────────────────────────────────────────────
function CompleteModal({resource,courseId,weeklyHours,onClose}){
  const{completeResource}=useApp();
  const[note,setNote]=useState('');
  const[tagInput,setTagInput]=useState('');
  const[tags,setTags]=useState([]);

  function addTag(e){
    if((e.key==='Enter'||e.key===',')&&tagInput.trim()){
      e.preventDefault();
      const t=tagInput.trim().toLowerCase().replace(/,/g,'');
      if(t&&!tags.includes(t))setTags([...tags,t]);
      setTagInput('');
    }
  }
  function removeTag(t){setTags(tags.filter(x=>x!==t));}

  function submit(e){
    e.preventDefault();
    completeResource(courseId,resource.id,{note:note.trim(),tags});
    onClose();
  }

  const inputStyle={width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',boxSizing:'border-box',outline:'none',marginBottom:'0.8rem'};
  const labelStyle={display:'block',fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'};
  const rec=getWeeklyRecommendation(resource,weeklyHours||3);

  return(
    <form onSubmit={submit}>
      <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1.2rem',padding:'0.6rem 0.9rem',background:'var(--bg-surface)',borderRadius:8,borderLeft:'3px solid var(--accent)'}}>
        ✓ Completing: <strong style={{color:'var(--text)'}}>{resource.title}</strong>
      </p>
      <label style={labelStyle}>Your Thoughts & Reactions</label>
      <textarea style={{...inputStyle,minHeight:100,resize:'vertical',marginBottom:'1rem'}} placeholder="What did you take away? What surprised you? What questions does this raise?" value={note} onChange={e=>setNote(e.target.value)}/>
      <label style={labelStyle}>Tags (press Enter after each)</label>
      <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.4rem',marginBottom:'1rem',display:'flex',flexWrap:'wrap',gap:'0.4rem',alignItems:'center'}}>
        {tags.map(t=>(
          <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',padding:'0.2rem 0.6rem',background:'var(--accent-dim)',color:'var(--accent)',borderRadius:20,fontSize:'0.8rem',fontWeight:500}}>
            {t}<button type="button" onClick={()=>removeTag(t)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',lineHeight:1,padding:0,fontSize:'0.9rem'}}>×</button>
          </span>
        ))}
        <input style={{border:'none',outline:'none',background:'transparent',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.9rem',minWidth:100,flex:1,padding:'0.2rem 0.3rem'}} placeholder="concepts, themes..." value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag}/>
      </div>
      <button type="submit" style={{width:'100%',padding:'0.75rem',background:'var(--accent)',color:'#fff',border:'none',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>
        Mark Complete
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function CourseDetail(){
  const{courseId}=useParams();
  const{courses}=useApp();
  const[expanded,setExpanded]=useState(null);
  const[completing,setCompleting]=useState(null);

  const course=courses.find(c=>c.id===courseId);
  if(!course)return(<PageWrapper><div style={{padding:'4rem',textAlign:'center',color:'var(--text-muted)'}}>Course not found. <Link to="/courses" style={{color:'var(--accent)'}}>Back to Courses</Link></div></PageWrapper>);

  const hex=SUBJECT_COLORS.find(c=>c.id===course.color)?.hex||'#6366f1';
  const resources=course.resources||[];
  const completed=resources.filter(r=>r.completed);
  const pending=resources.filter(r=>!r.completed);

  const TYPE_ICONS={'Article':'📄','Book':'📚','Video':'🎬','Podcast':'🎙','Essay':'✍️','Course':'🎓','Documentary':'🎞','Other':'🔗'};

  function formatMins(m){if(m<60)return m+'min';const h=Math.floor(m/60);const min=m%60;return h+'h'+(min?` ${min}m`:'');}

  return(
    <PageWrapper>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        {/* Header */}
        <div style={{marginBottom:'2.5rem'}}>
          <Link to="/courses" style={{color:'var(--text-muted)',fontSize:'0.85rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.3rem',marginBottom:'1rem'}}>← All Courses</Link>
          <div style={{display:'flex',gap:'2rem',alignItems:'flex-start',flexWrap:'wrap'}}>
            <div style={{flex:'1 1 300px'}}>
              <span style={{display:'inline-block',padding:'0.25rem 0.7rem',background:hex+'22',color:hex,borderRadius:6,fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.6rem'}}>
                {course.color}
              </span>
              <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.5rem'}}>{course.name}</h1>
              {course.description&&<p style={{color:'var(--text-muted)',fontSize:'0.95rem',lineHeight:1.6,maxWidth:500}}>{course.description}</p>}
              <div style={{display:'flex',gap:'1.2rem',marginTop:'1rem',fontSize:'0.85rem',color:'var(--text-muted)'}}>
                <span>⏱ {course.weeklyHours}h/week</span>
                <span>📖 {completed.length}/{resources.length} resources</span>
              </div>
            </div>
            <div style={{width:220,flexShrink:0}}>
              <Constellation resources={resources} color={hex}/>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',fontWeight:600,marginBottom:'1.2rem'}}>Syllabus</h2>
          {resources.length===0?(
            <div style={{textAlign:'center',padding:'3rem',border:'1px dashed var(--border)',borderRadius:12,color:'var(--text-muted)'}}>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem',marginBottom:'0.4rem'}}>No resources yet</p>
              <p style={{fontSize:'0.85rem'}}>Add resources from the Courses page.</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              {resources.map(r=>{
                const isExpanded=expanded===r.id;
                const rec=getWeeklyRecommendation(r,course.weeklyHours||3);
                return(
                  <div key={r.id} style={{background:'var(--bg-card)',border:'1px solid '+(r.completed?hex+'33':'var(--border)'),borderRadius:12,overflow:'hidden',transition:'border-color 0.2s',opacity:r.completed?0.75:1}}>
                    {/* Row */}
                    <div onClick={()=>setExpanded(isExpanded?null:r.id)}
                      style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.2rem',cursor:'pointer',userSelect:'none'}}>
                      <span style={{fontSize:'1.2rem',flexShrink:0}}>{TYPE_ICONS[r.type]||'🔗'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.6rem',flexWrap:'wrap'}}>
                          <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.95rem'}}>{r.title}</span>
                          {r.completed&&<span style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',background:hex+'22',color:hex,borderRadius:20,fontWeight:600}}>✓ Done</span>}
                        </div>
                        <div style={{display:'flex',gap:'0.8rem',marginTop:'0.2rem',fontSize:'0.78rem',color:'var(--text-muted)'}}>
                          <span>{r.type}</span>
                          <span>{formatMins(r.estimatedMins||60)}</span>
                          {!r.completed&&<span style={{color:hex+'cc',fontWeight:500}}>{rec.label}</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.8rem',flexShrink:0}}>
                        {!r.completed&&(
                          <button onClick={e=>{e.stopPropagation();setCompleting(r);}}
                            style={{padding:'0.4rem 0.8rem',background:hex+'22',color:hex,border:'1px solid '+hex+'44',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>
                            Complete
                          </button>
                        )}
                        <span style={{color:'var(--text-muted)',fontSize:'0.85rem',transition:'transform 0.2s',display:'inline-block',transform:isExpanded?'rotate(180deg)':'rotate(0)'}}>▾</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded&&(
                      <div style={{borderTop:'1px solid var(--border)',padding:'1rem 1.2rem',background:'var(--bg-surface)'}}>
                        {r.description&&<p style={{color:'var(--text-muted)',fontSize:'0.88rem',lineHeight:1.6,marginBottom:'0.8rem'}}>{r.description}</p>}
                        {r.url&&(
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--accent)',textDecoration:'none',fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.85rem',marginBottom:'0.8rem',transition:'background 0.15s'}}
                            onMouseEnter={e=>e.currentTarget.style.background=hex+'18'}
                            onMouseLeave={e=>e.currentTarget.style.background='var(--bg-card)'}>
                            🔗 Open Resource ↗
                          </a>
                        )}
                        {r.completed&&r.note&&(
                          <div style={{marginTop:'0.5rem'}}>
                            <p style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Your Notes</p>
                            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.05rem',lineHeight:1.7,color:'var(--text)',fontStyle:'italic'}}>{r.note}</p>
                          </div>
                        )}
                        {r.completed&&r.tags?.length>0&&(
                          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginTop:'0.6rem'}}>
                            {r.tags.map(t=>(
                              <span key={t} style={{padding:'0.2rem 0.6rem',background:hex+'18',color:hex,borderRadius:20,fontSize:'0.78rem',fontWeight:500}}>#{t}</span>
                            ))}
                          </div>
                        )}
                        {r.completedAt&&<p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.6rem'}}>Completed {r.completedAt}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Complete modal */}
      {completing&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}
          onClick={e=>{if(e.target===e.currentTarget)setCompleting(null);}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem',width:'min(520px,90vw)',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',fontWeight:600}}>Log Completion</h2>
              <button onClick={()=>setCompleting(null)} style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.4rem',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <CompleteModal resource={completing} courseId={course.id} weeklyHours={course.weeklyHours} onClose={()=>setCompleting(null)}/>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
