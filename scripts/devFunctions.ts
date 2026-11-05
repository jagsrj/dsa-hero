// Dev-only: runs the Cloudflare Pages Functions in functions/ inside the Vite dev server,
// with an in-memory stand-in for the KV namespace. Lets you test profiles and sync locally.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const mem = new Map<string, string>();
const STORE = {
  async get(key: string, type?: string) { const v = mem.get(key); return v === undefined ? null : type === 'json' ? JSON.parse(v) : v; },
  async put(key: string, value: string) { mem.set(key, value); },
  async delete(key: string) { mem.delete(key); },
  async list({ prefix = '' } = {}) { return { keys: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) }; },
};

export async function handleFunction(req: IncomingMessage, res: ServerResponse, root: string): Promise<boolean> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const file = resolve(root, 'functions' + url.pathname + '.js');
  if (!url.pathname.startsWith('/api/') || !existsSync(file)) return false;
  const chunks: Buffer[] = [];
  for await (const ch of req) chunks.push(ch as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
  const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method ?? 'GET') ? undefined : Buffer.concat(chunks) });
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
  const fn = (req.method === 'GET' && mod.onRequestGet) || (req.method === 'POST' && mod.onRequestPost) || mod.onRequest;
  const env = { STORE, GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET };
  const response: Response = fn ? await fn({ request, env }) : new Response('not found', { status: 404 });
  res.statusCode = response.status;
  response.headers.forEach((v, k) => { if (k !== 'set-cookie') res.setHeader(k, v); });
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader('set-cookie', cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
  return true;
}
