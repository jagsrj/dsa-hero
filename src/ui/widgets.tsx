import { useEffect } from 'react';
import { addDays, dayKey } from '../state/dates';
import { dismissCelebration, effectiveStreak, useProgress, useUi, type State } from '../state/store';
import { levelInfo } from '../state/progress';

export function Flame({ lit, size = 22 }: { lit: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={`flame ${lit ? 'lit' : ''}`}>
      <path d="M12 2c1 3.5 4.5 5.4 4.5 10.2A4.5 4.5 0 0 1 12 17a4.5 4.5 0 0 1-4.5-4.8c0-2 .9-3.4 2-4.6.3 1.4 1 2.3 2 2.8C11 8.2 11.2 5 12 2Z" />
      <path className="flame-core" d="M12 22a6 6 0 0 1-6-6c0-1.2.3-2.3.9-3.2.5 2.6 2.6 4.6 5.1 4.6s4.6-2 5.1-4.6c.6.9.9 2 .9 3.2a6 6 0 0 1-6 6Z" />
    </svg>
  );
}

export function StreakChip() {
  const s = useProgress();
  const st = effectiveStreak(s);
  return (
    <span className={`chip streak ${st.doneToday ? 'done' : ''}`} title={st.doneToday ? 'Streak secured for today' : st.atRisk ? 'Solve 1 problem or review 5 cards today to keep your streak' : 'Start a streak today'}>
      <Flame lit={st.doneToday} size={18} /> {st.current}
      {s.streak.freezes > 0 && <span className="freeze" title={`${s.streak.freezes} streak freeze${s.streak.freezes > 1 ? 's' : ''}`}>🧊{s.streak.freezes > 1 ? s.streak.freezes : ''}</span>}
    </span>
  );
}

export function XpChip() {
  const s = useProgress();
  const lv = levelInfo(s);
  return (
    <span className="chip xp" title={`Level ${lv.level}: ${lv.title}`}>
      <span className="lv">Lv {lv.level}</span> {s.xp.toLocaleString()} XP
    </span>
  );
}

export function Heatmap({ s, weeks = 16 }: { s: State; weeks?: number }) {
  const today = dayKey();
  const todayDate = new Date();
  const startOffset = (weeks - 1) * 7 + todayDate.getDay();
  const start = addDays(today, -startOffset);
  const cols: { key: string; level: number; frozen: boolean; future: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const key = addDays(start, w * 7 + d);
      const a = s.days[key];
      const score = a ? a.solves * 2 + Math.floor(a.reviews / 5) : 0;
      const level = score === 0 ? 0 : score <= 2 ? 1 : score <= 5 ? 2 : score <= 9 ? 3 : 4;
      col.push({ key, level, frozen: s.streak.frozenDays.includes(key), future: key > today });
    }
    cols.push(col);
  }
  const active = Object.values(s.days).filter((d) => d.solves > 0 || d.reviews >= 5).length;
  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="img" aria-label={`Activity over the last ${weeks} weeks: ${active} active days`}>
        {cols.map((col, i) => (
          <div key={i} className="hm-col">
            {col.map((c) => <span key={c.key} className={`hm l${c.level}${c.frozen ? ' frozen' : ''}${c.future ? ' future' : ''}${c.key === today ? ' today' : ''}`} title={`${c.key}${c.frozen ? ' (freeze used)' : ''}`} />)}
          </div>
        ))}
      </div>
      <div className="hm-legend muted small"><span>Less</span>{[0, 1, 2, 3, 4].map((l) => <span key={l} className={`hm l${l}`} />)}<span>More</span><span className="hm frozen" /> <span>freeze</span></div>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useUi();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          <b>{t.title}</b>
          {t.body && <span>{t.body}</span>}
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 12) * 0.08}s`, background: ['#ff6b35', '#f5b700', '#0ea5a4', '#7c5cff', '#22a06b'][i % 5], transform: `rotate(${i * 29}deg)` }} />
      ))}
    </div>
  );
}

export function CelebrationModal() {
  const { celebration } = useUi();
  const s = useProgress();
  useEffect(() => {
    if (!celebration) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissCelebration(); };
    window.addEventListener('keydown', onKey);
    if (s.settings.sound) chime();
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebration]);
  if (!celebration) return null;
  const icon = { gate: '🏅', phase: '🚀', boss: '⚔️', streak: '🔥' }[celebration.kind];
  return (
    <div className="modal-backdrop" onClick={dismissCelebration}>
      <Confetti />
      <div className="modal celebrate" role="dialog" aria-modal="true" aria-labelledby="cel-title" onClick={(e) => e.stopPropagation()}>
        <div className="cel-icon">{icon}</div>
        <h2 id="cel-title">{celebration.title}</h2>
        <p>{celebration.body}</p>
        <button className="btn primary" autoFocus onClick={dismissCelebration}>Keep going</button>
      </div>
    </div>
  );
}

function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.09);
      o.stop(ctx.currentTime + i * 0.09 + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* audio unavailable */ }
}

export function ProgressRing({ pct, size = 56, stroke = 6, label }: { pct: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" role="img" aria-label={label ?? `${Math.round(pct)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="ring-bg" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="ring-fg" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">{Math.round(pct)}%</text>
    </svg>
  );
}
