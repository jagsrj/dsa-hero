import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PHASES, findProblem } from '../content';
import { dayKey } from '../state/dates';
import { currentModule, dueCards, ensureDaily, gateStatus, levelInfo, nextStep, LEVELS } from '../state/progress';
import { effectiveStreak, update, useProgress } from '../state/store';
import { Flame, Heatmap, ProgressRing } from '../ui/widgets';

function Onboarding() {
  const [name, setName] = useState('');
  const nav = useNavigate();
  const start = () => {
    update((s) => { s.name = name.trim(); s.onboarded = true; });
    nav('/module/0.1');
  };
  return (
    <div className="onboard">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Zero to DSA Hero · in Java</p>
          <h1>Learn data structures and algorithms <span className="accent">one concept at a time.</span></h1>
          <p className="lead">Start with no coding experience. Finish able to solve interview-grade problems in clean Java — and explain why your solution is fast.</p>
          <form className="hero-form" onSubmit={(e) => { e.preventDefault(); start(); }}>
            <label htmlFor="nm" className="sr-only">Your first name</label>
            <input id="nm" placeholder="Your first name (optional)" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
            <button className="btn primary lg" type="submit">Start lesson 1 →</button>
          </form>
          <p className="muted small">Free. No account needed — your progress is saved in this browser.</p>
        </div>
        <div className="hero-art" aria-hidden>
          <div className="hero-card c1"><span className="pill guided">Concept</span><b>Big-O</b><span>How code scales</span></div>
          <div className="hero-card c2"><span className="pill mastery">Practice</span><b>Two pointers</b><span>5 problems · tests run in your browser</span></div>
          <div className="hero-card c3"><span className="pill boss">Boss</span><b>Container With Most Water</b><span>+150 XP</span></div>
          <div className="hero-card c4"><Flame lit size={28} /><b>12-day streak</b></div>
        </div>
      </section>
      <section className="how">
        <h2>How it works</h2>
        <ol className="steps">
          <li><b>Learn one concept</b><span>A short story, a clear explanation and an animated visualizer.</span></li>
          <li><b>Solve one problem — guided</b><span>Write real Java in the browser. Progressive hints if you're stuck.</span></li>
          <li><b>Prove mastery</b><span>A mastery set, a boss problem, a complexity check and an "explain it back" prompt. Only then does the next module unlock.</span></li>
          <li><b>Keep it</b><span>Spaced-review cards and a daily streak keep everything fresh.</span></li>
        </ol>
      </section>
      <section className="roadmap-strip">
        {['Java foundations', 'Linear structures', 'Recursion & sorting', 'Hashing & trees', 'Graphs', 'Greedy & DP', 'Hero track'].map((t, i) => (
          <div key={t} className={`rm ${i < 2 ? 'live' : ''}`}><span>Phase {i}</span><b>{t}</b>{i >= 2 && <em>coming soon</em>}</div>
        ))}
      </section>
    </div>
  );
}

export function Home() {
  const s = useProgress();
  useEffect(() => { if (s.onboarded) ensureDaily(s); }, [s]);
  if (!s.onboarded) return <Onboarding />;

  const st = effectiveStreak(s);
  const lv = levelInfo(s);
  const step = nextStep(s);
  const due = dueCards(s);
  const today = dayKey();
  const daily = s.daily[today];
  const dailyP = daily ? findProblem(daily.problemId) : undefined;
  const cm = currentModule(s);
  const g = cm ? gateStatus(cm, s) : null;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todayAct = s.days[today];

  return (
    <div className="home">
      <header className="home-head">
        <div>
          <p className="eyebrow">{LEVELS[lv.level - 1]} · Level {lv.level}</p>
          <h1>{greet}{s.name ? `, ${s.name}` : ''}.</h1>
          <p className="muted">{st.doneToday ? 'Your streak is safe for today. Anything more is a bonus. 🙌' : st.current > 0 ? 'Solve one problem or review 5 cards to keep your streak alive.' : 'Solve one problem today to light your streak.'}</p>
        </div>
      </header>

      <div className="grid-home">
        <section className="card continue">
          <p className="eyebrow">Up next</p>
          <h2>{step.label}</h2>
          <p className="muted">{step.detail}</p>
          {cm && g && (
            <div className="mini-gate">
              <span className={g.guidedSolved ? 'ok' : ''}>Guided</span>
              <span className={g.masteryOk ? 'ok' : ''}>Mastery {g.masteryPct}%</span>
              <span className={g.bossSolved ? 'ok' : ''}>Boss</span>
              <span className={g.quizOk && g.explainOk ? 'ok' : ''}>Gate</span>
            </div>
          )}
          <Link className="btn primary lg" to={step.href}>Continue →</Link>
        </section>

        <section className={`card streak-card ${st.doneToday ? 'done' : ''}`}>
          <div className="streak-big"><Flame lit={st.doneToday} size={44} /><span>{st.current}</span></div>
          <p><b>day streak</b>{s.streak.longest > 0 && <span className="muted small"> · best {s.streak.longest}</span>}</p>
          <p className="small muted">{s.streak.freezes > 0 ? `🧊 ${s.streak.freezes} freeze${s.streak.freezes > 1 ? 's' : ''} ready — protects a missed day.` : 'Earn a streak freeze every 7 days.'}</p>
          {st.freezeWillCover && <p className="small warn-text">You missed a day — a freeze will cover it if you practise today.</p>}
          <div className="today-bar small">
            <span className={todayAct?.solves ? 'ok' : ''}>✓ {todayAct?.solves ?? 0} solved</span>
            <span className={(todayAct?.reviews ?? 0) >= 5 ? 'ok' : ''}>🗂 {todayAct?.reviews ?? 0}/5 reviews</span>
          </div>
        </section>

        <section className="card daily">
          <p className="eyebrow">Daily challenge <span className="pill xp tiny">+30 XP</span></p>
          {dailyP ? (
            <>
              <h3>{dailyP.problem.title}</h3>
              <p className="muted small">{dailyP.module ? `Module ${dailyP.module.id} · ${dailyP.module.title}` : ''}{s.problems[dailyP.problem.id]?.solved && !daily?.done ? ' · solve it again from memory' : ''}</p>
              {daily?.done ? <p className="ok-text">Done for today ✓</p> : <Link className="btn" to={`/problem/${dailyP.problem.id}`}>Take the challenge</Link>}
            </>
          ) : <p className="muted">Unlocks after your first lesson.</p>}
        </section>

        <section className="card review-card">
          <p className="eyebrow">Spaced review</p>
          <h3>{due.length ? `${due.length} card${due.length > 1 ? 's' : ''} due` : 'Nothing due'}</h3>
          <p className="muted small">{due.length ? 'Five minutes now saves hours of re-learning later.' : 'Pass a mastery gate to add cards to your deck.'}</p>
          {due.length > 0 && <Link className="btn" to="/review">Review now</Link>}
        </section>

        <section className="card level-card">
          <p className="eyebrow">Your journey</p>
          <div className="phases-mini">
            {PHASES.map((ph) => {
              const done = ph.modules.filter((m) => s.modules[m.id]?.gatePassed).length;
              const pct = ((done + (s.phases[ph.id]?.examPassed ? 1 : 0)) / (ph.modules.length + 1)) * 100;
              return (
                <Link key={ph.id} to="/learn" className="phase-mini">
                  <ProgressRing pct={pct} size={52} label={`Phase ${ph.id}: ${Math.round(pct)}% complete`} />
                  <div><b>Phase {ph.id}</b><span className="muted small">{ph.title}</span><span className="small">{done}/{ph.modules.length} modules{s.phases[ph.id]?.examPassed ? ' · gate passed' : ''}</span></div>
                </Link>
              );
            })}
          </div>
          {lv.next && <p className="small muted">Next level: <b>{lv.next}</b> — pass the Phase {lv.level - 1} gate.</p>}
        </section>

        <section className="card heat-card">
          <p className="eyebrow">Consistency</p>
          <Heatmap s={s} />
        </section>
      </div>
    </div>
  );
}
