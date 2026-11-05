import { ALL_MODULES, PHASES, findProblem } from '../content';
import type { ExplainBack, Module, Phase, Problem } from '../content/types';
import type { RunOutcome } from '../runner/harness';
import { addDays, dayKey } from './dates';
import { addXp, celebrate, checkBadges, getState, pushToast, recordActivity, update, type State } from './store';

export const XP = {
  clean: 50,
  hintPenalty: 10,
  minWithHints: 20,
  boss: 150,
  gate: 200,
  phase: 500,
  review: 15,
  complexity: 25,
  daily: 30,
  exam: 50,
};

export const LEVELS = ['Novice', 'Apprentice', 'Builder', 'Problem Solver', 'Architect', 'Pathfinder', 'Strategist', 'DSA Hero'];

export function levelInfo(s: State) {
  let passed = 0;
  for (let i = 0; i < 7; i++) { if (s.phases[i]?.examPassed) passed = i + 1; else break; }
  return { level: passed + 1, title: LEVELS[passed], next: LEVELS[passed + 1] ?? null };
}

// ---------- unlocking ----------
export function isPhaseUnlocked(phaseId: number, s: State): boolean {
  if (s.settings.previewUnlockAll || phaseId === 0) return true;
  return !!s.phases[phaseId - 1]?.examPassed;
}

export function isModuleUnlocked(moduleId: string, s: State): boolean {
  if (s.settings.previewUnlockAll) return true;
  const idx = ALL_MODULES.findIndex((m) => m.id === moduleId);
  if (idx < 0) return false;
  const m = ALL_MODULES[idx];
  const phase = PHASES.find((p) => p.id === m.phase)!;
  if (phase.modules[0].id === m.id) return isPhaseUnlocked(m.phase, s);
  return !!s.modules[ALL_MODULES[idx - 1].id]?.gatePassed;
}

export function isExamUnlocked(phase: Phase, s: State): boolean {
  if (s.settings.previewUnlockAll) return true;
  return phase.modules.every((m) => s.modules[m.id]?.gatePassed);
}

// ---------- module gate ----------
export interface GateStatus {
  guidedSolved: boolean;
  masteryPct: number;
  masteryOk: boolean;
  bossSolved: boolean;
  quizOk: boolean;
  explainOk: boolean;
  ready: boolean;
  passed: boolean;
}

export function gateStatus(m: Module, s: State): GateStatus {
  const mastery = m.problems.filter((p) => p.role === 'mastery');
  let got = 0, total = 0;
  for (const p of mastery) {
    const pp = s.problems[p.id];
    const t = pp?.total || (p.kind === 'custom' ? 0 : p.tests.length);
    total += t || 1;
    got += pp?.solved ? (t || 1) : Math.min(pp?.bestPassed ?? 0, t || 1);
  }
  const masteryPct = total ? Math.round((got / total) * 100) : 100;
  const guided = m.problems.filter((p) => p.role === 'guided');
  const boss = m.problems.filter((p) => p.role === 'boss');
  const mp = s.modules[m.id] ?? {};
  const st = {
    guidedSolved: guided.every((p) => s.problems[p.id]?.solved),
    masteryPct,
    masteryOk: masteryPct >= 80,
    bossSolved: boss.every((p) => s.problems[p.id]?.solved),
    quizOk: !!mp.gateAnswerOk,
    explainOk: !!mp.explainOk,
    passed: !!mp.gatePassed,
  };
  return { ...st, ready: st.masteryOk && st.bossSolved && st.quizOk && st.explainOk };
}

export function evaluateExplain(eb: ExplainBack, text: string) {
  const t = ' ' + text.toLowerCase().replace(/\s+/g, ' ') + ' ';
  const hit = eb.keyIdeas.filter((k) => k.words.some((w) => t.includes(w.toLowerCase())));
  const missing = eb.keyIdeas.filter((k) => !hit.includes(k));
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { ok: hit.length >= eb.minGroups && words >= 8, hit, missing, words };
}

export function submitGateQuiz(m: Module, answer: number) {
  const ok = answer === m.gateQuestion.answer;
  update((s) => { const mp = (s.modules[m.id] ??= {}); mp.gateAnswer = answer; mp.gateAnswerOk = ok; });
  return ok;
}

export function submitExplain(m: Module, text: string) {
  const r = evaluateExplain(m.explainBack, text);
  update((s) => { const mp = (s.modules[m.id] ??= {}); mp.explainBack = text; mp.explainOk = r.ok; });
  return r;
}

export function tryPassGate(m: Module): boolean {
  const s = getState();
  const g = gateStatus(m, s);
  if (g.passed) return true;
  if (!g.ready) return false;
  const tomorrow = addDays(dayKey(), 1);
  update((st) => {
    const mp = (st.modules[m.id] ??= {});
    mp.gatePassed = true;
    mp.gatePassedAt = new Date().toISOString();
    for (const c of m.review) st.review[c.id] ??= { box: 0, due: tomorrow };
  });
  addXp(XP.gate, `Mastery gate passed: ${m.title}`);
  celebrate({ kind: 'gate', title: `Module ${m.id} mastered!`, body: `${m.title} is yours. ${m.review.length} review cards were added to your deck to keep it fresh.` });
  checkBadges();
  return true;
}

// ---------- problems ----------
export function markVisited(m: Module) {
  if (getState().modules[m.id]?.visited) return;
  update((s) => { (s.modules[m.id] ??= {}).visited = true; });
}

export function saveCode(problemId: string, code: string) {
  update((s) => { s.code[problemId] = code; s.codeAt[problemId] = Date.now(); });
}

export function takeHint(p: Problem) {
  update((s) => {
    const pp = (s.problems[p.id] ??= { solved: false, attempts: 0, hintsUsed: 0, bestPassed: 0, total: 0, xpAwarded: 0 });
    pp.hintsUsed = Math.min(p.hints.length, pp.hintsUsed + 1);
  });
}

export function revealSolution(p: Problem) {
  update((s) => {
    const pp = (s.problems[p.id] ??= { solved: false, attempts: 0, hintsUsed: 0, bestPassed: 0, total: 0, xpAwarded: 0 });
    pp.sawSolution = true;
  });
}

export function answerComplexity(p: Problem, answer: number): boolean {
  const ok = answer === p.complexity?.answer;
  const before = getState().problems[p.id];
  update((s) => {
    const pp = (s.problems[p.id] ??= { solved: false, attempts: 0, hintsUsed: 0, bestPassed: 0, total: 0, xpAwarded: 0 });
    if (!pp.complexityAnswered) { pp.complexityAnswered = true; pp.complexityOk = ok; }
  });
  if (ok && !before?.complexityAnswered) addXp(XP.complexity, 'Complexity nailed');
  return ok;
}

export function xpForSolve(p: Problem, hintsUsed: number): number {
  if (p.role === 'boss') return Math.max(XP.boss - hintsUsed * XP.hintPenalty, 100);
  if (p.role === 'exam') return XP.exam;
  return Math.max(XP.clean - hintsUsed * XP.hintPenalty, XP.minWithHints);
}

/** Apply a Submit (all tests) result. Returns XP gained. */
export function recordSubmission(p: Problem, outcome: RunOutcome): { solved: boolean; firstSolve: boolean; xp: number } {
  const allPass = outcome.kind === 'ok' && outcome.total > 0 && outcome.passed === outcome.total;
  const before = getState().problems[p.id];
  const firstSolve = allPass && !before?.solved;
  const hour = new Date().getHours();
  const today = dayKey();
  let xp = 0;
  if (firstSolve && !before?.sawSolution) xp = xpForSolve(p, before?.hintsUsed ?? 0);
  const daily = getState().daily[today];
  const dailyBonus = allPass && daily && daily.problemId === p.id && !daily.done;

  update((s) => {
    const pp = (s.problems[p.id] ??= { solved: false, attempts: 0, hintsUsed: 0, bestPassed: 0, total: 0, xpAwarded: 0 });
    pp.attempts += 1;
    if (outcome.kind === 'ok') {
      pp.total = outcome.total;
      pp.bestPassed = Math.max(pp.bestPassed, outcome.passed);
    }
    if (allPass) {
      if (!pp.solved) { pp.solved = true; pp.solvedAt = new Date().toISOString(); }
      if (firstSolve) {
        pp.xpAwarded = xp;
        if ((before?.hintsUsed ?? 0) === 0 && !before?.sawSolution) s.counters.cleanSolves++;
        if (p.role === 'boss') s.counters.bossesDefeated++;
      }
      if (hour < 5) s.counters.nightSolves++;
      else if (hour < 7) s.counters.earlySolves++;
      if (dailyBonus) s.daily[today].done = true;
      // exam attempt tracking
      if (p.role === 'exam') {
        const ph = PHASES.find((x) => x.exam.problems.some((e) => e.id === p.id));
        const att = ph ? s.phases[ph.id]?.attempt : undefined;
        if (att && !att.submitted && Date.now() <= att.endsAt) {
          const list = (att as ExamAttemptWithSolved).solved ??= [];
          if (!list.includes(p.id)) list.push(p.id);
        }
      }
    }
  });

  if (allPass) {
    if (xp) addXp(xp, p.role === 'boss' ? `Boss defeated: ${p.title}` : `Solved: ${p.title}`);
    else if (firstSolve) pushToast({ kind: 'info', title: 'Solved!', body: 'No XP because the solution was revealed first — but the learning still counts.' });
    if (dailyBonus) addXp(XP.daily, 'Daily challenge complete');
    recordActivity('solve');
    if (firstSolve && p.role === 'boss') celebrate({ kind: 'boss', title: 'Boss defeated! ⚔️', body: `${p.title} — that one mixes everything in the module. Head to the mastery gate when you're ready.` });
  }
  checkBadges();
  return { solved: allPass, firstSolve, xp };
}

// ---------- exams ----------
export type ExamAttemptWithSolved = NonNullable<State['phases'][number]['attempt']> & { solved?: string[] };

export function startExam(phase: Phase) {
  const now = Date.now();
  update((s) => {
    const pp = (s.phases[phase.id] ??= { examPassed: false, bestScore: 0 });
    pp.attempt = { startedAt: now, endsAt: now + phase.exam.minutes * 60_000, submitted: false } as ExamAttemptWithSolved;
    (pp.attempt as ExamAttemptWithSolved).solved = [];
  });
}

export function examSolved(phase: Phase, s: State): string[] {
  return ((s.phases[phase.id]?.attempt as ExamAttemptWithSolved | undefined)?.solved) ?? [];
}

export function submitExam(phase: Phase) {
  const s = getState();
  const solved = examSolved(phase, s);
  const pct = Math.round((solved.length / phase.exam.problems.length) * 100);
  const passed = pct >= phase.exam.passPct;
  const wasPassed = !!s.phases[phase.id]?.examPassed;
  update((st) => {
    const pp = (st.phases[phase.id] ??= { examPassed: false, bestScore: 0 });
    if (pp.attempt) { pp.attempt.submitted = true; pp.attempt.scorePct = pct; pp.attempt.passed = passed; }
    pp.bestScore = Math.max(pp.bestScore, pct);
    if (passed) pp.examPassed = true;
  });
  if (passed && !wasPassed) {
    addXp(XP.phase, `Phase ${phase.id} gate passed`);
    const lv = levelInfo(getState());
    celebrate({ kind: 'phase', title: `Level up: ${lv.title}!`, body: `You passed the Phase ${phase.id} gate with ${pct}%. ${PHASES.find((p) => p.id === phase.id + 1) ? 'The next phase is unlocked.' : 'More phases are on the way.'}` });
  }
  checkBadges();
  return { pct, passed };
}

// ---------- spaced review ----------
const INTERVALS = [1, 3, 7, 21, 60];

export interface DueCard { id: string; front: string; back: string; moduleId: string; moduleTitle: string; box: number }

export function dueCards(s: State, today = dayKey()): DueCard[] {
  const out: DueCard[] = [];
  for (const m of ALL_MODULES) {
    for (const c of m.review) {
      const r = s.review[c.id];
      if (r && r.due <= today) out.push({ ...c, moduleId: m.id, moduleTitle: m.title, box: r.box });
    }
  }
  return out;
}

export function gradeCard(cardId: string, knew: boolean) {
  const today = dayKey();
  update((s) => {
    const r = s.review[cardId];
    if (!r) return;
    r.box = knew ? Math.min(r.box + 1, INTERVALS.length - 1) : 0;
    r.due = knew ? addDays(today, INTERVALS[r.box]) : addDays(today, 1);
    s.counters.reviewsDone++;
  });
  const before = getState().days[today]?.reviews ?? 0;
  recordActivity('review');
  if (before + 1 === 5) addXp(XP.review, 'Daily review complete');
}

// ---------- daily challenge ----------
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

export function dailyChallenge(s: State): { problemId: string; done: boolean; isReview: boolean } | null {
  const today = dayKey();
  if (s.daily[today]) return { ...s.daily[today], isReview: !!s.problems[s.daily[today].problemId]?.solvedAt && s.problems[s.daily[today].problemId].solvedAt!.slice(0, 10) !== today };
  // pick from solved, non-exam problems in unlocked modules (a review challenge); fall back to the next unsolved one
  const solved = ALL_MODULES.flatMap((m) => m.problems).filter((p) => s.problems[p.id]?.solved);
  let pick: Problem | undefined;
  if (solved.length >= 3) pick = solved[hash(today) % solved.length];
  else pick = nextProblem(s);
  if (!pick) return null;
  return { problemId: pick.id, done: false, isReview: !!s.problems[pick.id]?.solved };
}

export function ensureDaily(s: State) {
  const today = dayKey();
  if (s.daily[today]) return;
  const d = dailyChallenge(s);
  if (d) update((st) => { st.daily[today] = { problemId: d.problemId, done: false }; });
}

// ---------- recommendations ----------
export function nextProblem(s: State): Problem | undefined {
  for (const m of ALL_MODULES) {
    if (!isModuleUnlocked(m.id, s)) break;
    if (s.modules[m.id]?.gatePassed) continue;
    for (const p of m.problems) if (!s.problems[p.id]?.solved) return p;
  }
  return undefined;
}

export function currentModule(s: State): Module | undefined {
  for (const m of ALL_MODULES) {
    if (!isModuleUnlocked(m.id, s)) return undefined;
    if (!s.modules[m.id]?.gatePassed) return m;
  }
  return undefined;
}

export function nextStep(s: State): { label: string; href: string; detail: string } {
  const m = currentModule(s);
  if (m) {
    const g = gateStatus(m, s);
    if (!s.modules[m.id]?.visited) return { label: `Start ${m.id}: ${m.title}`, href: `/module/${m.id}`, detail: m.tagline };
    const p = m.problems.find((x) => !s.problems[x.id]?.solved);
    if (p && !(p.role === 'mastery' && g.masteryOk)) return { label: `Continue: ${p.title}`, href: `/problem/${p.id}`, detail: `Module ${m.id} · ${p.role === 'boss' ? 'Boss problem' : p.role === 'guided' ? 'Guided problem' : 'Mastery set'}` };
    return { label: `Take the ${m.id} mastery gate`, href: `/module/${m.id}?step=gate`, detail: 'Prove it and unlock the next module.' };
  }
  for (const ph of PHASES) {
    if (!s.phases[ph.id]?.examPassed && isExamUnlocked(ph, s)) return { label: `Phase ${ph.id} gate exam`, href: `/exam/${ph.id}`, detail: `${ph.exam.problems.length} unseen problems in ${ph.exam.minutes} minutes.` };
  }
  return { label: 'Practice in the playground', href: '/playground', detail: 'All available content complete. New phases are on the way!' };
}

export { findProblem };
