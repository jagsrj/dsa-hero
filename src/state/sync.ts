// Accounts and cloud progress. Learners can use DSA Hero as a guest (progress in this browser),
// or create a profile (username + password, or Google) to save progress in the cloud and use any device.
// Syncing works like KinFit: pull, merge (never overwrite), push only when something changed,
// in the background about 20 seconds after progress, and when the page is hidden.
import { useSyncExternalStore } from 'react';
import { getState, initialState, onLocalChange, pushToast, replaceState, type ProblemProgress, type State } from './store';

/** Clear this profile's progress from the device, keeping device settings (theme, sound). */
function clearLocalProgress() {
  const cur = getState();
  replaceState({ ...initialState(), settings: cur.settings, onboarded: true });
}

export interface PublicUser { username: string; google: boolean; hasPassword: boolean; email: string | null; createdAt: string }
export interface AuthState {
  user: PublicUser | null;
  /** null until the server has answered */
  accounts: boolean | null;
  google: boolean;
  syncing: boolean;
  last: number;
  error: string | null;
}

let auth: AuthState = { user: null, accounts: null, google: false, syncing: false, last: 0, error: null };
const listeners = new Set<() => void>();
function setAuth(next: Partial<AuthState>) {
  auth = { ...auth, ...next };
  listeners.forEach((l) => l());
}
export function useAuth(): AuthState {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => auth);
}
export const getAuth = () => auth;

// ---------------- payload & merge ----------------
/** Everything except device-only settings. */
export function toPayload(s: State) {
  const { settings: _settings, deviceId: _device, ...rest } = s;
  void _settings; void _device;
  return rest;
}
type Payload = ReturnType<typeof toPayload>;

const max = (a = 0, b = 0) => Math.max(a, b);
const minDate = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);

function mergeProblem(a?: ProblemProgress, b?: ProblemProgress): ProblemProgress {
  if (!a) return b!;
  if (!b) return a;
  const answered = a.complexityAnswered ? a : b;
  return {
    solved: a.solved || b.solved,
    solvedAt: minDate(a.solvedAt, b.solvedAt),
    attempts: max(a.attempts, b.attempts),
    hintsUsed: max(a.hintsUsed, b.hintsUsed),
    bestPassed: max(a.bestPassed, b.bestPassed),
    total: max(a.total, b.total),
    sawSolution: !!(a.sawSolution || b.sawSolution),
    complexityAnswered: !!(a.complexityAnswered || b.complexityAnswered),
    complexityOk: answered.complexityAnswered ? !!answered.complexityOk : undefined,
    xpAwarded: max(a.xpAwarded, b.xpAwarded),
  };
}

function mergeRecord<T>(a: Record<string, T> | undefined, b: Record<string, T> | undefined, fn: (x?: T, y?: T) => T): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])) out[k] = fn(a?.[k], b?.[k]);
  return out;
}

/** Merge local state with a remote payload. Progress only ever moves forward; nothing earned is lost. */
export function mergeState(local: State, remote: Partial<Payload> | null | undefined): State {
  if (!remote || typeof remote !== 'object') return local;
  const R = remote as Payload;
  const xpByDevice = mergeRecord(local.xpByDevice, R.xpByDevice, (x = 0, y = 0) => Math.max(x, y));
  const xp = Object.values(xpByDevice).reduce((a, b) => a + b, 0);

  // newest code wins, per problem
  const code: Record<string, string> = {};
  const codeAt: Record<string, number> = {};
  for (const k of new Set([...Object.keys(local.code ?? {}), ...Object.keys(R.code ?? {})])) {
    const lt = local.codeAt?.[k] ?? 0, rt = R.codeAt?.[k] ?? 0;
    const useRemote = R.code?.[k] !== undefined && (local.code?.[k] === undefined || rt > lt);
    code[k] = useRemote ? R.code[k] : local.code[k];
    codeAt[k] = Math.max(lt, rt);
  }

  // streak: the device that practised most recently is authoritative; longest is the best of both
  const ls = local.streak, rs = R.streak ?? ls;
  const newer = (rs.lastDay ?? '') > (ls.lastDay ?? '') || ((rs.lastDay ?? '') === (ls.lastDay ?? '') && rs.current > ls.current) ? rs : ls;
  const streak = {
    current: newer.current,
    longest: Math.max(ls.longest, rs.longest),
    lastDay: newer.lastDay,
    freezes: newer.freezes,
    frozenDays: [...new Set([...(ls.frozenDays ?? []), ...(rs.frozenDays ?? [])])].sort().slice(-400),
  };

  return {
    ...local,
    name: local.name || R.name || '',
    createdAt: minDate(local.createdAt, R.createdAt) ?? local.createdAt,
    onboarded: local.onboarded || !!R.onboarded,
    xp,
    xpByDevice,
    days: mergeRecord(local.days, R.days, (a, b) => ({ solves: max(a?.solves, b?.solves), reviews: max(a?.reviews, b?.reviews), xp: max(a?.xp, b?.xp) })),
    streak,
    problems: mergeRecord(local.problems, R.problems, mergeProblem),
    code,
    codeAt,
    modules: mergeRecord(local.modules, R.modules, (a, b) => {
      if (!a) return b!;
      if (!b) return a;
      const quiz = a.gateAnswerOk ? a : b.gateAnswerOk ? b : a;
      const explain = a.explainOk ? a : b.explainOk ? b : a;
      return {
        visited: !!(a.visited || b.visited),
        gateAnswer: quiz.gateAnswer, gateAnswerOk: !!(a.gateAnswerOk || b.gateAnswerOk),
        explainBack: explain.explainBack, explainOk: !!(a.explainOk || b.explainOk),
        gatePassed: !!(a.gatePassed || b.gatePassed),
        gatePassedAt: minDate(a.gatePassedAt, b.gatePassedAt),
      };
    }),
    phases: mergeRecord(local.phases, R.phases, (a, b) => {
      if (!a) return b!;
      if (!b) return a;
      const att = (b.attempt?.startedAt ?? 0) > (a.attempt?.startedAt ?? 0) ? b.attempt : a.attempt;
      return { examPassed: a.examPassed || b.examPassed, bestScore: Math.max(a.bestScore, b.bestScore), attempt: att };
    }),
    // the card reviewed most recently (latest due date) wins
    review: mergeRecord(local.review, R.review, (a, b) => (!a ? b! : !b ? a : a.due >= b.due ? a : b)),
    badges: mergeRecord(local.badges, R.badges, (a, b) => minDate(a, b)!),
    counters: {
      cleanSolves: max(local.counters.cleanSolves, R.counters?.cleanSolves),
      reviewsDone: max(local.counters.reviewsDone, R.counters?.reviewsDone),
      bossesDefeated: max(local.counters.bossesDefeated, R.counters?.bossesDefeated),
      nightSolves: max(local.counters.nightSolves, R.counters?.nightSolves),
      earlySolves: max(local.counters.earlySolves, R.counters?.earlySolves),
    },
    daily: mergeRecord(local.daily, R.daily, (a, b) => (!a ? b! : !b ? a : { problemId: a.problemId, done: a.done || b.done })),
  };
}


/** Same data → same text, whatever order the keys were written in. */
const canon = (x: unknown) => JSON.stringify(x, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((o: Record<string, unknown>, key) => { o[key] = v[key]; return o; }, {}) : v));

// ---------------- network ----------------
async function api(path: string, body?: Record<string, unknown>) {
  const r = await fetch(path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' } : { credentials: 'same-origin' });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `http_${r.status}`);
  return d;
}

export function errorText(e: string): string {
  switch (e) {
    case 'not_configured': return "Profiles aren't switched on for this website yet (the site owner needs to add a KV binding).";
    case 'storage_busy': return 'Storage is busy right now. Your progress is safe on this device and will save later.';
    case 'rate_limited': return 'Too many attempts in a short time. Please wait a few minutes and try again.';
    case 'bad_username': return 'Usernames are 3–24 characters: lower-case letters, numbers and underscores.';
    case 'weak_password': return 'Use a password of at least 8 characters.';
    case 'username_taken': return 'That username is taken. Try another one.';
    case 'bad_login': return 'Wrong username or password.';
    case 'google_only': return 'This profile signs in with Google. Use "Continue with Google".';
    case 'bad_recovery': return "That recovery code doesn't match this username.";
    case 'signed_out': return 'You were signed out. Please sign in again.';
    case 'too_large': return 'Your saved progress is too large to back up.';
    default: return "Couldn't reach the server. Check your internet connection.";
  }
}

/** Ask the server who is signed in and what it supports. */
export async function refreshAuth() {
  try {
    const [me, cfg] = await Promise.all([api('/api/auth/me'), api('/api/auth/config')]);
    setAuth({ user: me.user ?? null, accounts: !!cfg.accounts, google: !!cfg.google });
  } catch {
    // functions not available (e.g. plain static hosting): guest mode only
    setAuth({ accounts: false, google: false });
  }
}

/** Pull, merge, push if changed. Returns true on success. */
export async function syncNow(silent = true): Promise<boolean> {
  if (!auth.user || auth.syncing) return false;
  setAuth({ syncing: true });
  try {
    const remote = await api('/api/progress', { op: 'get' });
    const merged = mergeState(getState(), remote.data);
    replaceState(merged);
    const out = toPayload(merged);
    if (!remote.data || canon(out) !== canon(remote.data)) await api('/api/progress', { op: 'put', data: out });
    setAuth({ syncing: false, last: Date.now(), error: null });
    if (!silent) pushToast({ kind: 'info', title: '☁️ Saved to your profile' });
    return true;
  } catch (e) {
    const msg = (e as Error).message;
    setAuth({ syncing: false, error: msg, ...(msg === 'signed_out' ? { user: null } : {}) });
    if (!silent) pushToast({ kind: 'info', title: 'Sync failed', body: errorText(msg) });
    return false;
  }
}

let timer: number | null = null;
function syncSoon() {
  if (!auth.user) return;
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => { timer = null; syncNow(true); }, 20_000);
}
function flush() {
  if (timer) { clearTimeout(timer); timer = null; syncNow(true); }
}

// ---------------- account actions ----------------
export async function signUp(username: string, password: string): Promise<{ ok: boolean; error?: string; recoveryCode?: string }> {
  try {
    const d = await api('/api/auth/signup', { username: username.trim().toLowerCase(), password });
    setAuth({ user: d.user, error: null });
    await syncNow(true); // guest progress moves into the new profile
    return { ok: true, recoveryCode: d.recoveryCode };
  } catch (e) { return { ok: false, error: errorText((e as Error).message) }; }
}

export async function signIn(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const d = await api('/api/auth/login', { username: username.trim().toLowerCase(), password });
    setAuth({ user: d.user, error: null });
    await syncNow(true); // merges this device's progress with the profile
    pushToast({ kind: 'info', title: `Welcome back, ${d.user.username}` });
    return { ok: true };
  } catch (e) { return { ok: false, error: errorText((e as Error).message) }; }
}

export async function resetPassword(username: string, recoveryCode: string, password: string): Promise<{ ok: boolean; error?: string; recoveryCode?: string }> {
  try {
    const d = await api('/api/auth/reset', { username: username.trim().toLowerCase(), recoveryCode, password });
    setAuth({ user: d.user, error: null });
    await syncNow(true);
    return { ok: true, recoveryCode: d.recoveryCode };
  } catch (e) { return { ok: false, error: errorText((e as Error).message) }; }
}

/** Signs out and removes this profile's progress from this device (it stays in the cloud). */
export async function signOut() {
  await syncNow(true); // save anything pending first
  try { await api('/api/auth/logout', {}); } catch { /* cookie is cleared server-side; ignore network errors */ }
  setAuth({ user: null, last: 0, error: null });
  clearLocalProgress();
}

export async function changePassword(current: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try { const d = await api('/api/auth/account', { op: 'password', current, password }); setAuth({ user: d.user }); return { ok: true }; }
  catch (e) { return { ok: false, error: errorText((e as Error).message) }; }
}

export async function newRecoveryCode(): Promise<string | null> {
  try { return (await api('/api/auth/account', { op: 'recovery' })).recoveryCode; } catch { return null; }
}

export async function deleteAccount(confirmName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await api('/api/auth/account', { op: 'delete', confirm: confirmName });
    setAuth({ user: null, last: 0 });
    clearLocalProgress();
    return { ok: true };
  } catch (e) { return { ok: false, error: errorText((e as Error).message) }; }
}

export async function listSnapshots(): Promise<string[]> {
  try { return (await api('/api/progress', { op: 'snapshots' })).dates ?? []; } catch { return []; }
}

/** Replace progress with a daily snapshot, on this device and in the profile. */
export async function restoreSnapshot(date: string): Promise<boolean> {
  try {
    const { data } = await api('/api/progress', { op: 'snapshot', date });
    if (!data) return false;
    const cur = getState();
    const restored = { ...cur, ...data, deviceId: cur.deviceId, settings: cur.settings } as State;
    replaceState(restored);
    await api('/api/progress', { op: 'put', data: toPayload(restored) });
    setAuth({ last: Date.now(), error: null });
    return true;
  } catch { return false; }
}

let started = false;
/** Wire up: check the session on load, sync after changes and when the page is hidden. */
export function startSync() {
  if (started || typeof window === 'undefined') return;
  started = true;
  onLocalChange(syncSoon);
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  addEventListener('online', () => { if (auth.user) syncNow(true); });
  refreshAuth().then(() => { if (auth.user) syncNow(true); });
}
