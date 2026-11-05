import { useSyncExternalStore } from 'react';
import { addDays, dayKey, daysBetween } from './dates';

export interface ProblemProgress {
  solved: boolean;
  solvedAt?: string;
  attempts: number;
  hintsUsed: number;
  bestPassed: number;
  total: number;
  sawSolution?: boolean;
  complexityAnswered?: boolean;
  complexityOk?: boolean;
  xpAwarded: number;
}

export interface ModuleProgress {
  visited?: boolean;
  gateAnswer?: number;
  gateAnswerOk?: boolean;
  explainBack?: string;
  explainOk?: boolean;
  gatePassed?: boolean;
  gatePassedAt?: string;
}

export interface ExamAttempt {
  startedAt: number;
  endsAt: number;
  submitted: boolean;
  scorePct?: number;
  passed?: boolean;
}

export interface PhaseProgress {
  examPassed: boolean;
  bestScore: number;
  attempt?: ExamAttempt;
}

export interface DayActivity { solves: number; reviews: number; xp: number }

export interface Toast { id: number; kind: 'xp' | 'badge' | 'streak' | 'info' | 'level'; title: string; body?: string }

export interface Celebration { kind: 'gate' | 'phase' | 'boss' | 'streak'; title: string; body: string }

export interface State {
  version: 1;
  name: string;
  createdAt: string;
  xp: number;
  days: Record<string, DayActivity>;
  streak: { current: number; longest: number; lastDay: string | null; freezes: number; frozenDays: string[] };
  problems: Record<string, ProblemProgress>;
  code: Record<string, string>;
  modules: Record<string, ModuleProgress>;
  phases: Record<number, PhaseProgress>;
  review: Record<string, { box: number; due: string }>;
  badges: Record<string, string>;
  counters: { cleanSolves: number; reviewsDone: number; bossesDefeated: number; nightSolves: number; earlySolves: number };
  daily: Record<string, { problemId: string; done: boolean }>;
  settings: { previewUnlockAll: boolean; sound: boolean; theme: 'system' | 'light' | 'dark' };
  onboarded: boolean;
}

const KEY = 'dsa-hero-progress-v1';

export function initialState(): State {
  return {
    version: 1,
    name: '',
    createdAt: new Date().toISOString(),
    xp: 0,
    days: {},
    streak: { current: 0, longest: 0, lastDay: null, freezes: 0, frozenDays: [] },
    problems: {},
    code: {},
    modules: {},
    phases: {},
    review: {},
    badges: {},
    counters: { cleanSolves: 0, reviewsDone: 0, bossesDefeated: 0, nightSolves: 0, earlySolves: 0 },
    daily: {},
    settings: { previewUnlockAll: false, sound: true, theme: 'system' },
    onboarded: false,
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<State>;
    const base = initialState();
    return { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings }, counters: { ...base.counters, ...parsed.counters }, streak: { ...base.streak, ...parsed.streak } } as State;
  } catch {
    return initialState();
  }
}

let state: State = typeof window === 'undefined' ? initialState() : load();
const listeners = new Set<() => void>();
let toasts: Toast[] = [];
let celebration: Celebration | null = null;
const uiListeners = new Set<() => void>();
let toastId = 1;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

export function getState(): State { return state; }

export function update(fn: (s: State) => void) {
  const next = structuredClone(state);
  fn(next);
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function useProgress(): State {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => state);
}

// ---------- UI events (toasts, celebrations) ----------
export function pushToast(t: Omit<Toast, 'id'>) {
  const toast = { ...t, id: toastId++ };
  toasts = [...toasts, toast];
  uiListeners.forEach((l) => l());
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== toast.id); uiListeners.forEach((l) => l()); }, 4200);
}
export function celebrate(c: Celebration) { celebration = c; uiListeners.forEach((l) => l()); }
export function dismissCelebration() { celebration = null; uiListeners.forEach((l) => l()); }

let uiSnapshot: { toasts: Toast[]; celebration: Celebration | null } = { toasts, celebration };
export function useUi() {
  return useSyncExternalStore((l) => { uiListeners.add(l); return () => uiListeners.delete(l); }, () => {
    if (uiSnapshot.toasts !== toasts || uiSnapshot.celebration !== celebration) uiSnapshot = { toasts, celebration };
    return uiSnapshot;
  });
}

// ---------- streak ----------
export function effectiveStreak(s: State, today = dayKey()): { current: number; atRisk: boolean; freezeWillCover: boolean; doneToday: boolean } {
  const { lastDay, current, freezes } = s.streak;
  if (!lastDay) return { current: 0, atRisk: false, freezeWillCover: false, doneToday: false };
  const gap = daysBetween(lastDay, today);
  if (gap <= 0) return { current, atRisk: false, freezeWillCover: false, doneToday: true };
  const missed = gap - 1;
  if (missed === 0) return { current, atRisk: true, freezeWillCover: false, doneToday: false };
  if (missed <= freezes) return { current, atRisk: true, freezeWillCover: true, doneToday: false };
  return { current: 0, atRisk: false, freezeWillCover: false, doneToday: false };
}

/** Records activity for today and advances the streak when the day first qualifies. */
export function recordActivity(kind: 'solve' | 'review', count = 1) {
  const today = dayKey();
  let streakMsg: Omit<Toast, 'id'> | null = null;
  let milestone: number | null = null;
  update((s) => {
    const d = (s.days[today] ??= { solves: 0, reviews: 0, xp: 0 });
    if (kind === 'solve') d.solves += count; else d.reviews += count;
    const qualifies = d.solves >= 1 || d.reviews >= 5;
    if (!qualifies || s.streak.lastDay === today) return;
    const st = s.streak;
    if (!st.lastDay) st.current = 1;
    else {
      const missed = daysBetween(st.lastDay, today) - 1;
      if (missed <= 0) st.current += 1;
      else if (missed <= st.freezes) {
        st.freezes -= missed;
        for (let i = 1; i <= missed; i++) st.frozenDays.push(addDays(st.lastDay, i));
        st.current += 1;
        streakMsg = { kind: 'streak', title: `Streak saved by ${missed} freeze${missed > 1 ? 's' : ''} 🧊`, body: `You're on ${st.current} days.` };
      } else st.current = 1;
    }
    st.lastDay = today;
    st.longest = Math.max(st.longest, st.current);
    if (st.current % 7 === 0 && st.freezes < 2) {
      st.freezes += 1;
      streakMsg = { kind: 'streak', title: 'Streak freeze earned 🧊', body: `${st.current} days in a row! A freeze will protect one missed day.` };
    }
    if ([7, 30, 100, 365].includes(st.current)) milestone = st.current;
    if (!streakMsg) streakMsg = { kind: 'streak', title: `🔥 ${st.current}-day streak`, body: st.current === 1 ? 'Day one. Come back tomorrow to keep it alive.' : 'Keep it burning.' };
  });
  if (streakMsg) pushToast(streakMsg as Omit<Toast, 'id'>);
  if (milestone) celebrate({ kind: 'streak', title: `${milestone}-day streak!`, body: 'Consistency beats intensity. You just proved it.' });
  checkBadges();
}

export function addXp(amount: number, reason: string) {
  if (amount <= 0) return;
  const today = dayKey();
  update((s) => {
    s.xp += amount;
    (s.days[today] ??= { solves: 0, reviews: 0, xp: 0 }).xp += amount;
  });
  pushToast({ kind: 'xp', title: `+${amount} XP`, body: reason });
}

// ---------- badges ----------
export interface BadgeDef { id: string; name: string; icon: string; desc: string; test: (s: State) => boolean }

export const BADGES: BadgeDef[] = [
  { id: 'first-solve', name: 'First Blood', icon: '🎯', desc: 'Solve your first problem.', test: (s) => Object.values(s.problems).some((p) => p.solved) },
  { id: 'clean-10', name: 'No Hints Needed', icon: '🧠', desc: 'Solve 10 problems without hints.', test: (s) => s.counters.cleanSolves >= 10 },
  { id: 'boss-1', name: 'Boss Slayer', icon: '⚔️', desc: 'Defeat your first boss problem.', test: (s) => s.counters.bossesDefeated >= 1 },
  { id: 'boss-10', name: 'Boss Hunter', icon: '🐉', desc: 'Defeat 10 bosses.', test: (s) => s.counters.bossesDefeated >= 10 },
  { id: 'gate-1', name: 'Gatekeeper', icon: '🚪', desc: 'Pass your first mastery gate.', test: (s) => Object.values(s.modules).some((m) => m.gatePassed) },
  { id: 'streak-7', name: 'Week Warrior', icon: '🔥', desc: 'Reach a 7-day streak.', test: (s) => s.streak.longest >= 7 },
  { id: 'streak-30', name: 'Habit Formed', icon: '🌋', desc: 'Reach a 30-day streak.', test: (s) => s.streak.longest >= 30 },
  { id: 'streak-100', name: 'Centurion', icon: '💯', desc: 'Reach a 100-day streak.', test: (s) => s.streak.longest >= 100 },
  { id: 'streak-365', name: 'Year of Code', icon: '🏆', desc: 'Reach a 365-day streak.', test: (s) => s.streak.longest >= 365 },
  { id: 'night-owl', name: 'Night Owl', icon: '🦉', desc: 'Solve a problem between midnight and 5 a.m.', test: (s) => s.counters.nightSolves >= 1 },
  { id: 'early-bird', name: 'Early Bird', icon: '🐦', desc: 'Solve a problem between 5 and 7 a.m.', test: (s) => s.counters.earlySolves >= 1 },
  { id: 'reviewer-50', name: 'Spaced Out', icon: '🗂️', desc: 'Complete 50 review cards.', test: (s) => s.counters.reviewsDone >= 50 },
  { id: 'phase-0', name: 'Apprentice', icon: '☕', desc: 'Pass the Phase 0 gate.', test: (s) => !!s.phases[0]?.examPassed },
  { id: 'phase-1', name: 'Builder', icon: '⚓', desc: 'Pass the Phase 1 gate.', test: (s) => !!s.phases[1]?.examPassed },
  { id: 'perfect-exam', name: 'Flawless', icon: '💎', desc: 'Score 100% on a phase exam.', test: (s) => Object.values(s.phases).some((p) => p.bestScore >= 100) },
  { id: 'xp-1000', name: 'Thousand Club', icon: '⭐', desc: 'Earn 1,000 XP.', test: (s) => s.xp >= 1000 },
  { id: 'xp-5000', name: 'Star Coder', icon: '🌟', desc: 'Earn 5,000 XP.', test: (s) => s.xp >= 5000 },
];

export function checkBadges() {
  const s = getState();
  const newly = BADGES.filter((b) => !s.badges[b.id] && b.test(s));
  if (!newly.length) return;
  update((st) => { for (const b of newly) st.badges[b.id] = new Date().toISOString(); });
  for (const b of newly) pushToast({ kind: 'badge', title: `${b.icon} Badge unlocked: ${b.name}`, body: b.desc });
}

// ---------- settings / misc ----------
export function resetProgress() {
  state = initialState();
  persist();
  listeners.forEach((l) => l());
}

export function exportProgress(): string { return JSON.stringify(state, null, 2); }

export function importProgress(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (parsed?.version !== 1) return false;
    state = { ...initialState(), ...parsed };
    persist();
    listeners.forEach((l) => l());
    return true;
  } catch { return false; }
}
