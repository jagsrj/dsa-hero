import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dueCards, gradeCard } from '../state/progress';
import { useProgress } from '../state/store';
import { Markdown } from '../ui/Markdown';

export function ReviewPage() {
  const s = useProgress();
  // snapshot the queue when the page opens so cards don't jump around while grading
  const [queue] = useState(() => dueCards(s));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ knew: 0, again: 0 });
  const total = Object.keys(s.review).length;
  const upcoming = useMemo(() => Object.values(s.review).map((r) => r.due).sort()[0], [s.review]);

  if (queue.length === 0) {
    return (
      <div className="review empty card">
        <h1>🗂 Spaced review</h1>
        {total === 0
          ? <p>Your deck is empty. Each time you pass a mastery gate, that module's key facts are added here and resurface after 1, 3, 7 and 21 days — just before you'd forget them.</p>
          : <p>All caught up! {total} cards in your deck. Next review: <b>{upcoming}</b>.</p>}
        <Link className="btn primary" to="/">Back home</Link>
      </div>
    );
  }

  if (i >= queue.length) {
    return (
      <div className="review done card">
        <h1>Review complete ✓</h1>
        <p>{stats.knew} remembered · {stats.again} to see again tomorrow.</p>
        <p className="muted small">Five reviews in a day count toward your streak.</p>
        <Link className="btn primary" to="/">Back home</Link>
      </div>
    );
  }

  const c = queue[i];
  const grade = (knew: boolean) => {
    gradeCard(c.id, knew);
    setStats((x) => ({ knew: x.knew + (knew ? 1 : 0), again: x.again + (knew ? 0 : 1) }));
    setFlipped(false);
    setI(i + 1);
  };

  return (
    <div className="review">
      <header className="page-head">
        <p className="eyebrow">Spaced review · card {i + 1} of {queue.length}</p>
        <div className="meter"><div style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      </header>
      <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Card answer' : 'Card question — tap to reveal the answer'}>
        <span className="fc-module muted small">Module {c.moduleId} · {c.moduleTitle}</span>
        <div className="fc-face"><Markdown text={flipped ? c.back : c.front} /></div>
        {!flipped && <span className="muted small">Tap to reveal</span>}
      </button>
      {flipped ? (
        <div className="grade">
          <button className="btn warn lg" onClick={() => grade(false)}>Forgot — again tomorrow</button>
          <button className="btn good lg" onClick={() => grade(true)}>Got it</button>
        </div>
      ) : (
        <div className="grade"><button className="btn primary lg" onClick={() => setFlipped(true)}>Show answer</button></div>
      )}
    </div>
  );
}
