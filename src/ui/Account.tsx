import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  changePassword, deleteAccount, errorText, listSnapshots, newRecoveryCode, restoreSnapshot, signOut, syncNow, useAuth,
} from '../state/sync';
import { pushToast, useProgress } from '../state/store';

export function ago(ms: number) {
  if (!ms) return 'not yet';
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ms).toLocaleDateString();
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** Shows a one-time recovery code with ways to keep it (copy, download). */
export function RecoveryCodeSheet({ code, username, onClose }: { code: string; username: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal title="🔑 Save your recovery code" onClose={onClose}>
      <p className="muted small">If you ever forget your password, this code lets you set a new one. <b>It is shown only once.</b> Keep it somewhere safe, like your password manager or notes.</p>
      <div className="code-box" aria-label="Recovery code">{code}</div>
      <p className="small muted">Username: <b>{username}</b></p>
      <div className="row wrap center">
        <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); } catch { /* blocked */ } }}>{copied ? 'Copied ✓' : 'Copy code'}</button>
        <button className="btn" onClick={() => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([`DSA Hero recovery code\n\nUsername: ${username}\nRecovery code: ${code}\n\nUse it on the sign-in page → "Forgot password?"\n`], { type: 'text/plain' }));
          a.download = 'dsa-hero-recovery-code.txt';
          a.click();
          URL.revokeObjectURL(a.href);
        }}>Download</button>
      </div>
      <button className="btn primary" onClick={onClose}>I've saved it</button>
    </Modal>
  );
}

/** Profile page card: create a profile, or manage the signed-in one. */
export function AccountCard() {
  const auth = useAuth();
  const s = useProgress();
  const [sheet, setSheet] = useState<'snapshots' | 'password' | 'delete' | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [snaps, setSnaps] = useState<string[] | null>(null);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');
  const [confirmName, setConfirmName] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('linked') === 'google') { pushToast({ kind: 'info', title: 'Google is now linked to your profile' }); history.replaceState(null, '', location.pathname); }
  }, []);

  if (auth.accounts === false) {
    return (
      <section className="card account-card">
        <h2>☁️ Your profile</h2>
        <p className="muted">Profiles aren't switched on for this site yet, so progress is saved in this browser only. Use <b>Export progress</b> below to back it up.</p>
      </section>
    );
  }

  if (!auth.user) {
    const solved = Object.values(s.problems).filter((p) => p.solved).length;
    return (
      <section className="card account-card">
        <h2>☁️ Save your progress</h2>
        <p className="muted">You're learning as a guest{solved ? ` (${solved} problem${solved > 1 ? 's' : ''} solved)` : ''}, so progress lives only in this browser. Create a free profile to keep it safe and continue on any device. Your guest progress comes with you.</p>
        <div className="row wrap">
          <Link className="btn primary" to="/signin?mode=signup">Create a profile</Link>
          <Link className="btn" to="/signin">Sign in</Link>
        </div>
      </section>
    );
  }

  const u = auth.user;
  return (
    <section className="card account-card">
      <div className="acct-head">
        <span className="avatar lg" aria-hidden>{u.username[0].toUpperCase()}</span>
        <div>
          <h2>{u.username}</h2>
          <p className="small muted">{u.google ? `Google${u.email ? ' · ' + u.email : ''}` : 'Username & password'} · since {new Date(u.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <p><span className={`pill ${auth.error ? 'bad' : 'good'}`}>{auth.error ? 'Not saved' : 'Saved'}</span> <span className="small muted">Last saved {auth.syncing ? 'now…' : ago(auth.last)}. Progress saves automatically.</span></p>
      {auth.error && <p className="small bad-text">{errorText(auth.error)}</p>}
      <div className="row wrap">
        <button className="btn sm" disabled={auth.syncing} onClick={() => syncNow(false)}>{auth.syncing ? 'Saving…' : 'Save now'}</button>
        <button className="btn sm" onClick={async () => { setSheet('snapshots'); setSnaps(null); setSnaps(await listSnapshots()); }}>Daily backups</button>
        <button className="btn sm" onClick={() => { setPw({ current: '', next: '' }); setMsg(''); setSheet('password'); }}>{u.hasPassword ? 'Change password' : 'Set a password'}</button>
        {u.hasPassword && <button className="btn sm" onClick={async () => { if (confirm('Create a new recovery code? Your old one will stop working.')) { const c = await newRecoveryCode(); if (c) setCode(c); else pushToast({ kind: 'info', title: 'Could not create a code. Try again.' }); } }}>New recovery code</button>}
        {auth.google && !u.google && <a className="btn sm" href="/api/auth/google">Link Google</a>}
      </div>
      <div className="row wrap">
        <button className="btn ghost sm" onClick={async () => { if (confirm('Sign out? Your progress is saved in your profile and will be removed from this device.')) { await signOut(); pushToast({ kind: 'info', title: 'Signed out' }); } }}>Sign out</button>
        <button className="btn warn sm" onClick={() => { setConfirmName(''); setMsg(''); setSheet('delete'); }}>Delete profile</button>
      </div>

      {code && <RecoveryCodeSheet code={code} username={u.username} onClose={() => setCode(null)} />}
      {sheet === 'snapshots' && (
        <Modal title="Daily backups" onClose={() => setSheet(null)}>
          <p className="muted small">One copy is kept for each day you made progress (the state before that day's first change), for 30 days. Restoring replaces your current progress.</p>
          {snaps === null ? <div className="run-status"><span className="spinner" aria-hidden />Loading…</div>
            : snaps.length === 0 ? <p>No daily backups yet. They start from your second day of progress.</p>
            : <ul className="snap-list">{snaps.map((d) => (
              <li key={d}><span>{new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <button className="btn sm" onClick={async () => { if (confirm(`Restore your progress to ${d}? Newer progress will be replaced.`)) { const ok = await restoreSnapshot(d); pushToast({ kind: 'info', title: ok ? `Restored to ${d}` : 'Restore failed' }); if (ok) setSheet(null); } }}>Restore</button></li>
            ))}</ul>}
        </Modal>
      )}
      {sheet === 'password' && (
        <Modal title={u.hasPassword ? 'Change password' : 'Set a password'} onClose={() => setSheet(null)}>
          <form className="stack" onSubmit={async (e) => {
            e.preventDefault();
            const r = await changePassword(pw.current, pw.next);
            if (r.ok) { pushToast({ kind: 'info', title: 'Password updated', body: 'Other devices were signed out.' }); setSheet(null); } else setMsg(r.error ?? '');
          }}>
            <input type="text" name="username" autoComplete="username" value={u.username} readOnly hidden />
            {u.hasPassword && <label className="field"><span>Current password</span><input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></label>}
            <label className="field"><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
            {!u.hasPassword && <p className="small muted">With a password you can also sign in with your username, not only with Google.</p>}
            {msg && <p className="small bad-text">{msg}</p>}
            <button className="btn primary" disabled={pw.next.length < 8}>Save password</button>
          </form>
        </Modal>
      )}
      {sheet === 'delete' && (
        <Modal title="Delete your profile?" onClose={() => setSheet(null)}>
          <p>This permanently deletes <b>{u.username}</b> and all saved progress, including daily backups. It can't be undone.</p>
          <label className="field"><span>Type your username to confirm</span><input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoCapitalize="off" /></label>
          {msg && <p className="small bad-text">{msg}</p>}
          <button className="btn warn" disabled={confirmName.trim().toLowerCase() !== u.username} onClick={async () => {
            const r = await deleteAccount(confirmName.trim());
            if (r.ok) { pushToast({ kind: 'info', title: 'Profile deleted' }); setSheet(null); } else setMsg(r.error ?? '');
          }}>Delete forever</button>
        </Modal>
      )}
    </section>
  );
}

/** Home-page nudge for guests who have made progress. */
export function SaveProgressNudge() {
  const auth = useAuth();
  const s = useProgress();
  const solved = Object.values(s.problems).filter((p) => p.solved).length;
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('dsa-nudge-hide') === '1'; } catch { return false; } });
  if (!auth.accounts || auth.user || solved === 0 || hidden) return null;
  return (
    <div className="nudge card">
      <span className="nudge-icon" aria-hidden>☁️</span>
      <div><b>Don't lose your progress</b><p className="small muted">{solved} problem{solved > 1 ? 's' : ''} solved so far, saved only in this browser. Create a free profile to keep it and continue on any device.</p></div>
      <div className="nudge-actions">
        <Link className="btn primary sm" to="/signin?mode=signup">Create profile</Link>
        <button className="btn ghost sm" onClick={() => { setHidden(true); try { sessionStorage.setItem('dsa-nudge-hide', '1'); } catch { /* ignore */ } }}>Later</button>
      </div>
    </div>
  );
}

/** Top-bar profile chip. */
export function ProfileChip() {
  const auth = useAuth();
  if (auth.user) return <Link to="/profile" className="avatar" title={`Signed in as ${auth.user.username}`} aria-label={`Profile: ${auth.user.username}`}>{auth.user.username[0].toUpperCase()}</Link>;
  if (auth.accounts) return <Link to="/signin" className="chip signin">Sign in</Link>;
  return null;
}
