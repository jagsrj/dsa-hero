// Verifies every problem in the course with the local JDK:
//  1. the reference solution passes ALL tests (including hidden ones)
//  2. the starter code compiles (it may fail tests, but must not have compile errors)
// Usage: npx tsx scripts/verify.mts [problem-id-filter]
import { PHASES } from '../src/content/index';
import { buildForProblem, parseResultJson } from '../src/runner/harness';
import { runLocal } from './localJava';
import type { Problem } from '../src/content/types';

const filter = process.argv[2];
const problems: { where: string; p: Problem }[] = [];
for (const ph of PHASES) {
  for (const m of ph.modules) for (const p of m.problems) problems.push({ where: `M${m.id}`, p });
  for (const p of ph.exam.problems) problems.push({ where: `Exam${ph.id}`, p });
}

const ids = new Set<string>();
for (const { p } of problems) {
  if (ids.has(p.id)) console.error(`DUPLICATE ID ${p.id}`);
  ids.add(p.id);
}

let failures = 0;
async function check({ where, p }: { where: string; p: Problem }) {
  const sol = buildForProblem(p, p.solution, true);
  const r = await runLocal(sol, 20000);
  const problemsFound: string[] = [];
  if (r.phase === 'compile') problemsFound.push('solution does not compile:\n' + r.compileOutput);
  else if (r.timedOut) problemsFound.push('solution timed out');
  else {
    const res = parseResultJson(r.stdout ?? '');
    if (!res) problemsFound.push('no result JSON. stderr: ' + r.stderr);
    else {
      if (res.total === 0) problemsFound.push('no tests ran');
      for (const t of res.results) if (t.status !== 'pass') problemsFound.push(`test "${t.name}" ${t.status}: expected=${t.expected} actual=${t.actual} err=${t.error}`);
    }
  }
  const st = buildForProblem(p, p.starter, true);
  const r2 = await runLocal(st, 20000);
  if (r2.phase === 'compile') problemsFound.push('starter does not compile:\n' + r2.compileOutput);
  if (problemsFound.length) {
    failures++;
    console.log(`✗ ${where} ${p.id}\n   ` + problemsFound.join('\n   '));
  } else {
    console.log(`✓ ${where} ${p.id} (${r.ms}ms)`);
  }
}

const list = problems.filter(({ p }) => !filter || p.id.includes(filter));
const CONC = 6;
let i = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < list.length) { const job = list[i++]; await check(job); }
}));
console.log(`\n${list.length - failures}/${list.length} problems verified.`);
process.exit(failures ? 1 : 0);
