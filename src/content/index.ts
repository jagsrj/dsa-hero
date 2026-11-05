import type { Module, Phase, Problem } from './types';
import { phase0 } from './phase0';
import { phase1 } from './phase1';

export const PHASES: Phase[] = [phase0, phase1];

/** Phases 2–6 shown on the course map as "coming soon" (from the curriculum). */
export const UPCOMING_PHASES = [
  { id: 2, title: 'Recursion, searching and sorting', modules: 9, storyTitle: 'The Library' },
  { id: 3, title: 'Hashing, trees and heaps', modules: 10, storyTitle: 'The Forest' },
  { id: 4, title: 'Graphs', modules: 8, storyTitle: 'The City Map' },
  { id: 5, title: 'Greedy, backtracking and dynamic programming', modules: 9, storyTitle: 'The Strategy Room' },
  { id: 6, title: 'Hero track', modules: 7, storyTitle: 'The Hero Trials' },
];

export const ALL_MODULES: Module[] = PHASES.flatMap((p) => p.modules);

export function findModule(id: string): Module | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}

export function findProblem(id: string): { problem: Problem; module?: Module; phase: Phase } | undefined {
  for (const ph of PHASES) {
    for (const m of ph.modules) {
      const p = m.problems.find((x) => x.id === id);
      if (p) return { problem: p, module: m, phase: ph };
    }
    const e = ph.exam.problems.find((x) => x.id === id);
    if (e) return { problem: e, phase: ph };
  }
  return undefined;
}
