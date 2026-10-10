import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Single-password admin. ADMIN_PASSWORD signs people in; the session cookie is an
// HMAC-signed expiry time (ADMIN_SESSION_SECRET), so nothing is stored server-side.

export const ADMIN_COOKIE = 'sera_admin';
const TTL_SECONDS = 12 * 60 * 60;

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD && !!secret();

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? '';
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected) return false;
  // Compare digests so the comparison takes the same time whatever the length.
  const h = (s: string) => createHmac('sha256', 'pw').update(s).digest('hex');
  return safeEqual(h(input), h(expected));
}

export function createSessionValue(now = Date.now()) {
  const exp = String(Math.floor(now / 1000) + TTL_SECONDS);
  return `${exp}.${sign(exp)}`;
}

export function sessionValid(value: string | undefined, now = Date.now()) {
  if (!value || !adminConfigured()) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) * 1000 > now;
}

export async function startSession() {
  (await cookies()).set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: '/admin' });
}

export async function isAdmin() {
  return sessionValid((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
