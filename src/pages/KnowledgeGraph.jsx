import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getKnowledgeGraphData, getColorHex } from '../store/data';
import PageWrapper from '../components/PageWrapper';

export default function KnowledgeGraph() {
  const svgRef = useRef(null);
  const { courses } = useApp();
  const [selected, setSelected] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => { setGraphData(getKnowledgeGraphData()); }, [courses]);

  useEffect(() => {
    if (!svgRef.current || !graphData.nodes.length) return;

    const el = svgRef.current;
    const W = el.clientWidth || 800;
    const H = el.clientHeight || 500;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .attr('width', W).attr('height', H);

    const defs = svg.append('defs');
    graphData.nodes.filter(n => n.type === 'resource').forEach(n => {
      defs.append('radialGradient').attr('id', `glow-${n.id}`)
        .selectAll('stop').data([
          { offset: '0%', color: n.color, opacity: 0.3 },
          { offset: '100%', color: n.color, opacity: 0 },
        ]).enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity);
    });

    const sim = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(28));

    const link = svg.append('g').selectAll('line')
      .data(graphData.links).enter().append('line')
      .attr('stroke', d => {
        const src = graphData.nodes.find(n => n.id === (d.source.id || d.source));
        return src?.color || '#555';
      })
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', 1.2);

    const node = svg.append('g').selectAll('g')
      .data(graphData.nodes).enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (event, d) => setSelected(d));

    // Glow for resource nodes
    node.filter(d => d.type === 'resource').append('circle')
      .attr('r', 20).attr('fill', d => `url(#glow-${d.id})`);

    node.append('circle')
      .attr('r', d => d.type === 'resource' ? 9 : 6)
      .attr('fill', d => d.type === 'resource' ? d.color : 'var(--bg-secondary)')
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.type === 'resource' ? 0 : 1.5)
      .attr('fill-opacity', d => d.type === 'resource' ? 0.9 : 0.3);

    node.append('text')
      .attr('dy', d => d.type === 'resource' ? -14 : 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.type === 'resource' ? 10 : 9)
      .attr('fill', 'var(--text-secondary)')
      .attr('pointer-events', 'none')
      .text(d => d.label.length > 22 ? d.label.slice(0, 22) + '…' : d.label);

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [graphData]);

  const selectedCourse = selected?.courseId ? courses.find(c => c.id === selected.courseId) : null;
  const selectedColor = selectedCourse ? getColorHex(selectedCourse.color) : selected?.color || 'var(--accent)';

  const getConnectedConcepts = (nodeId) => {
    return graphData.links.filter(l => (l.source.id || l.source) === nodeId || (l.target.id || l.target) === nodeId)
      .map(l => {
        const otherId = (l.source.id || l.source) === nodeId ? (l.target.id || l.target) : (l.source.id || l.source);
        return graphData.nodes.find(n => n.id === otherId);
      }).filter(Boolean);
  };

  return (
    <PageWrapper>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Knowledge graph</h1>
        <p style={{ marginTop: '0.3rem' }}>
          {graphData.nodes.filter(n => n.type === 'resource').length} ideas · {graphData.nodes.filter(n => n.type === 'concept').length} concepts
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '1.25rem', transition: 'all 0.3s' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: 500 }}>
          {graphData.nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500, flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>✦</div>
              <p style={{ textAlign: 'center' }}>Complete resources and add tags to start building your knowledge graph.</p>
            </div>
          ) : (
            <svg ref={svgRef} style={{ width: '100%', height: 500, display: 'block' }} />
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <div className="card" style={{ borderTop: `3px solid ${selectedColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selected.type === 'concept' ? <Tag size={15} style={{ color: selectedColor }} /> : <BookOpen size={15} style={{ color: selectedColor }} />}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {selected.type}
                    </span>
                  </div>
                  <button className="btn-icon" onClick={() => setSelected(null)}><X size={15} /></button>
                </div>
                <h3 style={{ marginBottom: selectedCourse ? '0.25rem' : '1rem', fontSize: '1rem', lineHeight: 1.3 }}>{selected.label}</h3>
                {selectedCourse && (
                  <p style={{ fontSize: '0.78rem', color: selectedColor, marginBottom: '1rem', fontWeight: 500 }}>{selectedCourse.title}</p>
                )}
                <div className="divider" />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 500 }}>
                  Connected to {getConnectedConcepts(selected.id).length} {selected.type === 'resource' ? 'concepts' : 'resources'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {getConnectedConcepts(selected.id).map(n => (
                    <button key={n.id} onClick={() => setSelected(n)} className="tag"
                      style={{ background: `${n.color || selectedColor}18`, color: n.color || selectedColor, border: `1px solid ${n.color || selectedColor}30`, fontSize: '0.75rem', cursor: 'pointer' }}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resource (colored by course)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'none', border: '1.5px solid #888' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concept / tag</span>
        </div>
      </div>
    </PageWrapper>
  );
}
