// GET /api/auth/config — which sign-in options this deployment supports.
import { json } from '../../_lib/util.js';
export const onRequestGet = ({ env }) => json({ accounts: !!env.STORE, google: !!(env.STORE && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) });
