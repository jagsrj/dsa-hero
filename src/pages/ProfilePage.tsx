import { useRef, useState } from 'react';
import { ALL_MODULES } from '../content';
import { levelInfo } from '../state/progress';
import { BADGES, exportProgress, importProgress, resetProgress, update, useProgress } from '../state/store';
import { getEngine } from '../runner/engine';
import { Heatmap } from '../ui/widgets';
import { AccountCard } from '../ui/Account';

export function ProfilePage() {
  const s = useProgress();
  const lv = levelInfo(s);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const solved = Object.values(s.problems).filter((p) => p.solved).length;
  const total = ALL_MODULES.reduce((a, m) => a + m.problems.length, 0);
  const mastered = Object.values(s.modules).filter((m) => m.gatePassed).length;

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-hero-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="profile">
      <header className="page-head">
        <p className="eyebrow">Level {lv.level} · {lv.title}</p>
        <h1>{s.name || 'Your profile'}</h1>
      </header>

      <AccountCard />

      <div className="stats">
        <div className="stat card"><b>{s.xp.toLocaleString()}</b><span>XP</span></div>
        <div className="stat card"><b>{s.streak.current}</b><span>day streak</span></div>
        <div className="stat card"><b>{s.streak.longest}</b><span>best streak</span></div>
        <div className="stat card"><b>{solved}/{total}</b><span>problems solved</span></div>
        <div className="stat card"><b>{mastered}/{ALL_MODULES.length}</b><span>modules mastered</span></div>
        <div className="stat card"><b>{s.counters.bossesDefeated}</b><span>bosses defeated</span></div>
      </div>

      <section className="card">
        <h2>Activity</h2>
        <Heatmap s={s} weeks={26} />
      </section>

      <section className="card">
        <h2>Badges <span className="muted small">{Object.keys(s.badges).length}/{BADGES.length}</span></h2>
        <div className="badges">
          {BADGES.map((b) => {
            const got = s.badges[b.id];
            return (
              <div key={b.id} className={`badge ${got ? 'got' : ''}`} title={b.desc}>
                <span className="b-icon" aria-hidden>{got ? b.icon : '🔒'}</span>
                <b>{b.name}</b>
                <span className="small muted">{b.desc}</span>
                {got && <span className="small">{new Date(got).toLocaleDateString()}</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card settings">
        <h2>Settings</h2>
        <label className="row">
          <span>Name</span>
          <input value={s.name} onChange={(e) => update((st) => { st.name = e.target.value; })} placeholder="Your first name" />
        </label>
        <label className="row">
          <span>Theme</span>
          <select value={s.settings.theme} onChange={(e) => update((st) => { st.settings.theme = e.target.value as 'system' | 'light' | 'dark'; })}>
            <option value="system">Match my device</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="row">
          <span>Celebration sounds</span>
          <input type="checkbox" checked={s.settings.sound} onChange={(e) => update((st) => { st.settings.sound = e.target.checked; })} />
        </label>
        <label className="row">
          <span>Preview mode <span className="muted small">(unlock every module — for teachers and reviewers)</span></span>
          <input type="checkbox" checked={s.settings.previewUnlockAll} onChange={(e) => update((st) => { st.settings.previewUnlockAll = e.target.checked; })} />
        </label>
        <div className="row">
          <span>Java engine</span>
          <span className="muted small">{getEngine().name} · Java 17</span>
        </div>
        <h3>Your data</h3>
        <p className="muted small">Signed-in progress is saved to your profile automatically. You can also export a copy as a file.</p>
        <div className="row wrap">
          <button className="btn" onClick={download}>Export progress</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import progress</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setMsg(importProgress(await f.text()) ? 'Progress imported ✓' : 'That file is not a DSA Hero export.');
          }} />
          <button className="btn warn" onClick={() => { if (confirm('Erase ALL progress, XP, streaks and badges? This cannot be undone.')) { resetProgress(); setMsg('Progress reset.'); } }}>Reset everything</button>
        </div>
        {msg && <p className="small">{msg}</p>}
      </section>
    </div>
  );
}
