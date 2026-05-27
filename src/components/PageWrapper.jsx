import{useEffect,useRef}from'react';
export default function PageWrapper({children}){
  const ref=useRef(null);
  useEffect(()=>{if(ref.current){ref.current.classList.remove('page-enter');void ref.current.offsetWidth;ref.current.classList.add('page-enter');}},[]);
  return(<div ref={ref} style={{position:'relative',zIndex:1}}>{children}</div>);
}
