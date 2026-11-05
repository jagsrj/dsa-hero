import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Problem } from '../content/types';
import { buildForProblem, testInputPreview, showValue, type RunOutcome, type TestResult } from '../runner/harness';
import { getEngine, type RunStatus } from '../runner/engine';
import { answerComplexity, recordSubmission, revealSolution, saveCode, takeHint, xpForSolve } from '../state/progress';
import { getState, useProgress } from '../state/store';
import { CodeEditor } from './CodeEditor';
import { CodeView, Markdown } from './Markdown';

interface Props {
  problem: Problem;
  exam?: boolean;
  onSolved?: () => void;
  next?: { label: string; href: string };
  navigate: (href: string) => void;
}

const STATUS_TEXT: Record<RunStatus, string> = {
  loading: 'Starting the Java engine… (first run downloads it — about 10–20 s)',
  compiling: 'Compiling with javac…',
  running: 'Running tests…',
};

function expectedPreview(p: Problem, i: number): string | null {
  const t = p.tests[i];
  if (p.kind === 'function' && p.fn && t.expected !== undefined) {
    const type = p.fn.checkArg !== undefined ? p.fn.params[p.fn.checkArg].type : p.fn.returns;
    return showValue(type, t.expected);
  }
  if (p.kind === 'program') return t.stdout ?? '';
  return null;
}

function ResultCard({ r, i, program }: { r: TestResult; i: number; program: boolean }) {
  const [open, setOpen] = useState(r.status !== 'pass');
  const icon = r.status === 'pass' ? '✓' : r.status === 'ran' ? '▶' : r.status === 'error' ? '!' : '✗';
  return (
    <div className={`result ${r.status}`}>
      <button className="result-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="result-icon" aria-hidden>{icon}</span>
        <span className="result-name">{r.name || `Test ${i + 1}`}{r.hidden && <span className="pill tiny">hidden</span>}</span>
        <span className="result-ms muted small">{r.ms} ms</span>
      </button>
      {open && (
        <div className="result-body">
          {r.hidden && r.status !== 'pass' ? (
            <p className="muted small">This is a hidden test. Think about edge cases: empty input, one element, negatives, duplicates, very large inputs.</p>
          ) : (
            <>
              {r.input && <div className="kv"><span>Input</span><code>{r.input}</code></div>}
              {r.expected !== null && r.status !== 'error' && <div className="kv"><span>Expected</span><code className="pre">{r.expected}</code></div>}
              {r.actual !== null && r.status !== 'error' && r.status !== 'ran' && <div className="kv"><span>Your output</span><code className={`pre ${r.status === 'fail' ? 'bad' : ''}`}>{r.actual}</code></div>}
            </>
          )}
          {r.error && <div className="kv"><span>Error</span><code className="pre bad">{r.error}</code></div>}
          {r.stdout && !program && r.status !== 'ran' && !(r.hidden && r.status !== 'pass') && <div className="kv"><span>Printed</span><code className="pre">{r.stdout}</code></div>}
          {r.status === 'ran' && <div className="kv"><span>Output</span><code className="pre">{r.stdout || '(nothing printed)'}</code></div>}
        </div>
      )}
    </div>
  );
}

export function ProblemWorkspace({ problem: p, exam, onSolved, next, navigate }: Props) {
  const s = useProgress();
  const pp = s.problems[p.id];
  const saved = s.code[p.id];
  const [code, setCode] = useState(saved ?? p.starter);
  const [tab, setTab] = useState<'desc' | 'hints' | 'solution' | 'results'>('desc');
  const [mobilePane, setMobilePane] = useState<'problem' | 'code'>('problem');
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [lastMode, setLastMode] = useState<'run' | 'submit'>('run');
  const [justSolved, setJustSolved] = useState<{ xp: number; first: boolean } | null>(null);
  const [complexityPick, setComplexityPick] = useState<number | null>(null);

  useEffect(() => {
    setCode(s.code[p.id] ?? p.starter);
    setTab('desc');
    setOutcome(null);
    setJustSolved(null);
    setComplexityPick(null);
    setMobilePane('problem');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);

  useEffect(() => { getEngine().warmup?.(); }, []);

  // autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => { if (code !== (getState().code[p.id] ?? p.starter)) saveCode(p.id, code); }, 600);
    return () => clearTimeout(t);
  }, [code, p.id, p.starter]);

  const execute = useCallback(async (mode: 'run' | 'submit') => {
    if (status) return;
    setLastMode(mode);
    setTab('results');
    setMobilePane('problem');
    setOutcome(null);
    saveCode(p.id, code);
    const compilation = buildForProblem(p, code, mode === 'submit');
    const out = await getEngine().run(compilation, setStatus);
    setStatus(null);
    setOutcome(out);
    if (mode === 'submit') {
      const r = recordSubmission(p, out);
      if (r.solved) { setJustSolved({ xp: r.xp, first: r.firstSolve }); onSolved?.(); }
    }
  }, [code, p, status, onSolved]);

  const hintsUsed = pp?.hintsUsed ?? 0;
  const solutionUnlocked = !exam && (pp?.solved || pp?.sawSolution || hintsUsed >= p.hints.length);
  const visibleTests = useMemo(() => p.tests.map((t, i) => ({ t, i })).filter(({ t }) => !t.hidden), [p.tests]);
  const potentialXp = xpForSolve(p, hintsUsed);

  const resultsPanel = (
    <div className="results">
      {status && <div className="run-status"><span className="spinner" aria-hidden />{STATUS_TEXT[status]}</div>}
      {!status && !outcome && <p className="muted">Press <b>Run</b> to try the visible examples, or <b>Submit</b> to run every test including hidden ones.<br /><span className="small">Shortcuts: Ctrl/⌘ + Enter runs · Ctrl/⌘ + Shift + Enter submits.</span></p>}
      {outcome && (
        <>
          {outcome.kind === 'compile-error' && (
            <div className="outcome bad"><h4>Compile error</h4><pre className="compile">{outcome.compileErrors}</pre><p className="small muted">The compiler found a problem before running anything. Fix the first error first — later ones are often caused by it.</p></div>
          )}
          {outcome.kind === 'timeout' && <div className="outcome bad"><h4>Time limit exceeded</h4><p>{outcome.message}</p></div>}
          {(outcome.kind === 'runtime-failure' || outcome.kind === 'engine-error') && <div className="outcome bad"><h4>{outcome.kind === 'engine-error' ? 'Engine problem' : 'Program stopped'}</h4><p>{outcome.message}</p>{outcome.stdout && <pre className="compile">{outcome.stdout}</pre>}</div>}
          {outcome.kind === 'ok' && (
            <>
              <div className={`outcome ${outcome.passed === outcome.total ? 'good' : 'mixed'}`}>
                <h4>{outcome.passed === outcome.total ? (lastMode === 'submit' ? 'Accepted 🎉' : 'All visible tests pass') : `${outcome.passed} / ${outcome.total} tests passed`}</h4>
                {lastMode === 'run' && outcome.passed === outcome.total && <p className="small">Now press <b>Submit</b> to run the hidden tests too.</p>}
                <div className="meter"><div style={{ width: `${outcome.total ? (outcome.passed / outcome.total) * 100 : 0}%` }} /></div>
              </div>
              {justSolved && lastMode === 'submit' && (
                <div className="solved-banner">
                  <div>
                    <b>{justSolved.first ? (justSolved.xp ? `+${justSolved.xp} XP` : 'Solved') : 'Solved again'}</b>
                    <span className="muted small">{justSolved.first ? ' — nice work.' : ' — great for retention.'}</span>
                  </div>
                  {next && <button className="btn primary sm" onClick={() => navigate(next.href)}>{next.label} →</button>}
                </div>
              )}
              <div className="result-list">{outcome.results.map((r, i) => <ResultCard key={i} r={r} i={i} program={p.kind === 'program'} />)}</div>
            </>
          )}
        </>
      )}
      {pp?.solved && p.complexity && !exam && (
        <div className="card complexity">
          <h4>Complexity check <span className="pill tiny">+25 XP</span></h4>
          <Markdown text={p.complexity.prompt} />
          <div className="choices">
            {p.complexity.options.map((o, i) => {
              const answered = pp.complexityAnswered;
              const picked = complexityPick ?? (answered ? (pp.complexityOk ? p.complexity!.answer : -1) : null);
              const cls = picked === null ? '' : i === p.complexity!.answer ? 'correct' : picked === i ? 'wrong' : '';
              return <button key={i} className={`choice ${cls}`} disabled={picked !== null} onClick={() => { setComplexityPick(i); answerComplexity(p, i); }}>{o}</button>;
            })}
          </div>
          {(complexityPick !== null || pp.complexityAnswered) && <div className="small why"><b>Why:</b> <Markdown text={p.complexity.why} /></div>}
        </div>
      )}
    </div>
  );

  return (
    <div className="workspace">
      <div className="mobile-switch" role="tablist">
        <button role="tab" aria-selected={mobilePane === 'problem'} className={mobilePane === 'problem' ? 'on' : ''} onClick={() => setMobilePane('problem')}>Problem</button>
        <button role="tab" aria-selected={mobilePane === 'code'} className={mobilePane === 'code' ? 'on' : ''} onClick={() => setMobilePane('code')}>Code</button>
      </div>
      <section className={`pane left ${mobilePane === 'problem' ? 'show' : ''}`}>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'desc'} className={tab === 'desc' ? 'on' : ''} onClick={() => setTab('desc')}>Problem</button>
          {!exam && <button role="tab" aria-selected={tab === 'hints'} className={tab === 'hints' ? 'on' : ''} onClick={() => setTab('hints')}>Hints {hintsUsed > 0 && <span className="pill tiny">{hintsUsed}/{p.hints.length}</span>}</button>}
          {!exam && <button role="tab" aria-selected={tab === 'solution'} className={tab === 'solution' ? 'on' : ''} onClick={() => setTab('solution')}>{solutionUnlocked ? 'Solution' : '🔒 Solution'}</button>}
          <button role="tab" aria-selected={tab === 'results'} className={tab === 'results' ? 'on' : ''} onClick={() => setTab('results')}>Results {outcome?.kind === 'ok' && <span className={`pill tiny ${outcome.passed === outcome.total ? 'good' : 'bad'}`}>{outcome.passed}/{outcome.total}</span>}</button>
        </div>
        <div className="pane-body">
          {tab === 'desc' && (
            <div className="statement">
              <div className="statement-meta">
                <span className={`pill ${p.role}`}>{p.role === 'guided' ? 'Guided' : p.role === 'mastery' ? 'Mastery' : p.role === 'boss' ? 'Boss' : 'Exam'}</span>
                <span className={`pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                {pp?.solved ? <span className="pill good">✓ Solved</span> : !exam && <span className="pill xp">up to +{potentialXp} XP</span>}
              </div>
              <h2>{p.title}</h2>
              <Markdown text={p.statement} />
              {visibleTests.length > 0 && p.kind !== 'custom' && (
                <div className="examples">
                  <h4>Examples</h4>
                  {visibleTests.map(({ t, i }) => (
                    <div key={i} className="example">
                      <div className="kv"><span>{p.kind === 'program' ? 'Input' : 'Input'}</span><code className="pre">{testInputPreview(p, t) || '(none)'}</code></div>
                      {expectedPreview(p, i) !== null && <div className="kv"><span>{p.kind === 'program' ? 'Output' : 'Returns'}</span><code className="pre">{expectedPreview(p, i) || '(empty)'}</code></div>}
                    </div>
                  ))}
                </div>
              )}
              {p.kind === 'custom' && <p className="muted small">The tests create your objects and call their methods. Read the spec carefully: names and signatures must match exactly.</p>}
            </div>
          )}
          {tab === 'hints' && !exam && (
            <div className="hints">
              <p className="muted small">Each hint lowers this problem's XP by 10 (minimum 20). Struggle a little first: that's where the learning happens.</p>
              {p.hints.slice(0, hintsUsed).map((h, i) => <div key={i} className="hint card"><span className="hint-n">Hint {i + 1}</span><Markdown text={h} /></div>)}
              {hintsUsed < p.hints.length
                ? <button className="btn" onClick={() => takeHint(p)}>{hintsUsed === 0 ? 'Show first hint' : 'Show next hint'} ({hintsUsed}/{p.hints.length})</button>
                : <p className="small">All hints shown. The full solution is now unlocked.</p>}
            </div>
          )}
          {tab === 'solution' && !exam && (
            solutionUnlocked ? (
              pp?.sawSolution || pp?.solved ? (
                <div className="solution">
                  {p.walkthrough && <Markdown text={p.walkthrough} />}
                  <CodeView code={p.solution} />
                  {!pp?.solved && <p className="small muted">Type it out yourself rather than pasting — your fingers learn too.</p>}
                </div>
              ) : (
                <div className="solution-locked">
                  <p>Revealing the solution before solving means <b>no XP</b> for this problem.</p>
                  <button className="btn warn" onClick={() => revealSolution(p)}>Reveal the solution</button>
                </div>
              )
            ) : (
              <div className="solution-locked"><p>🔒 The solution unlocks after you solve the problem or use all {p.hints.length} hints.</p></div>
            )
          )}
          {tab === 'results' && resultsPanel}
        </div>
      </section>
      <section className={`pane right ${mobilePane === 'code' ? 'show' : ''}`}>
        <div className="editor-bar">
          <span className="muted small">Java 17</span>
          <div className="spacer" />
          <button className="btn ghost sm" onClick={() => { if (confirm('Reset to the starter code? Your current code will be lost.')) { setCode(p.starter); saveCode(p.id, p.starter); } }}>Reset</button>
          <button className="btn sm" disabled={!!status} onClick={() => execute('run')} title="Ctrl/⌘ + Enter">▶ Run</button>
          <button className="btn primary sm" disabled={!!status} onClick={() => execute('submit')} title="Ctrl/⌘ + Shift + Enter">Submit</button>
        </div>
        <CodeEditor docKey={p.id} value={code} onChange={setCode} onRun={() => execute('run')} onSubmit={() => execute('submit')} />
        {status && <div className="editor-status"><span className="spinner" aria-hidden />{STATUS_TEXT[status]}</div>}
      </section>
    </div>
  );
}
