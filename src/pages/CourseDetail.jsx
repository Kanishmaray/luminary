import{useState}from'react';
import{useParams,Link}from'react-router-dom';
import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS,RESOURCE_TYPES,calcCourseProgress,calcTotalHours,calcRemainingHours}from'../store/data';
import PageWrapper from'../components/PageWrapper';
import CustomSelect from'../components/CustomSelect';

// ── Constellation ──────────────────────────────────────────────────────────
function Constellation({resources,color}){
  const hex=color||'#6366f1';
  const completed=resources.filter(r=>r.completed);
  const pending=resources.filter(r=>!r.completed);
  function pos(i,total,radius){const angle=(i/Math.max(total,1))*Math.PI*2-Math.PI/2;return{x:150+radius*Math.cos(angle),y:120+radius*Math.sin(angle)};}
  const cp=completed.map((r,i)=>({...pos(i,completed.length,78),...r}));
  const pp=pending.map((r,i)=>({...pos(i,pending.length,108),...r}));
  return(
    <div style={{position:'relative',borderRadius:16,overflow:'hidden',background:'radial-gradient(ellipse at center,'+hex+'08 0%,transparent 70%)'}}>
      <style>{`
        @keyframes pulseGlow{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes orbitDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(1px,-2px)}}
        @keyframes connectPulse{0%,100%{stroke-opacity:.12}50%{stroke-opacity:.4}}
        @keyframes pendingPulse{0%,100%{opacity:.2}50%{opacity:.5}}
        .sg{animation:pulseGlow 2.8s ease-in-out infinite}
        .so{animation:orbitDrift 4s ease-in-out infinite}
        .sp{animation:pendingPulse 3.5s ease-in-out infinite}
        .cl{animation:connectPulse 3s ease-in-out infinite}
      `}</style>
      <svg viewBox="0 0 300 240" style={{width:'100%',maxWidth:300}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id={'rg'+hex.replace('#','')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={hex} stopOpacity="0.5"/><stop offset="100%" stopColor={hex} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="150" cy="120" rx="90" ry="70" fill={'url(#rg'+hex.replace('#','')+')'} opacity="0.5"/>
        {cp.map((a,i)=>cp.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y)<130&&(<line key={a.id+b.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hex} strokeWidth="0.8" className="cl" style={{animationDelay:(i*0.4)+'s'}}/>)))}
        {pp.map((r,i)=><g key={r.id} className="so" style={{animationDelay:(i*0.7)+'s'}}><circle cx={r.x} cy={r.y} r="2.5" fill={hex} className="sp" style={{animationDelay:(i*0.5)+'s'}}/></g>)}
        <g><circle cx="150" cy="120" r="8" fill={hex} opacity="0.12"/><circle cx="150" cy="120" r="4" fill={hex} opacity="0.5" className="sg"/><circle cx="150" cy="120" r="2" fill="#fff" opacity="0.9"/></g>
        {cp.map((r,i)=>(
          <g key={r.id} className="so" style={{animationDelay:(i*0.6)+'s'}}>
            <circle cx={r.x} cy={r.y} r="13" fill={hex} opacity="0.07"/>
            <circle cx={r.x} cy={r.y} r="7" fill={hex} opacity="0.12"/>
            <circle cx={r.x} cy={r.y} r="4.5" fill={hex} opacity="0.85" className="sg" style={{animationDelay:(i*0.4)+'s'}} filter="url(#glow)"/>
            <circle cx={r.x} cy={r.y} r="1.8" fill="#fff" opacity="0.95"/>
            <line x1={r.x-8} y1={r.y} x2={r.x+8} y2={r.y} stroke={hex} strokeWidth="0.5" opacity="0.35"/>
            <line x1={r.x} y1={r.y-8} x2={r.x} y2={r.y+8} stroke={hex} strokeWidth="0.5" opacity="0.35"/>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Shared modal shell ─────────────────────────────────────────────────────
function Modal({title,onClose,children}){
  return(
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.72)',backdropFilter:'blur(4px)'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem',width:'min(520px,90vw)',maxHeight:'82vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',fontWeight:600}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.5rem',cursor:'pointer',lineHeight:1,padding:'0 0.2rem'}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Add / Edit Resource form (shared) ──────────────────────────────────────
function ResourceForm({initial,courseId,onSave,onClose}){
  const{courses,updateCourses}=useApp();
  const editing=!!initial;
  const[title,setTitle]=useState(initial?.title||'');
  const[type,setType]=useState(initial?.type||'Article');
  const[url,setUrl]=useState(initial?.url||'');
  // stored as mins internally; display as hours for books, mins for others
  const[estimatedMins,setEstimatedMins]=useState(initial?.estimatedMins||60);
  const[pages,setPages]=useState(initial?.pages||initial?.chapters||'');
  const[description,setDescription]=useState(initial?.description||'');
  const[error,setError]=useState('');
  const isBook=type==='Book';

  const inputStyle={width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',boxSizing:'border-box',outline:'none',marginBottom:'1rem'};
  const labelStyle={display:'block',fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'};

  function handleSubmit(e){
    e.preventDefault();
    if(!title.trim()){setError('Title is required.');return;}
    const course=courses.find(c=>c.id===courseId);
    if(!course)return;

    if(editing){
      // update existing resource, preserve completion data
      const updated=courses.map(c=>c.id!==courseId?c:{...c,resources:c.resources.map(r=>r.id!==initial.id?r:{
        ...r,title:title.trim(),type,url:url.trim(),estimatedMins:Number(estimatedMins),
        description:description.trim(),
        ...(isBook&&pages?{pages:Number(pages)}:{pages:undefined}),
      })});
      updateCourses(updated);
    }else{
      const resource={
        id:'r'+Date.now(),title:title.trim(),type,url:url.trim(),
        estimatedMins:Number(estimatedMins),
        ...(isBook&&pages?{pages:Number(pages)}:{}),
        description:description.trim(),completed:false,tags:[],
        createdAt:new Date().toISOString().split('T')[0],
      };
      updateCourses(courses.map(c=>c.id===courseId?{...c,resources:[...(c.resources||[]),resource]}:c));
    }
    onClose();
  }

  return(
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Title</label>
      <input style={inputStyle} placeholder="Resource title" value={title} onChange={e=>setTitle(e.target.value)} autoFocus/>

      <label style={labelStyle}>Type</label>
      <CustomSelect value={type} onChange={setType} options={RESOURCE_TYPES} style={{marginBottom:'1rem'}}/>

      {isBook?(
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
          <p style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.8rem'}}>Book Details</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem'}}>
            <div>
              <label style={labelStyle}>Total Hours to Read</label>
              <input type="number" step="0.5" style={{...inputStyle,marginBottom:0}} min={0.5}
                value={+(estimatedMins/60).toFixed(1)}
                onChange={e=>setEstimatedMins(Math.round(parseFloat(e.target.value||1)*60))}
                placeholder="e.g. 10"/>
            </div>
            <div>
              <label style={labelStyle}>Pages (optional)</label>
              <input type="number" style={{...inputStyle,marginBottom:0}} min={1} value={pages} onChange={e=>setPages(e.target.value)} placeholder="e.g. 320"/>
            </div>
          </div>
          <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.6rem',lineHeight:1.5}}>
            Weekly plan will suggest reading sessions — never "complete the whole book."
          </p>
        </div>
      ):(
        <div style={{marginBottom:'1rem'}}>
          <label style={labelStyle}>Estimated Minutes</label>
          <input type="number" style={{...inputStyle,marginBottom:0}} min={5} value={estimatedMins} onChange={e=>setEstimatedMins(e.target.value)}/>
        </div>
      )}

      <label style={labelStyle}>URL (optional)</label>
      <input style={inputStyle} placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)}/>

      <label style={labelStyle}>Notes (optional)</label>
      <textarea style={{...inputStyle,minHeight:70,resize:'vertical'}} placeholder="Why this resource?" value={description} onChange={e=>setDescription(e.target.value)}/>

      {error&&<p style={{color:'#f87171',fontSize:'0.85rem',marginBottom:'1rem'}}>{error}</p>}
      <button type="submit" style={{width:'100%',padding:'0.75rem',background:'var(--accent)',color:'#fff',border:'none',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>
        {editing?'Save Changes':'Add Resource'}
      </button>
    </form>
  );
}

// ── Complete Resource Modal ────────────────────────────────────────────────
function CompleteModal({resource,courseId,onClose}){
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
  function submit(e){
    e.preventDefault();
    completeResource(courseId,resource.id,{note:note.trim(),tags});
    onClose();
  }
  const inputStyle={width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',boxSizing:'border-box',outline:'none',marginBottom:'0.8rem'};
  const labelStyle={display:'block',fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'};
  return(
    <form onSubmit={submit}>
      <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1.2rem',padding:'0.6rem 0.9rem',background:'var(--bg-surface)',borderRadius:8,borderLeft:'3px solid var(--accent)'}}>
        ✓ <strong style={{color:'var(--text)'}}>{resource.title}</strong>
      </p>
      <label style={labelStyle}>Your Thoughts & Reactions</label>
      <textarea style={{...inputStyle,minHeight:100,resize:'vertical',marginBottom:'1rem'}} placeholder="What did you take away? What surprised you? What questions does this raise?" value={note} onChange={e=>setNote(e.target.value)}/>
      <label style={labelStyle}>Tags (press Enter after each)</label>
      <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.4rem',marginBottom:'1rem',display:'flex',flexWrap:'wrap',gap:'0.4rem',alignItems:'center'}}>
        {tags.map(t=>(
          <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'0.3rem',padding:'0.2rem 0.6rem',background:'var(--accent-dim)',color:'var(--accent)',borderRadius:20,fontSize:'0.8rem',fontWeight:500}}>
            {t}<button type="button" onClick={()=>setTags(tags.filter(x=>x!==t))} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',lineHeight:1,padding:0,fontSize:'0.9rem'}}>×</button>
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CourseDetail(){
  const{id:courseId}=useParams();
  const{courses}=useApp();
  const[expanded,setExpanded]=useState(null);
  const[completing,setCompleting]=useState(null);
  const[addingResource,setAddingResource]=useState(false);
  const[editingResource,setEditingResource]=useState(null);

  const course=courses.find(c=>c.id===courseId);
  if(!course)return(<PageWrapper><div style={{padding:'4rem',textAlign:'center',color:'var(--text-muted)'}}>Course not found. <Link to="/courses" style={{color:'var(--accent)'}}>Back to Courses</Link></div></PageWrapper>);

  const hex=SUBJECT_COLORS.find(c=>c.id===course.color)?.hex||'#6366f1';
  const resources=course.resources||[];
  const totalHrs=calcTotalHours(course);
  const remainHrs=calcRemainingHours(course);
  const progress=calcCourseProgress(course);
  const TYPE_ICONS={'Article':'📄','Book':'📚','Video':'🎬','Podcast':'🎙','Essay':'✍️','Course':'🎓','Documentary':'🎞','Other':'🔗'};
  function fmt(m){if(m<60)return m+'min';const h=Math.floor(m/60);const min=m%60;return h+'h'+(min?' '+min+'m':'');}

  return(
    <PageWrapper>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        {/* Header */}
        <div style={{marginBottom:'2.5rem'}}>
          <Link to="/courses" style={{color:'var(--text-muted)',fontSize:'0.85rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'0.3rem',marginBottom:'1rem'}}>← All Courses</Link>
          <div style={{display:'flex',gap:'2rem',alignItems:'flex-start',flexWrap:'wrap'}}>
            <div style={{flex:'1 1 300px'}}>
              <span style={{display:'inline-block',padding:'0.25rem 0.7rem',background:hex+'22',color:hex,borderRadius:6,fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.6rem'}}>{course.color}</span>
              <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.5rem'}}>{course.name}</h1>
              {course.description&&<p style={{color:'var(--text-muted)',fontSize:'0.95rem',lineHeight:1.6,maxWidth:500,marginBottom:'1rem'}}>{course.description}</p>}
              <div style={{display:'flex',gap:'1.5rem',fontSize:'0.85rem',color:'var(--text-muted)',flexWrap:'wrap'}}>
                <span>📖 {resources.filter(r=>r.completed).length}/{resources.length} resources</span>
                <span>⏱ {remainHrs}h remaining of {totalHrs}h</span>
                <span style={{color:hex,fontWeight:600}}>{progress}% complete</span>
              </div>
              <div style={{height:4,background:'var(--bg-surface)',borderRadius:4,overflow:'hidden',marginTop:'0.8rem',maxWidth:320}}>
                <div style={{height:'100%',width:progress+'%',background:'linear-gradient(90deg,'+hex+','+hex+'bb)',borderRadius:4,transition:'width 0.5s ease'}}/>
              </div>
            </div>
            <div style={{width:220,flexShrink:0}}>
              <Constellation resources={resources} color={hex}/>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.2rem'}}>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',fontWeight:600}}>Syllabus</h2>
            <button onClick={()=>setAddingResource(true)}
              style={{padding:'0.55rem 1.1rem',background:hex+'18',color:hex,border:'1px solid '+hex+'44',borderRadius:9,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.85rem',cursor:'pointer',transition:'background 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.background=hex+'28'}
              onMouseLeave={e=>e.currentTarget.style.background=hex+'18'}>
              + Add Resource
            </button>
          </div>

          {resources.length===0?(
            <div style={{textAlign:'center',padding:'3rem',border:'1px dashed var(--border)',borderRadius:12,color:'var(--text-muted)'}}>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem',marginBottom:'0.4rem'}}>No resources yet</p>
              <p style={{fontSize:'0.85rem'}}>Hit the button above to add your first resource.</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              {resources.map(r=>{
                const isExpanded=expanded===r.id;
                return(
                  <div key={r.id} style={{background:'var(--bg-card)',border:'1px solid '+(r.completed?hex+'33':'var(--border)'),borderRadius:12,overflow:'hidden',transition:'border-color 0.2s',opacity:r.completed?0.78:1}}>
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
                          <span>{fmt(r.estimatedMins||60)}</span>
                          {r.type==='Book'&&(r.pages||r.chapters)&&<span>{r.pages||r.chapters} pages</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.6rem',flexShrink:0}} onClick={e=>e.stopPropagation()}>
                        {/* Edit button */}
                        <button onClick={()=>setEditingResource(r)}
                          title="Edit resource"
                          style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',padding:'0.3rem',borderRadius:6,opacity:0.5,transition:'opacity 0.15s,color 0.15s'}}
                          onMouseEnter={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.color='var(--text)';}}
                          onMouseLeave={e=>{e.currentTarget.style.opacity='0.5';e.currentTarget.style.color='var(--text-muted)';}}>
                          ✏️
                        </button>
                        {!r.completed&&(
                          <button onClick={()=>setCompleting(r)}
                            style={{padding:'0.4rem 0.8rem',background:hex+'22',color:hex,border:'1px solid '+hex+'44',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.8rem',cursor:'pointer'}}>
                            Complete
                          </button>
                        )}
                        <span style={{color:'var(--text-muted)',fontSize:'0.85rem',transition:'transform 0.2s',display:'inline-block',transform:isExpanded?'rotate(180deg)':'rotate(0)',cursor:'pointer'}} onClick={()=>setExpanded(isExpanded?null:r.id)}>▾</span>
                      </div>
                    </div>
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
                            {r.tags.map(t=><span key={t} style={{padding:'0.2rem 0.6rem',background:hex+'18',color:hex,borderRadius:20,fontSize:'0.78rem',fontWeight:500}}>#{t}</span>)}
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

      {/* Add Resource modal */}
      {addingResource&&(
        <Modal title="Add Resource" onClose={()=>setAddingResource(false)}>
          <ResourceForm courseId={course.id} onClose={()=>setAddingResource(false)}/>
        </Modal>
      )}

      {/* Edit Resource modal */}
      {editingResource&&(
        <Modal title="Edit Resource" onClose={()=>setEditingResource(null)}>
          <ResourceForm initial={editingResource} courseId={course.id} onClose={()=>setEditingResource(null)}/>
        </Modal>
      )}

      {/* Complete modal */}
      {completing&&(
        <Modal title="Log Completion" onClose={()=>setCompleting(null)}>
          <CompleteModal resource={completing} courseId={course.id} onClose={()=>setCompleting(null)}/>
        </Modal>
      )}
    </PageWrapper>
  );
}
