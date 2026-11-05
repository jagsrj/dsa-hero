import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword, signIn, signUp, useAuth } from '../state/sync';
import { update, useProgress } from '../state/store';
import { RecoveryCodeSheet } from '../ui/Account';

type Mode = 'signin' | 'signup' | 'reset';

const GOOGLE_ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in isn't set up on this site yet. Use a username and password instead.",
  google_failed: 'Google sign-in failed. Please try again.',
  google_cancelled: 'Google sign-in was cancelled.',
  storage_busy: 'The server is busy. Please try again in a minute.',
};

function GoogleButton({ label }: { label: string }) {
  return (
    <a className="btn google" href="/api/auth/google">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
      {label}
    </a>
  );
}

export function SignInPage() {
  const auth = useAuth();
  const s = useProgress();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) || 'signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(GOOGLE_ERRORS[params.get('error') ?? ''] ?? '');
  const [recovery, setRecovery] = useState<string | null>(null);
  const solved = Object.values(s.problems).filter((p) => p.solved).length;

  useEffect(() => { setError(''); }, [mode]);

  // already signed in (but not while a sign-up is finishing and its recovery code still has to be shown)
  if (auth.user && !recovery && !busy) return <Navigate to="/profile" replace />;

  const finish = () => {
    update((st) => { st.onboarded = true; if (!st.name && auth.user) st.name = auth.user.username; });
    nav(solved ? '/' : '/learn');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    if (mode === 'signin') {
      const r = await signIn(username, password);
      setBusy(false);
      if (r.ok) finish(); else setError(r.error ?? '');
    } else if (mode === 'signup') {
      const r = await signUp(username, password);
      setBusy(false);
      if (r.ok && r.recoveryCode) setRecovery(r.recoveryCode); else setError(r.error ?? '');
    } else {
      const r = await resetPassword(username, code, password);
      setBusy(false);
      if (r.ok && r.recoveryCode) setRecovery(r.recoveryCode); else setError(r.error ?? '');
    }
  };

  const titles: Record<Mode, string> = { signin: 'Welcome back', signup: 'Create your free profile', reset: 'Reset your password' };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>{titles[mode]}</h1>
        {mode === 'signup' && <p className="muted">Save your progress, streak and badges, and continue on any device.{solved ? ` Your ${solved} solved problem${solved > 1 ? 's' : ''} will come with you.` : ''}</p>}
        {mode === 'signin' && <p className="muted">Sign in to continue where you left off. Progress on this device is merged in, so nothing is lost.</p>}
        {mode === 'reset' && <p className="muted">Enter your username, the recovery code you saved when you created your profile, and a new password.</p>}

        {auth.accounts === false && <p className="warn-text small">Profiles aren't switched on for this site yet. You can keep learning as a guest.</p>}

        {mode !== 'reset' && auth.google && (
          <>
            <GoogleButton label={mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'} />
            <div className="or"><span>or</span></div>
          </>
        )}

        <form className="stack" onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input name="username" autoComplete="username" autoCapitalize="off" spellCheck={false} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="e.g. ada_codes" required />
            {mode === 'signup' && <small className="muted">3–24 characters: letters, numbers, underscores. Others can't see it.</small>}
          </label>
          {mode === 'reset' && (
            <label className="field">
              <span>Recovery code</span>
              <input className="code-input" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCD-EFGH-JKLM-NPQR" required />
            </label>
          )}
          <label className="field">
            <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
            <input type="password" name="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={mode === 'signin' ? 1 : 8} required />
            {mode !== 'signin' && <small className="muted">At least 8 characters.</small>}
          </label>
          {error && <p className="bad-text small" role="alert">{error}</p>}
          <button className="btn primary lg" disabled={busy || auth.accounts === false}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create profile' : 'Reset password'}</button>
        </form>

        <div className="auth-links small">
          {mode === 'signin' && <><button className="link-btn" onClick={() => setMode('signup')}>New here? Create a profile</button><button className="link-btn" onClick={() => setMode('reset')}>Forgot password?</button></>}
          {mode === 'signup' && <button className="link-btn" onClick={() => setMode('signin')}>Already have a profile? Sign in</button>}
          {mode === 'reset' && <button className="link-btn" onClick={() => setMode('signin')}>Back to sign in</button>}
          <Link to="/">Continue as a guest</Link>
        </div>
      </div>
      {recovery && auth.user && <RecoveryCodeSheet code={recovery} username={auth.user.username} onClose={() => { setRecovery(null); finish(); }} />}
    </div>
  );
}
