import{useState}from'react';
import{useNavigate,Link}from'react-router-dom';
import{useApp}from'../context/AppContext';

export default function Signup(){
  const navigate=useNavigate();
  const{signup}=useApp();
  const[name,setName]=useState('');
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[error,setError]=useState('');

  const handleSubmit=e=>{
    e.preventDefault();setError('');
    if(!name||!email||!password){setError('Please fill in all fields.');return;}
    if(password.length<6){setError('Password must be at least 6 characters.');return;}
    const result=signup(name,email,password);
    if(result.error)setError(result.error);
    else navigate('/');
  };

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',position:'relative',zIndex:1}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <h1 style={{fontSize:'3rem',fontFamily:"'Cormorant Garamond',serif",fontWeight:600,marginBottom:'0.5rem'}}>Begin</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.875rem',letterSpacing:'0.04em'}}>create your intellectual universe</p>
        </div>
        <div className="modal">
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label>Your name</label>
              <input className="input" placeholder="What should we call you?" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div>
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div>
              <label>Password</label>
              <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            {error&&<p style={{color:'#f43f5e',fontSize:'0.82rem',margin:0}}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'0.75rem',marginTop:'0.25rem',fontSize:'0.9rem'}}>
              Start learning →
            </button>
          </form>
          <div className="divider"/>
          <p style={{textAlign:'center',fontSize:'0.85rem',color:'var(--text-muted)'}}>
            Already have an account?{' '}<Link to="/login" style={{color:'var(--accent)',fontWeight:500}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
