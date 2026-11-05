import type { Phase } from '../types';
import { m0_1, m0_2, m0_3 } from './m0_1to0_3';
import { m0_4, m0_5, m0_6 } from './m0_4to0_6';
import { m0_7, m0_8 } from './m0_7to0_8';
import { m0_9, m0_10 } from './m0_9to0_10';
import { phase0Exam } from './exam';

export const phase0: Phase = {
  id: 0,
  title: 'Java foundations',
  storyTitle: 'Arrival in Codeville',
  story: 'You arrive in Codeville knowing nothing about code. By the end of this phase you will speak Java fluently enough to build the tools the city runs on.',
  levelTitle: 'Apprentice',
  modules: [m0_1, m0_2, m0_3, m0_4, m0_5, m0_6, m0_7, m0_8, m0_9, m0_10],
  exam: { title: 'Phase 0 gate: Java foundations exam', minutes: 60, passPct: 75, problems: phase0Exam },
};
