import{useState}from'react';
import{Link}from'react-router-dom';
import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS,RESOURCE_TYPES,calcCourseProgress,calcTotalHours,calcRemainingHours}from'../store/data';
import PageWrapper from'../components/PageWrapper';
import CustomSelect from'../components/CustomSelect';

function Modal({title,onClose,children}){
  return(
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,padding:'2rem',width:'min(520px,90vw)',maxHeight:'80vh',overflowY:'auto'}}>
        {title&&(
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
            <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',fontWeight:600}}>{title}</h2>
            <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.4rem',cursor:'pointer',lineHeight:1}}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function AddCourseModal({onClose}){
  const{addCourse}=useApp();
  const[name,setName]=useState('');
  const[description,setDescription]=useState('');
  const[color,setColor]=useState('indigo');
  const[error,setError]=useState('');

  const inputStyle={width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',boxSizing:'border-box',outline:'none',marginBottom:'1rem'};
  const labelStyle={display:'block',fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'};

  function handleSubmit(e){
    e.preventDefault();
    if(!name.trim()){setError('Course name is required.');return;}
    addCourse({id:'c'+Date.now(),name:name.trim(),description:description.trim(),color,createdAt:new Date().toISOString().split('T')[0],resources:[]});
    onClose();
  }

  return(
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Course Name</label>
      <input style={inputStyle} placeholder="e.g. Art History 101" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
      <label style={labelStyle}>Description (optional)</label>
      <textarea style={{...inputStyle,minHeight:80,resize:'vertical'}} placeholder="What are you exploring?" value={description} onChange={e=>setDescription(e.target.value)}/>
      <label style={labelStyle}>Color</label>
      <div style={{display:'flex',gap:'0.6rem',marginBottom:'1.4rem',flexWrap:'wrap'}}>
        {SUBJECT_COLORS.map(c=>(
          <button key={c.id} type="button" onClick={()=>setColor(c.id)}
            style={{width:28,height:28,borderRadius:'50%',background:c.hex,border:'3px solid '+(color===c.id?'var(--text)':'transparent'),cursor:'pointer',transition:'transform 0.15s',transform:color===c.id?'scale(1.25)':'scale(1)'}}/>
        ))}
      </div>
      {error&&<p style={{color:'#f87171',fontSize:'0.85rem',marginBottom:'1rem'}}>{error}</p>}
      <button type="submit" style={{width:'100%',padding:'0.75rem',background:'var(--accent)',color:'#fff',border:'none',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'1rem',cursor:'pointer'}}>
        Add Course
      </button>
    </form>
  );
}

function AddResourceModal({courseId,onClose}){
  const{courses,updateCourses}=useApp();
  const[title,setTitle]=useState('');
  const[type,setType]=useState('Article');
  const[url,setUrl]=useState('');
  const[estimatedMins,setEstimatedMins]=useState(60);
  const[pages,setPages]=useState('');
  const[description,setDescription]=useState('');
  const[error,setError]=useState('');

  const inputStyle={width:'100%',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',boxSizing:'border-box',outline:'none',marginBottom:'1rem'};
  const labelStyle={display:'block',fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'};
  const isBook=type==='Book';

  function handleSubmit(e){
    e.preventDefault();
    if(!title.trim()){setError('Resource title is required.');return;}
    const course=courses.find(c=>c.id===courseId);
    if(!course)return;
    const resource={
      id:'r'+Date.now(),title:title.trim(),type,url:url.trim(),
      estimatedMins:Number(estimatedMins),
      ...(isBook&&pages?{pages:Number(pages)}:{}),
      description:description.trim(),completed:false,tags:[],
      createdAt:new Date().toISOString().split('T')[0],
    };
    updateCourses(courses.map(c=>c.id===courseId?{...c,resources:[...(c.resources||[]),resource]}:c));
    onClose();
  }

  return(
    <form onSubmit={handleSubmit}>
      <label style={labelStyle}>Title</label>
      <input style={inputStyle} placeholder="Resource title" value={title} onChange={e=>setTitle(e.target.value)} autoFocus/>

      <label style={labelStyle}>Type</label>
      <CustomSelect value={type} onChange={setType} options={RESOURCE_TYPES} style={{marginBottom:'1rem'}}/>

      {/* Book-specific fields */}
      {isBook?(
        <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:10,padding:'1rem',marginBottom:'1rem'}}>
          <p style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.8rem'}}>Book Details</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem'}}>
            <div>
              <label style={labelStyle}>Total Hours to Read</label>
              <input type="number" style={{...inputStyle,marginBottom:0}} min={10} value={+(estimatedMins/60).toFixed(1)} onChange={e=>setEstimatedMins(Math.round(parseFloat(e.target.value||1)*60))} placeholder="e.g. 10"/>
            </div>
            <div>
              <label style={labelStyle}>Pages (optional)</label>
              <input type="number" style={{...inputStyle,marginBottom:0}} min={1} value={pages} onChange={e=>setPages(e.target.value)} placeholder="e.g. 320"/>
            </div>
          </div>
          <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.6rem',lineHeight:1.5}}>
            The weekly plan will recommend reading sessions based on your available hours — never "complete the whole book."
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
        Add Resource
      </button>
    </form>
  );
}

function DeleteConfirmModal({course,onConfirm,onClose}){
  return(
    <div style={{textAlign:'center',padding:'0.5rem 0'}}>
      <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>⚠️</div>
      <p style={{marginBottom:'0.5rem',fontSize:'1rem',color:'var(--text)'}}>Delete <strong style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.1em'}}>{course.name}</strong>?</p>
      <p style={{color:'var(--text-muted)',fontSize:'0.85rem',lineHeight:1.6,marginBottom:'1.5rem'}}>All resources and activity entries will be permanently removed.</p>
      <div style={{display:'flex',gap:'0.8rem'}}>
        <button onClick={onClose} style={{flex:1,padding:'0.7rem',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontWeight:500,cursor:'pointer'}}>Cancel</button>
        <button onClick={onConfirm} style={{flex:1,padding:'0.7rem',background:'#ef4444',border:'none',borderRadius:8,color:'#fff',fontFamily:'Space Grotesk,sans-serif',fontWeight:600,cursor:'pointer'}}>Delete</button>
      </div>
    </div>
  );
}

export default function Courses(){
  const{courses,deleteCourse}=useApp();
  const[showAddCourse,setShowAddCourse]=useState(false);
  const[addResourceFor,setAddResourceFor]=useState(null);
  const[confirmDelete,setConfirmDelete]=useState(null);

  return(
    <PageWrapper>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2.5rem'}}>
          <div>
            <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.3rem'}}>Your Courses</h1>
            <p style={{color:'var(--text-muted)',fontSize:'0.95rem'}}>
              {courses.length===0?'No courses yet — add your first subject below':courses.length+' subject'+(courses.length!==1?'s':'')+' in your curriculum'}
            </p>
          </div>
          <button onClick={()=>setShowAddCourse(true)}
            style={{padding:'0.7rem 1.4rem',background:'var(--accent)',color:'#fff',border:'none',borderRadius:10,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.9rem',cursor:'pointer',whiteSpace:'nowrap'}}>
            + Add Course
          </button>
        </div>

        {courses.length===0?(
          <div style={{textAlign:'center',padding:'5rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3.5rem',marginBottom:'1rem',opacity:0.4}}>📚</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.5rem'}}>Your curriculum is empty</p>
            <p style={{fontSize:'0.9rem'}}>Add a course to begin building your learning universe.</p>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'1.5rem'}}>
            {courses.map(course=>{
              const progress=calcCourseProgress(course);
              const hex=SUBJECT_COLORS.find(c=>c.id===course.color)?.hex||'#6366f1';
              const totalHrs=calcTotalHours(course);
              const remainHrs=calcRemainingHours(course);
              return(
                <div key={course.id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'transform 0.2s,box-shadow 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 40px '+hex+'22';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  <div style={{height:4,background:'linear-gradient(90deg,'+hex+','+hex+'88)'}}/>
                  <div style={{padding:'1.4rem',flex:1,display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.8rem'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{display:'inline-block',padding:'0.2rem 0.6rem',background:hex+'22',color:hex,borderRadius:6,fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.5rem'}}>{course.color}</span>
                        <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',fontWeight:600,lineHeight:1.2,marginBottom:'0.3rem'}}>{course.name}</h3>
                        {course.description&&<p style={{color:'var(--text-muted)',fontSize:'0.85rem',lineHeight:1.5}}>{course.description}</p>}
                      </div>
                      <button onClick={()=>setConfirmDelete(course)} title="Delete course"
                        style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:'1rem',cursor:'pointer',padding:'0.3rem 0.4rem',borderRadius:6,flexShrink:0,marginLeft:'0.5rem',opacity:0.5,transition:'opacity 0.15s,color 0.15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.color='#ef4444';}}
                        onMouseLeave={e=>{e.currentTarget.style.opacity='0.5';e.currentTarget.style.color='var(--text-muted)';}}>🗑</button>
                    </div>

                    <div style={{marginBottom:'1rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.35rem'}}>
                        <span>{remainHrs}h remaining of {totalHrs}h</span>
                        <span style={{color:hex,fontWeight:600}}>{progress}%</span>
                      </div>
                      <div style={{height:4,background:'var(--bg-surface)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:progress+'%',background:'linear-gradient(90deg,'+hex+','+hex+'bb)',borderRadius:4,transition:'width 0.5s ease'}}/>
                      </div>
                    </div>

                    <div style={{display:'flex',gap:'0.5rem',marginTop:'auto',paddingTop:'0.8rem',borderTop:'1px solid var(--border)'}}>
                      <Link to={'/courses/'+course.id} style={{flex:1,padding:'0.6rem',background:hex+'18',color:hex,border:'1px solid '+hex+'44',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.85rem',textDecoration:'none',textAlign:'center'}}>
                        View Course
                      </Link>
                      <button onClick={()=>setAddResourceFor(course.id)}
                        style={{flex:1,padding:'0.6rem',background:'var(--bg-surface)',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'Space Grotesk,sans-serif',fontWeight:500,fontSize:'0.85rem',cursor:'pointer'}}>
                        + Resource
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddCourse&&<Modal title="New Course" onClose={()=>setShowAddCourse(false)}><AddCourseModal onClose={()=>setShowAddCourse(false)}/></Modal>}
      {addResourceFor&&<Modal title="Add Resource" onClose={()=>setAddResourceFor(null)}><AddResourceModal courseId={addResourceFor} onClose={()=>setAddResourceFor(null)}/></Modal>}
      {confirmDelete&&<Modal title="" onClose={()=>setConfirmDelete(null)}><DeleteConfirmModal course={confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>{deleteCourse(confirmDelete.id);setConfirmDelete(null);}}/></Modal>}
    </PageWrapper>
  );
}
