import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Dev-only endpoint that compiles and runs Java with the local JDK.
// Used when VITE_RUNNER=local (or localStorage 'dsa-runner' = 'local'). Never part of the production build.
function localJavaRunner(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const ch of req) chunks.push(ch as Buffer);
    const { runLocal } = await import('./scripts/localJava.ts');
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const out = await runLocal(body);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(out));
  };
  // must return void: a function returned from configureServer is treated as a post-hook by Vite
  const mount = (server: { middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => unknown } }): void => {
    server.middlewares.use('/__local_run', (req, res) => { handler(req, res).catch((e) => { res.statusCode = 500; res.end(String(e)); }); });
  };
  return { name: 'local-java-runner', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig({
  plugins: [react(), localJavaRunner()],
});
