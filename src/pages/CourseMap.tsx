import { Link } from 'react-router-dom';
import { PHASES, UPCOMING_PHASES } from '../content';
import { gateStatus, isExamUnlocked, isModuleUnlocked, isPhaseUnlocked } from '../state/progress';
import { useProgress } from '../state/store';

export function CourseMap() {
  const s = useProgress();
  return (
    <div className="course">
      <header className="page-head">
        <p className="eyebrow">Course map</p>
        <h1>Zero to DSA Hero</h1>
        <p className="muted">One module at a time. Each module unlocks only after you pass its mastery gate, and each phase ends with a timed exam.</p>
      </header>
      {PHASES.map((ph) => {
        const phaseOpen = isPhaseUnlocked(ph.id, s);
        const examOpen = isExamUnlocked(ph, s);
        const examPassed = !!s.phases[ph.id]?.examPassed;
        return (
          <section key={ph.id} className={`phase ${phaseOpen ? '' : 'locked'}`}>
            <div className="phase-head">
              <span className="phase-num">Phase {ph.id}</span>
              <div>
                <h2>{ph.title}</h2>
                <p className="muted"><b>{ph.storyTitle}.</b> {ph.story}</p>
              </div>
            </div>
            <ol className="path">
              {ph.modules.map((m, i) => {
                const open = isModuleUnlocked(m.id, s);
                const g = gateStatus(m, s);
                const solved = m.problems.filter((p) => s.problems[p.id]?.solved).length;
                const state = g.passed ? 'passed' : open ? 'current' : 'locked';
                return (
                  <li key={m.id} className={`node ${state} ${i % 2 ? 'alt' : ''}`}>
                    <span className="node-dot" aria-hidden>{g.passed ? '✓' : open ? m.id : '🔒'}</span>
                    {open ? (
                      <Link to={`/module/${m.id}`} className="node-card">
                        <span className="muted small">Module {m.id}</span>
                        <b>{m.title}</b>
                        <span className="small muted">{m.tagline}</span>
                        <span className="node-meta small">{solved}/{m.problems.length} solved{g.passed ? ' · mastered' : ''}</span>
                      </Link>
                    ) : (
                      <div className="node-card" aria-disabled>
                        <span className="muted small">Module {m.id}</span>
                        <b>{m.title}</b>
                        <span className="small muted">Pass the previous gate to unlock.</span>
                      </div>
                    )}
                  </li>
                );
              })}
              <li className={`node exam ${examPassed ? 'passed' : examOpen ? 'current' : 'locked'}`}>
                <span className="node-dot" aria-hidden>{examPassed ? '🏆' : examOpen ? '🎓' : '🔒'}</span>
                {examOpen ? (
                  <Link to={`/exam/${ph.id}`} className="node-card">
                    <span className="muted small">Phase gate</span>
                    <b>{ph.exam.title}</b>
                    <span className="small muted">{ph.exam.problems.length} problems · {ph.exam.minutes} min · pass {ph.exam.passPct}%</span>
                    {s.phases[ph.id]?.bestScore ? <span className="node-meta small">Best: {s.phases[ph.id].bestScore}%</span> : null}
                  </Link>
                ) : (
                  <div className="node-card" aria-disabled><span className="muted small">Phase gate</span><b>{ph.exam.title}</b><span className="small muted">Master every module in this phase to unlock.</span></div>
                )}
              </li>
            </ol>
          </section>
        );
      })}
      {UPCOMING_PHASES.map((u) => (
        <section key={u.id} className="phase upcoming">
          <div className="phase-head">
            <span className="phase-num">Phase {u.id}</span>
            <div><h2>{u.title}</h2><p className="muted"><b>{u.storyTitle}.</b> {u.modules} modules · coming soon</p></div>
          </div>
        </section>
      ))}
    </div>
  );
}
