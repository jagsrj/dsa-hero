import { cleanCompileErrors, parseResultJson, type Compilation, type RunOutcome, type TestResult } from './harness';

export type RunStatus = 'loading' | 'compiling' | 'running';

export interface Engine {
  name: string;
  run(c: Compilation, onStatus?: (s: RunStatus) => void): Promise<RunOutcome>;
  warmup?(): void;
}

const LOAD_TIMEOUT = 120_000;
const COMPILE_TIMEOUT = 90_000;
const RUN_TIMEOUT = 15_000;

function fixLines(results: TestResult[], c: Compilation): TestResult[] {
  return results.map((r) => ({
    ...r,
    error: r.error ? r.error.replace(/\(line (\d+)\)/g, (_, n) => `(line ${Number(n) - c.lineOffset})`) : r.error,
  }));
}

function outcomeFromResult(text: string | null | undefined, c: Compilation, ms: number, stdout?: string): RunOutcome {
  const parsed = text ? parseResultJson(text) : null;
  if (!parsed) {
    return { kind: 'runtime-failure', results: [], passed: 0, total: 0, ms, stdout,
      message: 'The program stopped before the tests finished. Did your code call System.exit() or crash the JVM?' };
  }
  return { kind: 'ok', results: fixLines(parsed.results, c), passed: parsed.passed, total: parsed.total, ms };
}

// ---------------- CheerpJ (in-browser JVM) ----------------
type Pending = { resolve: (o: RunOutcome) => void; c: Compilation; onStatus?: (s: RunStatus) => void; timer?: number; phase: RunStatus };

class CheerpJEngine implements Engine {
  name = 'In-browser JVM (CheerpJ)';
  private frame: HTMLIFrameElement | null = null;
  /** true once the runner page inside the current iframe has posted 'loaded' */
  private loaded = false;
  private outbox: unknown[] = [];
  private pending = new Map<number, Pending>();
  private nextId = Date.now() % 100000;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    window.addEventListener('message', (ev) => this.onMessage(ev));
  }

  private ensureFrame() {
    if (this.frame) return;
    const f = document.createElement('iframe');
    f.src = `/runner.html?java=${import.meta.env.VITE_JAVA_VERSION ?? 17}&cj=${import.meta.env.VITE_CHEERPJ_VERSION ?? '5.0'}`;
    f.title = 'Java runner';
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(f);
    this.frame = f;
    this.loaded = false;
  }

  /** Kill the JVM by removing its iframe: the only reliable way to stop an infinite loop. */
  private reset() {
    this.frame?.remove();
    this.frame = null;
    this.loaded = false;
    this.outbox = [];
  }

  /** Post to the runner, or queue until it has announced itself (a fresh iframe is about:blank at first). */
  private send(msg: unknown) {
    this.ensureFrame();
    if (this.loaded) this.frame!.contentWindow?.postMessage(msg, '*');
    else this.outbox.push(msg);
  }

  warmup() {
    this.send({ target: 'dsa-runner', type: 'warmup' });
  }

  private arm(id: number, ms: number, message: string) {
    const p = this.pending.get(id);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    p.timer = window.setTimeout(() => {
      this.pending.delete(id);
      this.reset();
      p.resolve({ kind: 'timeout', results: [], passed: 0, total: 0, message });
    }, ms);
  }

  private onMessage(ev: MessageEvent) {
    const m = ev.data;
    if (!m || m.source !== 'dsa-runner') return;
    if (!this.frame || ev.source !== this.frame.contentWindow) return; // ignore messages from a killed runner
    if (m.type === 'loaded') {
      this.loaded = true;
      const box = this.outbox;
      this.outbox = [];
      for (const msg of box) this.frame.contentWindow?.postMessage(msg, '*');
      return;
    }
    if (m.type === 'ready') return;
    const p = this.pending.get(m.id);
    if (!p) return;
    if (m.type === 'status') {
      p.phase = m.status;
      p.onStatus?.(m.status);
      if (m.status === 'compiling') this.arm(m.id, COMPILE_TIMEOUT, 'Compiling took too long. Try again — the first compile after loading is the slowest.');
      if (m.status === 'running') this.arm(m.id, RUN_TIMEOUT, `Time limit exceeded (${RUN_TIMEOUT / 1000} s). Either a loop never ends, or your solution is too slow for the large tests — check its Big-O.`);
      return;
    }
    if (p.timer) clearTimeout(p.timer);
    this.pending.delete(m.id);
    if (m.type === 'compile-error') {
      p.resolve({ kind: 'compile-error', results: [], passed: 0, total: 0, compileErrors: cleanCompileErrors(m.output ?? '', p.c), ms: m.ms });
    } else if (m.type === 'done') {
      p.resolve(outcomeFromResult(m.result, p.c, m.ms));
    } else if (m.type === 'engine-error') {
      this.reset();
      p.resolve({ kind: 'engine-error', results: [], passed: 0, total: 0, message: `The Java engine failed: ${m.message}`, stdout: m.details || undefined });
    }
  }

  run(c: Compilation, onStatus?: (s: RunStatus) => void): Promise<RunOutcome> {
    const job = () => new Promise<RunOutcome>((resolve) => {
      const id = ++this.nextId;
      this.pending.set(id, { resolve, c, onStatus, phase: 'loading' });
      onStatus?.('loading');
      this.arm(id, LOAD_TIMEOUT, 'The Java engine took too long to load. Check your connection and try again.');
      this.send({ target: 'dsa-runner', type: 'run', id, fileName: c.fileName, source: c.source, mainClass: c.mainClass });
    });
    const p = this.queue.then(job, job);
    this.queue = p.catch(() => undefined);
    return p;
  }
}

// ---------------- Local JDK (development only) ----------------
class LocalEngine implements Engine {
  name = 'Local JDK (dev server)';
  async run(c: Compilation, onStatus?: (s: RunStatus) => void): Promise<RunOutcome> {
    onStatus?.('compiling');
    const res = await fetch('/__local_run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fileName: c.fileName, source: c.source, mainClass: c.mainClass }) });
    if (!res.ok) return { kind: 'engine-error', results: [], passed: 0, total: 0, message: `Local runner error ${res.status}` };
    const r = await res.json();
    if (r.phase === 'compile') return { kind: 'compile-error', results: [], passed: 0, total: 0, compileErrors: cleanCompileErrors(r.compileOutput ?? '', c), ms: r.ms };
    if (r.timedOut) return { kind: 'timeout', results: [], passed: 0, total: 0, message: 'Time limit exceeded. Either a loop never ends, or your solution is too slow for the large tests — check its Big-O.' };
    return outcomeFromResult(r.stdout, c, r.ms, r.stderr);
  }
}

let engine: Engine | null = null;
export function getEngine(): Engine {
  if (!engine) {
    let pref = import.meta.env.VITE_RUNNER as string | undefined;
    try { pref = localStorage.getItem('dsa-runner') ?? pref; } catch { /* ignore */ }
    engine = pref === 'local' ? new LocalEngine() : new CheerpJEngine();
  }
  return engine;
}
