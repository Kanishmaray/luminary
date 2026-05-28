import{useState,useRef,useEffect}from'react';

export default function CustomSelect({value,onChange,options,style={}}){
  const[open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    function handle(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener('mousedown',handle);
    return()=>document.removeEventListener('mousedown',handle);
  },[]);
  return(
    <div ref={ref} style={{position:'relative',...style}}>
      <button type="button" onClick={()=>setOpen(o=>!o)}
        style={{width:'100%',background:'var(--bg-surface)',border:'1px solid '+(open?'var(--accent)':'var(--border)'),borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--text)',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.95rem',cursor:'pointer',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center',boxSizing:'border-box',transition:'border-color 0.15s',outline:'none'}}>
        <span>{value}</span>
        <span style={{fontSize:'0.7rem',color:'var(--text-muted)',transition:'transform 0.2s',display:'inline-block',transform:open?'rotate(180deg)':'rotate(0)'}}>▾</span>
      </button>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:300,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
          {options.map(opt=>(
            <div key={opt} onClick={()=>{onChange(opt);setOpen(false);}}
              style={{padding:'0.6rem 0.9rem',cursor:'pointer',fontFamily:'Space Grotesk,sans-serif',fontSize:'0.9rem',color:opt===value?'var(--accent)':'var(--text)',background:opt===value?'var(--accent-dim)':'transparent',transition:'background 0.1s'}}
              onMouseEnter={e=>{if(opt!==value)e.currentTarget.style.background='var(--bg-surface)';}}
              onMouseLeave={e=>{if(opt!==value)e.currentTarget.style.background='transparent';}}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
