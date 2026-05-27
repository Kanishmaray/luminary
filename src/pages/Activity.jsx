import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS}from'../store/data';
import PageWrapper from'../components/PageWrapper';

const MONTH_NAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr){
  if(!dateStr)return'';
  const d=new Date(dateStr);
  return MONTH_NAMES[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
}

function TimelineEntry({entry,courses,index}){
  const course=courses.find(c=>c.id===entry.courseId);
  const hex=SUBJECT_COLORS.find(c=>c.id===course?.color)?.hex||'#6366f1';
  const isEven=index%2===0;

  if(entry.type==='completion'){
    return(
      <div style={{display:'flex',alignItems:'flex-start',gap:'0',marginBottom:'3rem',position:'relative'}}>
        {/* Date (left side) */}
        <div style={{width:120,textAlign:'right',paddingRight:'1.4rem',flexShrink:0,paddingTop:'0.3rem'}}>
          <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontWeight:500,fontFamily:'Space Grotesk,sans-serif'}}>{formatDate(entry.date)}</span>
        </div>

        {/* Spine dot */}
        <div style={{position:'relative',flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:14,height:14,borderRadius:'50%',background:hex,boxShadow:'0 0 0 3px var(--bg),0 0 0 5px '+hex+'55,0 0 16px '+hex+'99',marginTop:'0.35rem',zIndex:1,flexShrink:0}}/>
        </div>

        {/* Content */}
        <div style={{flex:1,paddingLeft:'1.4rem',paddingRight:'1rem',minWidth:0}}>
          {/* Thought / Note — the hero */}
          {entry.note?(
            <blockquote style={{
              margin:'0 0 0.8rem 0',
              fontFamily:'Cormorant Garamond,serif',
              fontSize:'clamp(1.15rem,2vw,1.45rem)',
              fontWeight:500,
              fontStyle:'italic',
              lineHeight:1.6,
              color:'var(--text)',
              paddingLeft:'1rem',
              borderLeft:'2px solid '+hex+'77',
            }}>
              "{entry.note}"
            </blockquote>
          ):(
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.1rem',color:'var(--text-muted)',fontStyle:'italic',marginBottom:'0.8rem'}}>
              — completed with no note
            </p>
          )}

          {/* Tags */}
          {entry.tags?.length>0&&(
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.7rem'}}>
              {entry.tags.map(t=>(
                <span key={t} style={{padding:'0.2rem 0.55rem',background:hex+'18',color:hex,borderRadius:20,fontSize:'0.78rem',fontWeight:500,fontFamily:'Space Grotesk,sans-serif'}}>#{t}</span>
              ))}
            </div>
          )}

          {/* Resource footnote — secondary */}
          <div style={{display:'flex',alignItems:'center',gap:'0.6rem',flexWrap:'wrap'}}>
            <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontFamily:'Space Grotesk,sans-serif'}}>
              from <em style={{color:'var(--text-muted)',fontStyle:'normal',fontWeight:500}}>{entry.resourceTitle}</em>
            </span>
            {course&&(
              <span style={{fontSize:'0.72rem',padding:'0.15rem 0.5rem',background:hex+'18',color:hex,borderRadius:20,fontWeight:600,fontFamily:'Space Grotesk,sans-serif'}}>
                {course.name}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if(entry.type==='essay'){
    return(
      <div style={{display:'flex',alignItems:'flex-start',gap:'0',marginBottom:'3rem',position:'relative'}}>
        <div style={{width:120,textAlign:'right',paddingRight:'1.4rem',flexShrink:0,paddingTop:'0.3rem'}}>
          <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontWeight:500,fontFamily:'Space Grotesk,sans-serif'}}>{formatDate(entry.date)}</span>
        </div>
        <div style={{position:'relative',flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:14,height:14,borderRadius:'50%',background:'#a78bfa',boxShadow:'0 0 0 3px var(--bg),0 0 0 5px #a78bfa55,0 0 16px #a78bfa99',marginTop:'0.35rem',zIndex:1}}/>
        </div>
        <div style={{flex:1,paddingLeft:'1.4rem',minWidth:0}}>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.25rem',fontWeight:500,marginBottom:'0.4rem',lineHeight:1.3}}>
            ✍️ <em>{entry.essayTitle||'Essay submitted'}</em>
          </p>
          {course&&<span style={{fontSize:'0.72rem',padding:'0.15rem 0.5rem',background:'#a78bfa18',color:'#a78bfa',borderRadius:20,fontWeight:600,fontFamily:'Space Grotesk,sans-serif'}}>{course.name}</span>}
        </div>
      </div>
    );
  }

  return null;
}

export default function Activity(){
  const{activity,courses}=useApp();

  // Group by month/year for section headers
  const grouped=[];
  let lastMonth='';
  activity.forEach((entry,i)=>{
    if(!entry.date){grouped.push({type:'entry',entry,index:i});return;}
    const d=new Date(entry.date);
    const monthKey=MONTH_NAMES[d.getMonth()]+' '+d.getFullYear();
    if(monthKey!==lastMonth){
      grouped.push({type:'month',label:monthKey});
      lastMonth=monthKey;
    }
    grouped.push({type:'entry',entry,index:i});
  });

  return(
    <PageWrapper>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{marginBottom:'2.5rem'}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.3rem'}}>The Chronicle</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.95rem'}}>
            {activity.length===0?'Your learning story begins here':'Every thought captured, every insight earned'}
          </p>
        </div>

        {activity.length===0?(
          <div style={{textAlign:'center',padding:'5rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.4}}>✨</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.5rem'}}>No activity yet</p>
            <p style={{fontSize:'0.9rem'}}>Complete a resource to start your learning chronicle.</p>
          </div>
        ):(
          <div style={{position:'relative',paddingLeft:0}}>
            {/* Vertical timeline spine */}
            <div style={{position:'absolute',left:120+7+'px',top:0,bottom:0,width:1,background:'linear-gradient(to bottom,transparent,var(--border) 5%,var(--border) 95%,transparent)',zIndex:0}}/>

            {grouped.map((item,idx)=>{
              if(item.type==='month'){
                return(
                  <div key={'month-'+item.label+idx} style={{display:'flex',alignItems:'center',gap:0,marginBottom:'1.5rem',marginTop:idx===0?0:'1rem'}}>
                    <div style={{width:120,textAlign:'right',paddingRight:'1.4rem'}}>
                      <span style={{fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',opacity:0.6,fontFamily:'Space Grotesk,sans-serif'}}></span>
                    </div>
                    <div style={{width:1,height:1,marginLeft:6,flexShrink:0}}/>
                    <div style={{paddingLeft:'1.4rem'}}>
                      <span style={{fontSize:'0.75rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',fontFamily:'Space Grotesk,sans-serif'}}>{item.label}</span>
                    </div>
                  </div>
                );
              }
              return<TimelineEntry key={item.entry.id} entry={item.entry} courses={courses} index={item.index}/>;
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
