import type { Phase } from '../types';
import { m1_1, m1_2, m1_3 } from './m1_1to1_3';
import { m1_4, m1_5, m1_6 } from './m1_4to1_6';
import { m1_7, m1_8, m1_9 } from './m1_7to1_9';
import { phase1Exam } from './exam';

export const phase1: Phase = {
  id: 1,
  title: 'Complexity and linear structures',
  storyTitle: 'The Harbor',
  story: 'Ships, crates and convoys: the Harbor runs on arrays, lists, stacks and queues. Learn to measure your code with Big-O and make it fast enough for millions of crates.',
  levelTitle: 'Builder',
  modules: [m1_1, m1_2, m1_3, m1_4, m1_5, m1_6, m1_7, m1_8, m1_9],
  exam: { title: 'Phase 1 gate: unseen problems, timed', minutes: 75, passPct: 75, problems: phase1Exam },
};
