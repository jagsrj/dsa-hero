// POST /api/progress — the signed-in learner's saved progress.
//   { op: 'get' } | { op: 'put', data } | { op: 'snapshots' } | { op: 'snapshot', date }
// One daily snapshot (the state before the day's first change) is kept for 30 days.
import { json, safePut, sameOrigin, overLimit, clientIp } from '../_lib/util.js';
import { currentUser, needStore } from '../_lib/auth.js';

const MAX_BYTES = 1_500_000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validPayload(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d) || d.version !== 1) return false;
  for (const k of ['problems', 'modules', 'phases', 'review', 'badges', 'days', 'code', 'daily']) {
    if (d[k] !== undefined && (typeof d[k] !== 'object' || d[k] === null || Array.isArray(d[k]))) return false;
  }
  if (d.days && !Object.keys(d.days).every((k) => DATE.test(k))) return false;
  if (d.problems && Object.keys(d.problems).length > 5000) return false;
  return true;
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const ns = needStore(env); if (ns) return ns;
  const user = await currentUser(env, request);
  if (!user) return json({ error: 'signed_out' }, 401);
  if (overLimit('progress:' + clientIp(request), 240, 3600)) return json({ error: 'rate_limited' }, 429);
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413);
  let body; try { body = JSON.parse(raw); } catch { return json({ error: 'bad_request' }, 400); }
  const key = 'prog:' + user.id, snapPrefix = 'psnap:' + user.id + ':';

  if (body.op === 'get') return json({ data: (await env.STORE.get(key, 'json')) || null });
  if (body.op === 'put') {
    if (!validPayload(body.data)) return json({ error: 'bad_request' }, 400);
    const next = JSON.stringify(body.data), current = await env.STORE.get(key);
    if (current === next) return json({ ok: true, unchanged: true });
    const snapKey = snapPrefix + new Date().toISOString().slice(0, 10);
    if (current && !(await env.STORE.get(snapKey))) await safePut(env, snapKey, current, { expirationTtl: 30 * 86400 });
    if (!(await safePut(env, key, next))) return json({ error: 'storage_busy' }, 503);
    return json({ ok: true });
  }
  if (body.op === 'snapshots') {
    const list = await env.STORE.list({ prefix: snapPrefix });
    return json({ dates: list.keys.map((k) => k.name.slice(snapPrefix.length)).sort().reverse() });
  }
  if (body.op === 'snapshot') {
    if (!DATE.test(String(body.date))) return json({ error: 'bad_request' }, 400);
    return json({ data: await env.STORE.get(snapPrefix + body.date, 'json') });
  }
  return json({ error: 'bad_request' }, 400);
}
export const onRequest = () => json({ error: 'method_not_allowed' }, 405);
