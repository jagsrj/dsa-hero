// Node-only: compile and run a generated compilation unit with the local JDK.
// Used by the verification script and by the Vite dev server ("local" runner engine).
import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface LocalRunRequest { fileName: string; source: string; mainClass: string }
export interface LocalRunResponse {
  phase: 'compile' | 'run';
  ok: boolean;
  compileOutput?: string;
  stdout?: string;
  stderr?: string;
  timedOut?: boolean;
  ms: number;
}

function run(cmd: string, args: string[], cwd: string, timeoutMs: number): Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }> {
  return new Promise((resolve) => {
    const p = execFile(cmd, args, { cwd, timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, JAVA_TOOL_OPTIONS: '' } }, (err, stdout, stderr) => {
      const timedOut = !!(err && (err as NodeJS.ErrnoException & { killed?: boolean }).killed);
      resolve({ code: err ? (typeof (err as { code?: unknown }).code === 'number' ? (err as { code: number }).code : 1) : 0, stdout, stderr, timedOut });
    });
    p.stdin?.end();
  });
}

export async function runLocal(req: LocalRunRequest, timeoutMs = 10000): Promise<LocalRunResponse> {
  const t0 = Date.now();
  const dir = mkdtempSync(join(tmpdir(), 'dsa-'));
  try {
    writeFileSync(join(dir, req.fileName), req.source);
    const c = await run('javac', ['-nowarn', '-encoding', 'UTF-8', '-d', dir, join(dir, req.fileName)], dir, 60000);
    const clean = (s: string) => s.split('\n').filter((l) => !l.startsWith('Picked up JAVA_TOOL_OPTIONS')).join('\n');
    if (c.code !== 0) return { phase: 'compile', ok: false, compileOutput: clean(c.stderr + c.stdout), ms: Date.now() - t0 };
    const r = await run('java', ['-Xss16m', '-cp', dir, req.mainClass], dir, timeoutMs);
    return { phase: 'run', ok: r.code === 0 && !r.timedOut, stdout: r.stdout, stderr: clean(r.stderr), timedOut: r.timedOut, ms: Date.now() - t0 };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
