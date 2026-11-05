import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ALL_MODULES, PHASES, findModule } from '../content';
import type { Module } from '../content/types';
import { evaluateExplain, gateStatus, isModuleUnlocked, markVisited, submitExplain, submitGateQuiz, tryPassGate } from '../state/progress';
import { useProgress } from '../state/store';
import { CodeView, Markdown } from '../ui/Markdown';
import { Visualizer } from '../ui/Visualizer';

const STEPS = [
  { id: 'learn', label: 'Learn' },
  { id: 'visualize', label: 'Visualize' },
  { id: 'java', label: 'Java spotlight' },
  { id: 'practice', label: 'Practice' },
  { id: 'gate', label: 'Mastery gate' },
] as const;
type StepId = (typeof STEPS)[number]['id'];

function GateStep({ m }: { m: Module }) {
  const s = useProgress();
  const g = gateStatus(m, s);
  const mp = s.modules[m.id] ?? {};
  const [pick, setPick] = useState<number | null>(mp.gateAnswer ?? null);
  const [text, setText] = useState(mp.explainBack ?? '');
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateExplain> | null>(mp.explainBack ? evaluateExplain(m.explainBack, mp.explainBack) : null);
  const idx = ALL_MODULES.findIndex((x) => x.id === m.id);
  const nextM = ALL_MODULES[idx + 1];
  const phase = PHASES.find((p) => p.id === m.phase)!;
  const lastInPhase = phase.modules[phase.modules.length - 1].id === m.id;
  const boss = m.problems.find((p) => p.role === 'boss');

  const checks = [
    { ok: g.masteryOk, label: `Mastery set: ${g.masteryPct}% of tests passing (need 80%)`, href: `/module/${m.id}?step=practice` },
    { ok: g.bossSolved, label: `Boss problem defeated${boss ? `: ${boss.title.replace(/^Boss: /, '')}` : ''}`, href: boss ? `/problem/${boss.id}` : undefined },
    { ok: g.quizOk, label: 'Gate question answered correctly' },
    { ok: g.explainOk, label: 'Explained it back in your own words' },
  ];

  if (g.passed) {
    return (
      <div className="gate passed card">
        <h2>🏅 Module {m.id} mastered</h2>
        <p>You passed this gate. Its review cards are in your spaced-repetition deck.</p>
        {nextM && !lastInPhase && <Link className="btn primary" to={`/module/${nextM.id}`}>Next: {nextM.id} {nextM.title} →</Link>}
        {lastInPhase && <Link className="btn primary" to={`/exam/${m.phase}`}>Take the Phase {m.phase} gate exam →</Link>}
      </div>
    );
  }

  return (
    <div className="gate">
      <div className="card">
        <h2>Mastery gate</h2>
        <p className="muted">Pass all four checks to master this module and unlock the next one.</p>
        <ul className="checklist">
          {checks.map((c, i) => (
            <li key={i} className={c.ok ? 'ok' : ''}>
              <span aria-hidden>{c.ok ? '✓' : '○'}</span>
              {c.href && !c.ok ? <Link to={c.href}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>1. Gate question</h3>
        <Markdown text={m.gateQuestion.prompt} />
        <div className="choices">
          {m.gateQuestion.options.map((o, i) => {
            const cls = pick === null ? '' : i === pick ? (i === m.gateQuestion.answer ? 'correct' : 'wrong') : '';
            return (
              <button key={i} className={`choice ${cls}`} onClick={() => { setPick(i); submitGateQuiz(m, i); }} aria-pressed={pick === i}>
                <Markdown text={o} />
              </button>
            );
          })}
        </div>
        {pick !== null && (pick === m.gateQuestion.answer
          ? <div className="ok-text why"><b>Correct.</b> <Markdown text={m.gateQuestion.why} /></div>
          : <p className="bad-text"><b>Not quite.</b> Re-read the concept and try another option.</p>)}
      </div>

      <div className="card">
        <h3>2. Explain it back</h3>
        <p>{m.explainBack.prompt}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write 2–3 sentences in your own words…" aria-label="Your explanation" />
        <div className="row">
          <button className="btn" disabled={text.trim().length < 10} onClick={() => setFeedback(submitExplain(m, text))}>Check my explanation</button>
          <span className="muted small">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
        {feedback && (
          <div className={`feedback ${feedback.ok ? 'good' : 'mixed'}`}>
            {feedback.ok ? <p><b>Great explanation.</b> You covered the key ideas.</p> : <p><b>Almost.</b> {feedback.words < 8 ? 'Write a little more (at least 8 words). ' : ''}Try to also cover:</p>}
            <ul>
              {feedback.hit.map((k) => <li key={k.idea} className="ok">✓ {k.idea}</li>)}
              {!feedback.ok && feedback.missing.map((k) => <li key={k.idea}>○ {k.idea}</li>)}
            </ul>
            <p className="small muted">This check looks for key ideas, not exact wording. Explaining a concept is the fastest way to find gaps in it.</p>
          </div>
        )}
      </div>

      <div className="gate-cta">
        <button className="btn primary lg" disabled={!g.ready} onClick={() => tryPassGate(m)}>{g.ready ? 'Pass the gate 🏅' : 'Complete all four checks to pass'}</button>
      </div>
    </div>
  );
}

export function ModulePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const s = useProgress();
  const m = id ? findModule(id) : undefined;
  const step = (params.get('step') as StepId) || 'learn';

  useEffect(() => { if (m && isModuleUnlocked(m.id, s)) markVisited(m); }, [m, s]);

  if (!m) return <Navigate to="/learn" replace />;
  if (!isModuleUnlocked(m.id, s)) {
    return (
      <div className="locked-page card">
        <h1>🔒 Module {m.id} is locked</h1>
        <p>Pass the mastery gate of the previous module first. One concept at a time is how this course works.</p>
        <Link className="btn primary" to="/learn">Back to the course map</Link>
      </div>
    );
  }

  const phase = PHASES.find((p) => p.id === m.phase)!;
  const go = (st: StepId) => { setParams(st === 'learn' ? {} : { step: st }); window.scrollTo(0, 0); };
  const stepIdx = STEPS.findIndex((x) => x.id === step);
  const nextStepId = STEPS[stepIdx + 1]?.id;
  const g = gateStatus(m, s);

  return (
    <div className="module">
      <nav className="crumbs small" aria-label="Breadcrumb"><Link to="/learn">Course</Link> › Phase {phase.id}: {phase.title} › <b>{m.id}</b></nav>
      <header className="module-head">
        <h1><span className="mod-id">{m.id}</span> {m.title}</h1>
        <p className="lead">{m.tagline}</p>
      </header>
      <ol className="stepper" aria-label="Module steps">
        {STEPS.map((x, i) => {
          const done = x.id === 'gate' ? g.passed : x.id === 'practice' ? g.bossSolved && g.masteryOk : i < stepIdx;
          return (
            <li key={x.id}>
              <button className={`${x.id === step ? 'on' : ''} ${done ? 'done' : ''}`} onClick={() => go(x.id)} aria-current={x.id === step ? 'step' : undefined}>
                <span className="step-n">{done ? '✓' : i + 1}</span><span className="step-l">{x.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 'learn' && (
        <article className="lesson">
          <div className="story card"><span className="eyebrow">Story</span><Markdown text={m.hook} /></div>
          <Markdown text={m.concept} className="concept" />
        </article>
      )}

      {step === 'visualize' && (m.visual ? <Visualizer visual={m.visual} /> : <p className="muted">No visualizer for this module.</p>)}

      {step === 'java' && (
        <article className="lesson">
          <h2>☕ {m.javaSpotlight.title}</h2>
          <Markdown text={m.javaSpotlight.body} />
          <CodeView code={m.javaSpotlight.code} />
          <p className="small muted">Want to experiment? Copy this into the <Link to="/playground">playground</Link> and run it.</p>
        </article>
      )}

      {step === 'practice' && (
        <div className="practice">
          <p className="muted">Start with the guided problem, then the mastery set, then face the boss. Hints are always there — they just cost a little XP.</p>
          <ol className="problem-list">
            {m.problems.map((p) => {
              const pp = s.problems[p.id];
              return (
                <li key={p.id}>
                  <Link to={`/problem/${p.id}`} className={`problem-row ${pp?.solved ? 'solved' : ''} ${p.role}`}>
                    <span className="pr-status" aria-label={pp?.solved ? 'Solved' : 'Not solved'}>{pp?.solved ? '✓' : p.role === 'boss' ? '⚔' : '○'}</span>
                    <span className="pr-title"><b>{p.title}</b><span className="muted small">{p.role === 'guided' ? 'Guided — one concept, one problem' : p.role === 'boss' ? 'Boss — mixes this module with earlier ones' : 'Mastery set'}</span></span>
                    <span className={`pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    {pp && !pp.solved && pp.total > 0 && <span className="small muted">{pp.bestPassed}/{pp.total}</span>}
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="card gate-progress">
            <b>Gate progress:</b> mastery {g.masteryPct}% {g.masteryOk ? '✓' : '(need 80%)'} · boss {g.bossSolved ? '✓' : 'not yet'}
          </div>
        </div>
      )}

      {step === 'gate' && <GateStep m={m} />}

      {nextStepId && (
        <div className="step-nav">
          <button className="btn primary" onClick={() => go(nextStepId)}>Next: {STEPS[stepIdx + 1].label} →</button>
        </div>
      )}
    </div>
  );
}
