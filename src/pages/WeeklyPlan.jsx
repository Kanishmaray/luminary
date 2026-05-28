import{useState}from'react';
import{Link}from'react-router-dom';
import{useApp}from'../context/AppContext';
import{SUBJECT_COLORS,buildWeeklySchedule}from'../store/data';
import PageWrapper from'../components/PageWrapper';

function getWeekBounds(){
  const now=new Date();
  const day=now.getDay();
  const monday=new Date(now);monday.setDate(now.getDate()-(day===0?6:day-1));
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  const fmt=d=>['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getDate();
  return{start:fmt(monday),end:fmt(sunday)};
}

const TYPE_ICONS={'Article':'📄','Book':'📚','Video':'🎬','Podcast':'🎙','Essay':'✍️','Course':'🎓','Documentary':'🎞','Other':'🔗'};

export default function WeeklyPlan(){
  const{courses}=useApp();
  const[totalHours,setTotalHours]=useState(3);
  const week=getWeekBounds();
  const hex=c=>SUBJECT_COLORS.find(x=>x.id===c)?.hex||'#6366f1';

  const{schedule,usedMins,totalMins}=buildWeeklySchedule(courses,totalHours);
  const usedHrs=(usedMins/60).toFixed(1);
  const fillPct=totalMins>0?Math.min(100,(usedMins/totalMins)*100):0;

  return(
    <PageWrapper>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{marginBottom:'2.5rem'}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.3rem'}}>Weekly Plan</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.95rem'}}>{week.start} — {week.end}</p>
        </div>

        {/* Hours slider */}
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,padding:'1.4rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
            <div>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem',fontWeight:500,marginBottom:'0.2rem'}}>How many hours do you have this week?</p>
              <p style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>The plan adjusts automatically — books get reading sessions, shorter resources get completed.</p>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.5rem',flexShrink:0}}>
              <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:'2rem',fontWeight:600,lineHeight:1}}>{totalHours}h</span>
              <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap',justifyContent:'flex-end'}}>
                {[0.5,1,1.5,2,3,4,5,6,8,10].map(h=>(
                  <button key={h} type="button" onClick={()=>setTotalHours(h)}
                    style={{padding:'0.3rem 0.6rem',borderRadius:20,border:'1px solid '+(totalHours===h?'var(--accent)':'var(--border)'),background:totalHours===h?'var(--accent-dim)':'var(--bg-surface)',color:totalHours===h?'var(--accent)':'var(--text-muted)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.78rem',fontWeight:totalHours===h?700:400,cursor:'pointer',transition:'all 0.15s'}}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time bar — colour-coded per course */}
          {schedule.length>0&&(
            <div>
              <div style={{height:6,background:'var(--bg-surface)',borderRadius:6,overflow:'hidden',display:'flex',marginBottom:'0.5rem'}}>
                {schedule.map((s,i)=>(
                  <div key={i} style={{height:'100%',width:((s.allocMins/totalMins)*100)+'%',background:hex(s.course.color),transition:'width 0.4s ease'}}/>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'var(--text-muted)'}}>
                <span>{usedHrs}h planned across {schedule.length} resource{schedule.length!==1?'s':''}</span>
                <span>{(totalHours-Number(usedHrs)).toFixed(1)}h unallocated</span>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        {courses.length===0?(
          <div style={{textAlign:'center',padding:'4rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.4}}>🗓</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.4rem'}}>No courses yet</p>
            <Link to="/courses" style={{color:'var(--accent)',fontWeight:600,textDecoration:'none',fontSize:'0.9rem'}}>Add your first course →</Link>
          </div>
        ):schedule.length===0?(
          <div style={{textAlign:'center',padding:'4rem 2rem',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',opacity:0.4}}>🎉</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem',marginBottom:'0.4rem'}}>All caught up!</p>
            <p style={{fontSize:'0.9rem'}}>No pending resources. Add more to your courses.</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'0.9rem'}}>
            {schedule.map(({course,resource,allocMins,label,mode},i)=>{
              const h=hex(course.color);
              const hrs=allocMins/60;
              const timeStr=hrs>=1?(Number.isInteger(hrs)?hrs:hrs.toFixed(1))+'h':Math.round(allocMins)+'min';
              return(
                <div key={resource.id} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',display:'flex',transition:'transform 0.15s,box-shadow 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px '+h+'18';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  <div style={{width:4,background:'linear-gradient(to bottom,'+h+','+h+'66)',flexShrink:0}}/>
                  <div style={{padding:'1.1rem 1.2rem',flex:1,display:'flex',gap:'1rem',alignItems:'flex-start',flexWrap:'wrap'}}>
                    <span style={{fontSize:'1.3rem',flexShrink:0,marginTop:'0.1rem'}}>{TYPE_ICONS[resource.type]||'🔗'}</span>
                    <div style={{flex:1,minWidth:180}}>
                      <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap',marginBottom:'0.25rem'}}>
                        <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.95rem'}}>{resource.title}</span>
                        <span style={{fontSize:'0.72rem',padding:'0.15rem 0.5rem',background:h+'22',color:h,borderRadius:20,fontWeight:600,whiteSpace:'nowrap'}}>{course.name}</span>
                      </div>
                      <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.6rem'}}>{resource.type} · {timeStr} this session</p>

                      {/* Recommendation pill */}
                      <div style={{display:'inline-flex',alignItems:'center',gap:'0.45rem',padding:'0.4rem 0.85rem',background:h+'14',border:'1px solid '+h+'30',borderRadius:8}}>
                        <span style={{fontSize:'0.85rem'}}>{mode==='complete'?'✅':'⏱'}</span>
                        <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'0.85rem',color:h}}>{label}</span>
                      </div>

                      {/* Book chapter hint */}
                      {resource.type==='Book'&&(resource.pages||resource.chapters)&&(
                        <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.4rem'}}>
                          ~{Math.ceil((allocMins/((resource.estimatedMins||600)/(resource.pages||resource.chapters||1)))+0.01)} pages at this pace
                        </p>
                      )}
                    </div>
                    <Link to={'/courses/'+course.id} style={{padding:'0.5rem 0.9rem',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',textDecoration:'none',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.8rem',fontWeight:500,flexShrink:0,alignSelf:'flex-start',whiteSpace:'nowrap'}}>
                      Open →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
