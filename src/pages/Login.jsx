import{useState}from'react';
import{useNavigate,Link,useLocation}from'react-router-dom';
import{useApp}from'../context/AppContext';
import PageWrapper from'../components/PageWrapper';

export default function Login(){
  const navigate=useNavigate();
  const location=useLocation();
  const{login}=useApp();
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[error,setError]=useState('');
  const[loading,setLoading]=useState(false);

  const handleSubmit=async e=>{
    e.preventDefault();setError('');setLoading(true);
    const result=login(email,password);
    if(result.error){setError(result.error);setLoading(false);}
    else navigate(location.state?.from?.pathname||'/');
  };

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',position:'relative',zIndex:1}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <h1 style={{fontSize:'3rem',fontFamily:"'Cormorant Garamond',serif",fontWeight:600,marginBottom:'0.5rem'}}>Luminary</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.875rem',letterSpacing:'0.04em'}}>welcome back, scholar</p>
        </div>
        <div className="modal">
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            {error&&<p style={{color:'#f43f5e',fontSize:'0.82rem',margin:0}}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{width:'100%',justifyContent:'center',padding:'0.75rem',marginTop:'0.25rem',fontSize:'0.9rem'}}>
              {loading?'Signing in…':'Enter your universe →'}
            </button>
          </form>
          <div className="divider"/>
          <p style={{textAlign:'center',fontSize:'0.85rem',color:'var(--text-muted)'}}>
            New here?{' '}<Link to="/signup" style={{color:'var(--accent)',fontWeight:500}}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
