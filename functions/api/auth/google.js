// GET /api/auth/google — starts "Continue with Google" (OAuth 2.0 authorization code flow).
// Needs Pages environment variables GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (see README).
import { cookie, randomId } from '../../_lib/auth.js';

export function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.STORE) return Response.redirect(origin + '/signin?error=google_unavailable', 302);
  const state = randomId(16);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: origin + '/api/auth/google-callback',
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  }).toString();
  const headers = new Headers({ location: url.toString(), 'cache-control': 'no-store' });
  headers.append('set-cookie', cookie('dsa_oauth_state', state, 600, request));
  return new Response(null, { status: 302, headers });
}
