// Core content model for DSA Hero.

export type JType =
  | 'int' | 'long' | 'double' | 'boolean' | 'char' | 'String'
  | 'int[]' | 'long[]' | 'double[]' | 'char[]' | 'boolean[]' | 'String[]'
  | 'int[][]' | 'char[][]'
  | 'List<Integer>' | 'List<String>' | 'List<List<Integer>>'
  | 'ListNode' | 'void';

export interface Param { name: string; type: JType }

/** Deterministic generated argument for large-input tests. */
export type Gen =
  | { gen: 'range'; from: number; to: number }
  | { gen: 'random'; n: number; lo: number; hi: number; seed: number }
  | { gen: 'sorted'; n: number; lo: number; hi: number; seed: number }
  | { gen: 'repeat'; n: number; value: number }
  | { gen: 'missing'; n: number; missing: number; seed: number }
  | { gen: 'string'; n: number; alphabet: string; seed: number };

export interface TestCase {
  name?: string;
  /** function problems: argument values (JSON) */
  args?: unknown[];
  /** function problems: expected return (JSON) */
  expected?: unknown;
  /** program problems: text fed to System.in */
  stdin?: string;
  /** program problems: expected stdout (compared after trimming trailing spaces per line) */
  stdout?: string;
  /** hidden tests run only on Submit */
  hidden?: boolean;
}

export interface FunctionSpec {
  name: string;
  params: Param[];
  returns: JType;
  /** compare as unordered collection (outer list / array) */
  unordered?: boolean;
  /** compare doubles with tolerance */
  tolerance?: number;
  /** for void methods that mutate an argument: index of the argument to check against `expected` */
  checkArg?: number;
}

export type ProblemRole = 'guided' | 'mastery' | 'boss' | 'exam';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface MCQ {
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

export interface Problem {
  id: string;
  title: string;
  role: ProblemRole;
  difficulty: Difficulty;
  /** markdown */
  statement: string;
  starter: string;
  /** reference solution (never shown until solved or all hints used) */
  solution: string;
  /** markdown walkthrough shown alongside the solution */
  walkthrough?: string;
  hints: string[];
  kind: 'function' | 'program' | 'custom';
  fn?: FunctionSpec;
  tests: TestCase[];
  /** custom harness: Java statements using t.check(name, expected, actual) and t.section */
  customHarness?: string;
  /** helper types injected into the compilation unit */
  uses?: ('ListNode')[];
  /**
   * Reference oracle: Java source of `class DsaRef { static <ret> <fn.name>(...) }`.
   * Used to compute expected values for tests whose `expected` is undefined (e.g. generated large inputs).
   */
  oracle?: string;
  complexity?: MCQ;
}

export type VisualKind = 'vars' | 'array' | 'list' | 'stack' | 'queue' | 'growth' | 'grid' | 'text';

export interface VisualFrame {
  caption: string;
  /** array: values; list: values; stack/queue: values (bottom→top / front→back) */
  values?: (string | number)[];
  /** array: index → label (e.g. {0:'L', 5:'R'}) */
  pointers?: Record<number, string>;
  /** indices highlighted (accent) */
  highlight?: number[];
  /** indices in a window range [lo, hi] */
  window?: [number, number];
  /** vars: name → value */
  vars?: Record<string, string | number>;
  /** grid: rows */
  grid?: (string | number)[][];
  /** text: monospaced output */
  output?: string;
  /** a line of code being executed */
  code?: string;
}

export interface Visual {
  kind: VisualKind;
  title: string;
  frames: VisualFrame[];
}

export interface ExplainBack {
  prompt: string;
  /** each inner array is a group of synonyms; learner must hit `minGroups` groups */
  keyIdeas: { idea: string; words: string[] }[];
  minGroups: number;
}

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
}

export interface Module {
  id: string; // e.g. "0.1"
  phase: number;
  title: string;
  tagline: string;
  /** story-mode hook (markdown) */
  hook: string;
  /** concept lesson (markdown) */
  concept: string;
  visual?: Visual;
  javaSpotlight: { title: string; body: string; code: string };
  problems: Problem[];
  gateQuestion: MCQ;
  explainBack: ExplainBack;
  review: ReviewCard[];
}

export interface Phase {
  id: number;
  title: string;
  storyTitle: string;
  story: string;
  levelTitle: string; // level title earned on passing this phase gate
  modules: Module[];
  exam: { title: string; minutes: number; passPct: number; problems: Problem[] };
}
