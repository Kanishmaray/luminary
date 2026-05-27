import{NavLink,useNavigate}from'react-router-dom';
import{LayoutDashboard,BookOpen,CalendarDays,ScrollText,Network,Sun,Moon,LogOut}from'lucide-react';
import{useApp}from'../context/AppContext';

const NAV=[
  {to:'/',icon:LayoutDashboard,label:'Dashboard'},
  {to:'/courses',icon:BookOpen,label:'Courses'},
  {to:'/plan',icon:CalendarDays,label:'Plan'},
  {to:'/activity',icon:ScrollText,label:'Activity'},
  {to:'/graph',icon:Network,label:'Graph'},
];

export default function TopNav(){
  const{theme,toggleTheme,session,logout}=useApp();
  const navigate=useNavigate();

  const handleLogout=()=>{logout();navigate('/login');};

  return(
    <header style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,
      height:'var(--nav-height)',
      background:'var(--bg-nav)',
      borderBottom:'1px solid var(--border)',
      backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
      display:'flex',alignItems:'center',
      padding:'0 2.5rem',gap:'2rem',
    }}>
      {/* Logo */}
      <div style={{display:'flex',alignItems:'baseline',gap:'0.4rem',flexShrink:0}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.35rem',fontWeight:600,color:'var(--text-primary)',letterSpacing:'-0.01em'}}>Luminary</span>
        <span style={{fontSize:'0.65rem',color:'var(--text-muted)',letterSpacing:'0.12em',textTransform:'uppercase',fontWeight:500}}>beta</span>
      </div>

      {/* Nav links — centered */}
      <nav style={{display:'flex',alignItems:'center',gap:'0.15rem',flex:1,justifyContent:'center'}}>
        {NAV.map(({to,icon:Icon,label})=>(
          <NavLink key={to} to={to} end={to==='/'} style={({isActive})=>({
            display:'flex',alignItems:'center',gap:'0.45rem',
            padding:'0.45rem 0.85rem',borderRadius:10,fontSize:'0.85rem',
            fontWeight:500,transition:'all 0.15s',
            color:isActive?'var(--accent)':'var(--text-muted)',
            background:isActive?'var(--accent-soft)':'transparent',
            textDecoration:'none',
          })}>
            <Icon size={15}/>{label}
          </NavLink>
        ))}
      </nav>

      {/* Right — theme + user */}
      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}
        </button>
        {session&&(
          <>
            <div style={{width:28,height:28,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:600,color:'#fff',flexShrink:0}}>
              {session.name?.[0]||'?'}
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Sign out"><LogOut size={16}/></button>
          </>
        )}
      </div>
    </header>
  );
}
