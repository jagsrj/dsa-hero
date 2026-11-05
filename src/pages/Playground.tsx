import { useEffect, useState } from 'react';
import { buildPlayground, type RunOutcome } from '../runner/harness';
import { getEngine, type RunStatus } from '../runner/engine';
import { CodeEditor } from '../ui/CodeEditor';

const STARTER = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String name = in.hasNextLine() ? in.nextLine() : "Codeville";
        System.out.println("Hello, " + name + "!");

        int[] crates = {5, 3, 8, 1};
        Arrays.sort(crates);
        System.out.println(Arrays.toString(crates));
    }
}
`;
const KEY = 'dsa-hero-playground';

export function Playground() {
  const [code, setCode] = useState(() => { try { return localStorage.getItem(KEY) ?? STARTER; } catch { return STARTER; } });
  const [stdin, setStdin] = useState('Ada');
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [out, setOut] = useState<RunOutcome | null>(null);

  useEffect(() => { getEngine().warmup?.(); }, []);
  useEffect(() => { const t = setTimeout(() => { try { localStorage.setItem(KEY, code); } catch { /* ignore */ } }, 500); return () => clearTimeout(t); }, [code]);

  const run = async () => {
    if (status) return;
    setOut(null);
    const r = await getEngine().run(buildPlayground(code, stdin), setStatus);
    setStatus(null);
    setOut(r);
  };
  const res = out?.results[0];

  return (
    <div className="playground">
      <div className="pg-editor">
        <div className="editor-bar">
          <b>Playground</b><span className="muted small">Java 17 · any code, no tests</span>
          <div className="spacer" />
          <button className="btn ghost sm" onClick={() => { if (confirm('Reset the playground?')) setCode(STARTER); }}>Reset</button>
          <button className="btn primary sm" onClick={run} disabled={!!status} title="Ctrl/⌘ + Enter">▶ Run</button>
        </div>
        <CodeEditor docKey="playground" value={code} onChange={setCode} onRun={run} />
      </div>
      <div className="pg-side">
        <label className="pg-label" htmlFor="stdin">Input (System.in)</label>
        <textarea id="stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} rows={4} spellCheck={false} />
        <div className="pg-label">Output</div>
        <div className="pg-out" aria-live="polite">
          {status && <div className="run-status"><span className="spinner" aria-hidden />{status === 'loading' ? 'Starting the Java engine…' : status === 'compiling' ? 'Compiling…' : 'Running…'}</div>}
          {out?.kind === 'compile-error' && <pre className="bad">{out.compileErrors}</pre>}
          {(out?.kind === 'timeout' || out?.kind === 'engine-error' || out?.kind === 'runtime-failure') && <pre className="bad">{out.message}{out.stdout ? '\n\n' + out.stdout : ''}</pre>}
          {res && <pre>{res.stdout || (res.status === 'ran' ? '(nothing printed)' : '')}</pre>}
          {res?.error && <pre className="bad">{res.error}</pre>}
          {!status && !out && <p className="muted small">Press Run (Ctrl/⌘ + Enter).</p>}
        </div>
      </div>
    </div>
  );
}
