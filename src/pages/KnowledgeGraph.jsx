import{useEffect,useRef,useState}from'react';
import{useApp}from'../context/AppContext';
import{getKnowledgeGraphData}from'../store/data';
import PageWrapper from'../components/PageWrapper';

export default function KnowledgeGraph(){
  const{courses}=useApp();
  const svgRef=useRef(null);
  const containerRef=useRef(null);
  const[tooltip,setTooltip]=useState(null);
  const[hasD3,setHasD3]=useState(false);
  const simRef=useRef(null);

  useEffect(()=>{
    const{nodes,links}=getKnowledgeGraphData();
    if(!nodes.length)return;

    let cancelled=false;
    import('https://cdn.jsdelivr.net/npm/d3@7/+esm').then(d3=>{
      if(cancelled)return;
      setHasD3(true);
      const svg=d3.select(svgRef.current);
      const container=containerRef.current;
      svg.selectAll('*').remove();

      const W=container.clientWidth||800;
      const H=container.clientHeight||600;
      svg.attr('viewBox','0 0 '+W+' '+H).attr('width','100%').attr('height','100%');

      // Zoom/pan group
      const g=svg.append('g').attr('class','zoom-group');

      const zoom=d3.zoom()
        .scaleExtent([0.2,6])
        .on('zoom',event=>{g.attr('transform',event.transform);});

      svg.call(zoom).on('dblclick.zoom',null);

      // Arrow marker
      svg.append('defs').append('marker')
        .attr('id','arrow').attr('viewBox','0 -4 8 8').attr('refX',14).attr('refY',0)
        .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
        .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','#888').attr('opacity',0.5);

      // Links
      const link=g.append('g').selectAll('line').data(links).join('line')
        .attr('stroke','#555').attr('stroke-width',1).attr('stroke-opacity',0.3)
        .attr('marker-end','url(#arrow)');

      // Nodes
      const node=g.append('g').selectAll('g').data(nodes).join('g')
        .attr('cursor','pointer')
        .call(d3.drag()
          .on('start',(event,d)=>{if(!event.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;})
          .on('drag',(event,d)=>{d.fx=event.x;d.fy=event.y;})
          .on('end',(event,d)=>{if(!event.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));

      node.each(function(d){
        const sel=d3.select(this);
        const r=d.type==='concept'?8:6;
        const col=d.type==='concept'?'#a78bfa':d.color;
        // Glow ring
        sel.append('circle').attr('r',r+5).attr('fill',col).attr('opacity',0.12);
        sel.append('circle').attr('r',r+2).attr('fill',col).attr('opacity',0.18);
        // Main dot
        sel.append('circle').attr('r',r).attr('fill',col).attr('opacity',0.9);
        // White core
        sel.append('circle').attr('r',r*0.35).attr('fill','#fff').attr('opacity',0.85);
        // Label
        sel.append('text')
          .text(d.label.length>18?d.label.slice(0,16)+'…':d.label)
          .attr('dy','0.35em').attr('x',r+6)
          .attr('font-size',d.type==='concept'?'11px':'10px')
          .attr('font-family','Space Grotesk,sans-serif')
          .attr('fill','#ccc').attr('opacity',0.7)
          .attr('pointer-events','none');
      });

      node.on('mouseenter',(event,d)=>{
        setTooltip({label:d.label,type:d.type,x:event.clientX,y:event.clientY});
      }).on('mousemove',(event)=>{
        setTooltip(t=>t?{...t,x:event.clientX,y:event.clientY}:null);
      }).on('mouseleave',()=>{setTooltip(null);});

      const sim=d3.forceSimulation(nodes)
        .force('link',d3.forceLink(links).id(d=>d.id).distance(90).strength(0.4))
        .force('charge',d3.forceManyBody().strength(-180))
        .force('center',d3.forceCenter(W/2,H/2))
        .force('collide',d3.forceCollide(20));

      simRef.current=sim;

      sim.on('tick',()=>{
        link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y)
            .attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
        node.attr('transform',d=>'translate('+d.x+','+d.y+')');
      });
    }).catch(()=>{});

    return()=>{cancelled=true;if(simRef.current)simRef.current.stop();};
  },[courses]);

  const{nodes,links}=getKnowledgeGraphData();
  const isEmpty=nodes.length===0;

  return(
    <PageWrapper>
      <div style={{maxWidth:'100%',margin:'0 auto',height:'calc(100vh - var(--nav-height) - 4rem)',display:'flex',flexDirection:'column'}}>
        <div style={{marginBottom:'1.5rem',flexShrink:0}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(1.8rem,3vw,2.5rem)',fontWeight:600,lineHeight:1.1,marginBottom:'0.3rem'}}>Knowledge Graph</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>
            {isEmpty?'Connections appear as you tag completed resources':'Scroll to zoom · drag nodes · pan to explore'}
          </p>
        </div>

        {isEmpty?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',border:'1px dashed var(--border)',borderRadius:16,color:'var(--text-muted)',flexDirection:'column',gap:'0.8rem',textAlign:'center',padding:'2rem'}}>
            <div style={{fontSize:'3rem',opacity:0.4}}>🕸</div>
            <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.4rem'}}>The web of ideas is waiting</p>
            <p style={{fontSize:'0.9rem'}}>Complete a resource and add tags to see connections form.</p>
          </div>
        ):(
          <div ref={containerRef} style={{flex:1,position:'relative',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
            <svg ref={svgRef} style={{width:'100%',height:'100%',display:'block'}}/>
            {/* Hint */}
            <div style={{position:'absolute',bottom:12,right:14,fontSize:'0.72rem',color:'var(--text-muted)',opacity:0.5,pointerEvents:'none',fontFamily:'Space Grotesk,sans-serif'}}>
              scroll to zoom · drag to pan
            </div>
            {/* Legend */}
            <div style={{position:'absolute',top:12,left:14,display:'flex',gap:'1rem',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(6px)',borderRadius:8,padding:'0.5rem 0.8rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#a78bfa'}}/>
                <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontFamily:'Space Grotesk,sans-serif'}}>Concept</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#6366f1'}}/>
                <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontFamily:'Space Grotesk,sans-serif'}}>Resource</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip&&(
        <div style={{position:'fixed',left:tooltip.x+12,top:tooltip.y-10,pointerEvents:'none',zIndex:300,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'0.5rem 0.8rem',boxShadow:'0 4px 20px rgba(0,0,0,0.4)',maxWidth:200}}>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'0.82rem',fontWeight:600,color:'var(--text)',marginBottom:'0.15rem'}}>{tooltip.label}</p>
          <p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{tooltip.type==='concept'?'Concept tag':'Resource'}</p>
        </div>
      )}
    </PageWrapper>
  );
}
