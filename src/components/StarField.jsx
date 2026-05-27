import{useMemo}from'react';
export default function StarField(){
  const stars=useMemo(()=>Array.from({length:70},(_,i)=>({id:i,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,size:Math.random()*2.2+0.8,dur:`${Math.random()*4+2}s`,delay:`${Math.random()*5}s`})),[]);
  return(
    <div className="star-field" aria-hidden="true">
      {stars.map(s=><div key={s.id} className="star" style={{top:s.top,left:s.left,width:s.size,height:s.size,'--dur':s.dur,'--delay':s.delay}}/>)}
    </div>
  );
}
