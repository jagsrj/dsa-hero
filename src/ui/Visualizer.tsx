import { useEffect, useMemo, useState } from 'react';
import type { Visual, VisualFrame } from '../content/types';
import { CodeView } from './Markdown';

function ArrayView({ f }: { f: VisualFrame }) {
  const vals = f.values ?? [];
  return (
    <div className="viz-array" role="img" aria-label={`Array: ${vals.join(', ')}`}>
      {vals.map((v, i) => {
        const inWin = f.window && i >= f.window[0] && i <= f.window[1];
        const hi = f.highlight?.includes(i);
        return (
          <div key={i} className="viz-cell-wrap">
            <div className="viz-ptr">{f.pointers?.[i] ? <><span>{f.pointers[i]}</span><i>▼</i></> : null}</div>
            <div className={`viz-cell${hi ? ' hi' : ''}${inWin ? ' win' : ''}`}>{String(v)}</div>
            <div className="viz-idx">{i}</div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ f }: { f: VisualFrame }) {
  const vals = f.values ?? [];
  return (
    <div className="viz-list" role="img" aria-label={`Linked list: ${vals.join(' to ')}`}>
      {vals.map((v, i) => (
        <div key={i} className="viz-node-wrap">
          <div className="viz-ptr">{f.pointers?.[i] ? <><span>{f.pointers[i]}</span><i>▼</i></> : null}</div>
          <div className="viz-node-row">
            <div className={`viz-node${f.highlight?.includes(i) ? ' hi' : ''}`}><b>{String(v)}</b><span className="viz-next">•</span></div>
            <span className="viz-arrow">{i < vals.length - 1 ? '→' : '→ null'}</span>
          </div>
        </div>
      ))}
      {vals.length === 0 && <div className="viz-empty">head → null</div>}
    </div>
  );
}

function StackView({ f }: { f: VisualFrame }) {
  const vals = f.values ?? [];
  return (
    <div className="viz-stack" role="img" aria-label={`Stack from bottom to top: ${vals.join(', ') || 'empty'}`}>
      <div className="viz-stack-col">
        {[...vals].reverse().map((v, ri) => {
          const i = vals.length - 1 - ri;
          return <div key={i} className={`viz-slab${ri === 0 ? ' top' : ''}${f.highlight?.includes(i) ? ' hi' : ''}`}>{String(v)}{ri === 0 && <em>top</em>}</div>;
        })}
        {vals.length === 0 && <div className="viz-empty">empty</div>}
      </div>
      <div className="viz-stack-base" />
    </div>
  );
}

function QueueView({ f }: { f: VisualFrame }) {
  const vals = f.values ?? [];
  return (
    <div className="viz-queue" role="img" aria-label={`Queue from front to back: ${vals.join(', ') || 'empty'}`}>
      <span className="viz-qlabel">front ←</span>
      {vals.map((v, i) => <div key={i} className={`viz-cell${f.highlight?.includes(i) ? ' hi' : ''}`}>{String(v)}</div>)}
      {vals.length === 0 && <div className="viz-empty">empty</div>}
      <span className="viz-qlabel">← back</span>
    </div>
  );
}

function VarsView({ f, prev }: { f: VisualFrame; prev?: VisualFrame }) {
  const entries = Object.entries(f.vars ?? {});
  return (
    <div className="viz-vars">
      {entries.map(([k, v]) => {
        const changed = !prev?.vars || prev.vars[k] !== v;
        return (
          <div key={k} className={`viz-var${changed ? ' changed' : ''}`}>
            <span className="viz-var-name">{k}</span>
            <span className="viz-var-val">{String(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

const fmt = (n: number) => (n >= 1e15 ? n.toExponential(1) : Math.round(n).toLocaleString());
const timeAt = (steps: number) => {
  const s = steps / 1e8;
  if (s < 1e-3) return '< 1 ms';
  if (s < 1) return `${Math.round(s * 1000)} ms`;
  if (s < 120) return `${s.toFixed(1)} s`;
  if (s < 7200) return `${Math.round(s / 60)} min`;
  if (s < 86400 * 3) return `${Math.round(s / 3600)} h`;
  if (s < 3.15e7 * 2) return `${Math.round(s / 86400)} days`;
  return `${fmt(s / 3.15e7)} years`;
};

function GrowthView() {
  const [exp, setExp] = useState(3); // n = 10^exp
  const n = Math.round(10 ** exp);
  const rows = [
    { name: 'O(1)', steps: 1 },
    { name: 'O(log n)', steps: Math.max(1, Math.log2(n)) },
    { name: 'O(n)', steps: n },
    { name: 'O(n log n)', steps: n * Math.max(1, Math.log2(n)) },
    { name: 'O(n²)', steps: n * n },
    { name: 'O(2ⁿ)', steps: n <= 1000 ? 2 ** n : Infinity },
  ];
  const maxLog = Math.log10(1e13);
  return (
    <div className="viz-growth">
      <label className="viz-growth-label">
        Input size <b>n = {n.toLocaleString()}</b>
        <input type="range" min={0} max={7} step={0.25} value={exp} onChange={(e) => setExp(Number(e.target.value))} aria-label="Input size n (log scale)" />
      </label>
      <div className="viz-growth-rows">
        {rows.map((r) => {
          const w = r.steps === Infinity ? 100 : Math.min(100, (Math.log10(Math.max(1, r.steps)) / maxLog) * 100);
          const slow = r.steps > 1e9;
          return (
            <div key={r.name} className="viz-growth-row">
              <span className="viz-growth-name">{r.name}</span>
              <div className="viz-growth-bar"><div className={slow ? 'slow' : ''} style={{ width: `${Math.max(2, w)}%` }} /></div>
              <span className="viz-growth-num">{r.steps === Infinity || r.steps > 1e300 ? '∞ (forever)' : `${fmt(r.steps)} step${r.steps === 1 ? '' : 's'} · ${timeAt(r.steps)}`}</span>
            </div>
          );
        })}
      </div>
      <p className="muted small">Bars use a logarithmic scale. Time assumes ~10⁸ simple steps per second.</p>
    </div>
  );
}

export function Visualizer({ visual }: { visual: Visual }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frames = visual.frames;
  const f = frames[i];
  useEffect(() => { setI(0); setPlaying(false); }, [visual]);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (i < frames.length - 1) setI(i + 1); else setPlaying(false);
    }, 1700);
    return () => clearTimeout(t);
  }, [playing, i, frames.length]);

  const body = useMemo(() => {
    switch (visual.kind) {
      case 'array': return <ArrayView f={f} />;
      case 'list': return <ListView f={f} />;
      case 'stack': return <StackView f={f} />;
      case 'queue': return <QueueView f={f} />;
      case 'vars': return <VarsView f={f} prev={frames[i - 1]} />;
      case 'growth': return <GrowthView />;
      case 'text': return null;
      default: return null;
    }
  }, [visual.kind, f, frames, i]);

  if (visual.kind === 'growth') {
    return (
      <section className="viz card">
        <header className="viz-head"><h3>{visual.title}</h3></header>
        <GrowthView />
      </section>
    );
  }

  return (
    <section className="viz card" onKeyDown={(e) => {
      if (e.key === 'ArrowRight') setI(Math.min(frames.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setI(Math.max(0, i - 1));
    }} tabIndex={0} aria-label={`Visualizer: ${visual.title}. Use the arrow keys to step.`}>
      <header className="viz-head">
        <h3>{visual.title}</h3>
        <span className="muted small">Step {i + 1} of {frames.length}</span>
      </header>
      {f.code && <div className="viz-code"><CodeView code={f.code} /></div>}
      {body && <div className="viz-stage">{body}</div>}
      {f.output !== undefined && (
        <div className="viz-console" aria-label="Program output"><span className="muted small">output</span><pre>{f.output || ' '}</pre></div>
      )}
      <p className="viz-caption" aria-live="polite">{f.caption}</p>
      <div className="viz-controls">
        <button className="btn ghost sm" onClick={() => { setPlaying(false); setI(Math.max(0, i - 1)); }} disabled={i === 0} aria-label="Previous step">◀ Prev</button>
        <button className="btn ghost sm" onClick={() => { if (i === frames.length - 1) setI(0); setPlaying(!playing); }} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
        <button className="btn ghost sm" onClick={() => { setPlaying(false); setI(Math.min(frames.length - 1, i + 1)); }} disabled={i === frames.length - 1} aria-label="Next step">Next ▶</button>
        <div className="viz-dots" aria-hidden>
          {frames.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => { setPlaying(false); setI(k); }} tabIndex={-1} />)}
        </div>
      </div>
    </section>
  );
}
