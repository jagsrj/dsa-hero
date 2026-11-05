import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { PHASES } from '../content';
import { examSolved, isExamUnlocked, startExam, submitExam } from '../state/progress';
import { useProgress } from '../state/store';
import { ProblemWorkspace } from '../ui/ProblemWorkspace';

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function ExamPage() {
  const { phaseId } = useParams();
  const nav = useNavigate();
  const s = useProgress();
  const phase = PHASES.find((p) => String(p.id) === phaseId);
  const att = phase ? s.phases[phase.id]?.attempt : undefined;
  const live = !!att && !att.submitted;
  const now = useNow(live);
  const [current, setCurrent] = useState<string | null>(null);

  const remaining = att ? Math.max(0, att.endsAt - now) : 0;
  useEffect(() => {
    if (phase && live && remaining <= 0) submitExam(phase);
  }, [phase, live, remaining]);

  if (!phase) return <Navigate to="/learn" replace />;
  if (!isExamUnlocked(phase, s)) {
    return (
      <div className="locked-page card">
        <h1>🔒 Phase {phase.id} gate</h1>
        <p>Master every module in this phase to unlock the exam.</p>
        <Link className="btn primary" to="/learn">Course map</Link>
      </div>
    );
  }

  const solved = examSolved(phase, s);
  const pp = s.phases[phase.id];

  if (!live) {
    const last = att?.submitted ? att : undefined;
    return (
      <div className="exam-intro card">
        <p className="eyebrow">Phase {phase.id} gate</p>
        <h1>{phase.exam.title}</h1>
        {last && (
          <div className={`feedback ${last.passed ? 'good' : 'mixed'}`}>
            <h3>{last.passed ? `Passed with ${last.scorePct}% 🎉` : `Scored ${last.scorePct}% — you need ${phase.exam.passPct}%`}</h3>
            <p>{last.passed ? 'This phase is complete. The next level is yours.' : 'Review the modules where you struggled, then try again. A new attempt starts a fresh timer.'}</p>
          </div>
        )}
        <ul className="rules">
          <li><b>{phase.exam.problems.length} unseen problems</b> mixing every module in this phase.</li>
          <li><b>{phase.exam.minutes} minutes.</b> The timer keeps running if you leave this page.</li>
          <li><b>No hints, no solutions.</b> Just you, Java and the tests.</li>
          <li>Pass mark: <b>{phase.exam.passPct}%</b> of problems fully solved (all tests, including hidden).</li>
        </ul>
        {pp?.examPassed && <p className="ok-text">You've already passed this gate (best {pp.bestScore}%). Retaking is optional practice.</p>}
        <button className="btn primary lg" onClick={() => { startExam(phase); setCurrent(phase.exam.problems[0].id); }}>{last ? 'Start a new attempt' : 'Start the exam'} ⏱</button>
      </div>
    );
  }

  const mm = Math.floor(remaining / 60000), ss = Math.floor((remaining % 60000) / 1000);
  const cur = phase.exam.problems.find((p) => p.id === current) ?? phase.exam.problems[0];

  return (
    <div className="exam-page">
      <div className="exam-bar">
        <b>Phase {phase.id} gate</b>
        <div className="exam-tabs" role="tablist">
          {phase.exam.problems.map((p, i) => (
            <button key={p.id} role="tab" aria-selected={p.id === cur.id} className={`${p.id === cur.id ? 'on' : ''} ${solved.includes(p.id) ? 'solved' : ''}`} onClick={() => setCurrent(p.id)}>
              {solved.includes(p.id) ? '✓' : i + 1}
            </button>
          ))}
        </div>
        <span className={`timer ${remaining < 5 * 60000 ? 'low' : ''}`} aria-live="off">⏱ {mm}:{String(ss).padStart(2, '0')}</span>
        <span className="small">{solved.length}/{phase.exam.problems.length} solved</span>
        <button className="btn warn sm" onClick={() => { if (confirm('Submit the exam now? Unsolved problems count as 0.')) submitExam(phase); }}>Finish exam</button>
      </div>
      <ProblemWorkspace problem={cur} exam navigate={nav} onSolved={() => {
        const nextUnsolved = phase.exam.problems.find((p) => p.id !== cur.id && !examSolved(phase, s).includes(p.id));
        if (nextUnsolved) setTimeout(() => setCurrent(nextUnsolved.id), 1200);
      }} />
    </div>
  );
}
