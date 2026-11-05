import type { Gen, JType, Problem, TestCase } from '../content/types';
import { LISTNODE_JAVA, TESTKIT_JAVA } from './testkit';

export interface Compilation {
  fileName: string;
  source: string;
  mainClass: string;
  /** number of lines inserted before the learner's first line */
  lineOffset: number;
  learnerLines: number;
}

const BASE_IMPORTS = ['java.util.*', 'java.util.function.*', 'java.io.*'];

/** Hoist imports onto line 1 so learner line numbers shift by exactly one. */
function prepareLearnerCode(code: string): { imports: string[]; body: string } {
  const imports: string[] = [];
  const lines = code.replace(/\r\n/g, '\n').split('\n').map((line) => {
    const m = line.match(/^\s*import\s+(static\s+)?([\w.]+(\.\*)?)\s*;\s*$/);
    if (m) { imports.push((m[1] ?? '') + m[2]); return ''; }
    if (/^\s*package\s+[\w.]+\s*;\s*$/.test(line)) return '';
    return line;
  });
  return { imports, body: lines.join('\n') };
}

function fileNameFor(code: string): string {
  const m = code.match(/public\s+(?:final\s+|abstract\s+)*(?:class|interface|enum|record)\s+(\w+)/);
  return (m ? m[1] : 'Main') + '.java';
}

export function detectMainClass(code: string): string {
  // find the class that declares main
  const idx = code.search(/static\s+void\s+main\s*\(/);
  if (idx < 0) return 'Main';
  const before = code.slice(0, idx);
  const all = [...before.matchAll(/(?:class|record|enum)\s+(\w+)/g)];
  return all.length ? all[all.length - 1][1] : 'Main';
}

// ---------- Java literal generation ----------
function jstr(s: string): string {
  return JSON.stringify(s);
}
function jchar(c: string): string {
  if (c === "'") return "'\\''";
  if (c === '\\') return "'\\\\'";
  if (c === '\n') return "'\\n'";
  return `'${c}'`;
}

function isGen(v: unknown): v is Gen {
  return typeof v === 'object' && v !== null && 'gen' in (v as object);
}

function genLiteral(g: Gen): string {
  switch (g.gen) {
    case 'range': return `T.genRange(${g.from}, ${g.to})`;
    case 'random': return `T.genRandom(${g.n}, ${g.lo}, ${g.hi}, ${g.seed}L)`;
    case 'sorted': return `T.genSorted(${g.n}, ${g.lo}, ${g.hi}, ${g.seed}L)`;
    case 'repeat': return `T.genRepeat(${g.n}, ${g.value})`;
    case 'missing': return `T.genMissing(${g.n}, ${g.missing}, ${g.seed}L)`;
    case 'string': return `T.genString(${g.n}, ${jstr(g.alphabet)}, ${g.seed}L)`;
  }
}

function genPreview(g: Gen): string {
  switch (g.gen) {
    case 'range': return `[${g.from}, ${g.from + 1}, …, ${g.to}] (${g.to - g.from + 1} numbers)`;
    case 'random': return `${g.n.toLocaleString()} random numbers in [${g.lo}, ${g.hi}]`;
    case 'sorted': return `${g.n.toLocaleString()} sorted random numbers in [${g.lo}, ${g.hi}]`;
    case 'repeat': return `${g.n.toLocaleString()} copies of ${g.value}`;
    case 'missing': return `0…${g.n} shuffled with one number missing (${g.n.toLocaleString()} numbers)`;
    case 'string': return `random string of length ${g.n.toLocaleString()}`;
  }
}

export function javaLiteral(type: JType, v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (isGen(v)) return genLiteral(v);
  switch (type) {
    case 'int': return String(v);
    case 'long': return `${v}L`;
    case 'double': { const s = String(v); return /[.eE]/.test(s) ? s : s + '.0'; }
    case 'boolean': return String(v);
    case 'char': return jchar(String(v));
    case 'String': return jstr(String(v));
    case 'int[]': return `new int[]{${(v as number[]).join(', ')}}`;
    case 'long[]': return `new long[]{${(v as number[]).map((x) => x + 'L').join(', ')}}`;
    case 'double[]': return `new double[]{${(v as number[]).map((x) => javaLiteral('double', x)).join(', ')}}`;
    case 'boolean[]': return `new boolean[]{${(v as boolean[]).join(', ')}}`;
    case 'char[]': return `new char[]{${(v as string[]).map(jchar).join(', ')}}`;
    case 'String[]': return `new String[]{${(v as string[]).map(jstr).join(', ')}}`;
    case 'int[][]': return `new int[][]{${(v as number[][]).map((r) => `{${r.join(', ')}}`).join(', ')}}`;
    case 'char[][]': return `new char[][]{${(v as string[][]).map((r) => `{${r.map(jchar).join(', ')}}`).join(', ')}}`;
    case 'List<Integer>': return `T.li(${(v as number[]).join(', ')})`;
    case 'List<String>': return `T.ls(${(v as string[]).map(jstr).join(', ')})`;
    case 'List<List<Integer>>': return `T.lli(${(v as number[][]).map((r) => `T.li(${r.join(', ')})`).join(', ')})`;
    case 'ListNode': return `ListNode.of(new int[]{${(v as number[]).join(', ')}})`;
    case 'void': return 'null';
  }
}

/** Human-readable rendering of a JSON value, used for test input previews. */
export function showValue(type: JType, v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (isGen(v)) return genPreview(v);
  if (typeof v === 'string' && (type === 'long' || type === 'int')) return v;
  if (type === 'ListNode') { const a = v as number[]; return a.length ? a.join(' -> ') : '(empty list)'; }
  if (type === 'String') return JSON.stringify(v);
  if (type === 'char') return `'${v}'`;
  if (type === 'char[]') return '[' + (v as string[]).map((c) => `'${c}'`).join(', ') + ']';
  if (type === 'char[][]') return '[' + (v as string[][]).map((r) => '[' + r.map((c) => `'${c}'`).join(', ') + ']').join(', ') + ']';
  if (type === 'String[]' || type === 'List<String>') return '[' + (v as string[]).map((s) => JSON.stringify(s)).join(', ') + ']';
  return JSON.stringify(v).replace(/,/g, ', ');
}

export function testInputPreview(problem: Problem, t: TestCase): string {
  if (problem.kind === 'function' && problem.fn && t.args) {
    return problem.fn.params.map((p, i) => `${p.name} = ${showValue(p.type, t.args![i])}`).join(', ');
  }
  if (problem.kind === 'program') return t.stdin ? t.stdin : '(no input)';
  return '';
}

function testName(t: TestCase, i: number): string {
  return t.name ?? `Test ${i + 1}`;
}

function harnessFunction(p: Problem): string {
  const fn = p.fn!;
  const blocks = p.tests.map((t, i) => {
    const decls = fn.params.map((prm, k) => `${prm.type === 'void' ? 'Object' : prm.type} a${k} = ${javaLiteral(prm.type, t.args?.[k])};`).join(' ');
    const call = `new Solution().${fn.name}(${fn.params.map((_, k) => `a${k}`).join(', ')})`;
    const expType: JType = fn.checkArg !== undefined ? fn.params[fn.checkArg].type : fn.returns;
    let expected = `Object exp = ${javaLiteral(expType, t.expected)};`;
    if (t.expected === undefined && p.oracle) {
      const bdecls = fn.params.map((prm, k) => `${prm.type} b${k} = ${javaLiteral(prm.type, t.args?.[k])};`).join(' ');
      const ocall = `DsaRef.${fn.name}(${fn.params.map((_, k) => `b${k}`).join(', ')})`;
      expected = fn.checkArg !== undefined || fn.returns === 'void'
        ? `${bdecls} ${ocall}; Object exp = b${fn.checkArg ?? 0};`
        : `${bdecls} Object exp = ${ocall};`;
    }
    const actual = fn.returns === 'void' || fn.checkArg !== undefined
      ? `${call}; Object act = ${fn.checkArg !== undefined ? `a${fn.checkArg}` : 'null'};`
      : `Object act = ${call};`;
    return `        if (T.start(${jstr(testName(t, i))}, ${jstr(testInputPreview(p, t))}, ${!!t.hidden})) {
            try { ${decls} ${expected} ${actual} T.finish(exp, act, ${fn.tolerance ?? 1e-6}, ${!!fn.unordered}); }
            catch (Throwable e) { T.error(e); }
        }`;
  });
  return blocks.join('\n');
}

function harnessProgram(p: Problem, mainClass: string): string {
  return p.tests.map((t, i) => `        if (T.start(${jstr(testName(t, i))}, ${jstr(testInputPreview(p, t))}, ${!!t.hidden})) {
            try { T.stdin(${jstr(t.stdin ?? '')}); ${mainClass}.main(new String[0]); T.finishOut(${jstr(t.stdout ?? '')}); }
            catch (Throwable e) { T.error(e); }
        }`).join('\n');
}

function wrapHarness(body: string, includeHidden: boolean): string {
  return `
class DsaHarness {
    public static void main(String[] args) throws Exception {
        T.begin(args, ${includeHidden});
${body}
        T.end();
    }
}
`;
}

function assemble(code: string, extra: string, uses: string[] = []): { fileName: string; source: string; learnerLines: number } {
  const { imports, body } = prepareLearnerCode(code);
  const allImports = Array.from(new Set([...BASE_IMPORTS, ...imports]));
  const head = allImports.map((i) => `import ${i};`).join(' ');
  const helpers = uses.includes('ListNode') ? LISTNODE_JAVA : '';
  return {
    fileName: fileNameFor(body),
    source: `${head}\n${body}\n${helpers}\n${extra}\n${TESTKIT_JAVA}`,
    learnerLines: body.split('\n').length,
  };
}

export function buildForProblem(p: Problem, code: string, includeHidden: boolean): Compilation {
  let harness: string;
  if (p.kind === 'function') harness = harnessFunction(p);
  else if (p.kind === 'program') harness = harnessProgram(p, detectMainClass(code));
  else harness = `        ${p.customHarness ?? ''}`;
  const extra = wrapHarness(harness, includeHidden) + (p.oracle ? '\n' + p.oracle + '\n' : '');
  const a = assemble(code, extra, p.uses ?? []);
  return { ...a, mainClass: 'DsaHarness', lineOffset: 1 };
}

export function buildPlayground(code: string, stdin: string): Compilation {
  const mainClass = detectMainClass(code);
  const body = `        if (T.start("Run", "", false)) {
            try { T.stdin(${jstr(stdin)}); ${mainClass}.main(new String[0]); T.finishFree(); }
            catch (Throwable e) { T.error(e); }
        }`;
  const a = assemble(code, wrapHarness(body, true), code.includes('ListNode') && !/class\s+ListNode/.test(code) ? ['ListNode'] : []);
  return { ...a, mainClass: 'DsaHarness', lineOffset: 1 };
}

// ---------- results ----------
export interface TestResult {
  name: string;
  input: string;
  hidden: boolean;
  status: 'pass' | 'fail' | 'error' | 'ran';
  expected: string | null;
  actual: string | null;
  stdout: string;
  error: string | null;
  ms: number;
}

export interface RunOutcome {
  kind: 'ok' | 'compile-error' | 'timeout' | 'runtime-failure' | 'engine-error';
  results: TestResult[];
  passed: number;
  total: number;
  compileErrors?: string;
  message?: string;
  stdout?: string;
  ms?: number;
}

export function parseResultJson(text: string): { results: TestResult[]; passed: number; total: number } | null {
  const marker = '@@DSA_RESULT@@';
  const i = text.lastIndexOf(marker);
  const raw = i >= 0 ? text.slice(i + marker.length).split('\n')[0] : text;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Rewrite javac diagnostics into learner line numbers and hide harness internals. */
export function cleanCompileErrors(raw: string, c: Compilation): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let harnessProblem = false;
  let skipping = false;
  for (const line of lines) {
    const m = line.match(/^(?:.*[/\\])?(\w+\.java):(\d+):\s*(error|warning):\s*(.*)$/);
    if (m) {
      const ln = Number(m[2]) - c.lineOffset;
      if (m[3] === 'warning' || ln < 1 || ln > c.learnerLines) {
        if (m[3] === 'error') harnessProblem = true;
        skipping = true;
        continue;
      }
      skipping = false;
      out.push(`Line ${ln}: ${m[3]}: ${m[4]}`);
    } else if (!skipping && line.trim() && !/^\d+ errors?$/.test(line.trim()) && !/^Note:/.test(line)) {
      out.push(line);
    }
  }
  if (harnessProblem && out.length === 0) {
    out.push('Your code compiles, but it does not match what the tests expect.');
    out.push('Check that the class name, method name, parameter types and return type match the starter code exactly.');
  }
  return out.join('\n');
}
