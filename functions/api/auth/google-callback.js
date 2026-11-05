// GET /api/auth/google-callback — Google sends the learner back here after they choose an account.
// Signs in an existing Google-linked profile, links Google to the signed-in profile, or creates a new profile.
import { cookie, currentUser, getCookie, loadUserByName, randomId, saveUser, sessionCookie } from '../../_lib/auth.js';
import { safePut } from '../../_lib/util.js';

function decodeJwtPayload(jwt) {
  const part = jwt.split('.')[1];
  const s = atob(part.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((part.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(s, (c) => c.charCodeAt(0))));
}

async function uniqueUsername(env, email, name) {
  let base = String(email || name || 'learner').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 18);
  if (base.length < 3) base = (base + 'learner').slice(0, 10);
  if (!(await loadUserByName(env, base))) return base;
  for (let i = 0; i < 20; i++) {
    const cand = `${base}_${Math.floor(Math.random() * 9000) + 1000}`;
    if (!(await loadUserByName(env, cand))) return cand;
  }
  return `learner_${randomId(4).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const fail = (why) => {
    const h = new Headers({ location: `${origin}/signin?error=${why}` });
    h.append('set-cookie', cookie('dsa_oauth_state', '', 0, request));
    return new Response(null, { status: 302, headers: h });
  };
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.STORE) return fail('google_unavailable');
  const state = url.searchParams.get('state');
  if (!state || state !== getCookie(request, 'dsa_oauth_state')) return fail('google_failed');
  const code = url.searchParams.get('code');
  if (!code) return fail('google_cancelled');

  let claims;
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: origin + '/api/auth/google-callback', grant_type: 'authorization_code' }),
    });
    const tok = await r.json();
    if (!r.ok || !tok.id_token) return fail('google_failed');
    // The ID token came straight from Google's token endpoint over TLS in exchange for our secret,
    // so its signature need not be re-verified (OpenID Connect Core §3.1.3.7); the claims are still checked.
    claims = decodeJwtPayload(tok.id_token);
  } catch { return fail('google_failed'); }
  if (claims.aud !== env.GOOGLE_CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) || !claims.sub || (claims.exp * 1000) < Date.now()) return fail('google_failed');

  const sub = String(claims.sub);
  let user = null;
  let dest = '/?signedin=google';
  const linkedName = await env.STORE.get('guser:' + sub);
  if (linkedName) user = await loadUserByName(env, linkedName);
  if (!user) {
    const me = await currentUser(env, request);
    if (me && !me.google) {
      me.google = sub; me.email = claims.email || me.email;
      user = me; dest = '/profile?linked=google';
    } else {
      user = { id: randomId(), username: await uniqueUsername(env, claims.email, claims.name), google: sub, email: claims.email || null, recovery: null, createdAt: new Date().toISOString(), sv: 0 };
      dest = '/?signedin=google&new=1';
    }
    if (!(await saveUser(env, user))) return fail('storage_busy');
    if (!(await safePut(env, 'guser:' + sub, user.username.toLowerCase()))) return fail('storage_busy');
  }
  const h = new Headers({ location: origin + dest, 'cache-control': 'no-store' });
  h.append('set-cookie', await sessionCookie(env, request, user));
  h.append('set-cookie', cookie('dsa_oauth_state', '', 0, request));
  return new Response(null, { status: 302, headers: h });
}
