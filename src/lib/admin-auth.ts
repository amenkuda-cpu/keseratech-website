import 'server-only';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdmin, type AdminUser } from './db';

// Named admins (admin_users table): email + password, passwords stored as scrypt hashes.
// The session cookie is "<expiry>.<adminId>.<hmac>" signed with ADMIN_SESSION_SECRET, and the
// admin is looked up on every request, so removing an admin ends their sessions at once.

export const ADMIN_COOKIE = 'sera_admin';
const TTL_SECONDS = 12 * 60 * 60;

export const adminConfigured = () => !!secret();

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? '';
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

// ---------------------------------------------------------------------------
// Passwords

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${SCRYPT.N}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [kind, n, salt, hash] = stored.split('$');
  if (kind !== 'scrypt' || !n || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const got = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length, { N: Number(n), r: SCRYPT.r, p: SCRYPT.p });
  return got.length === expected.length && timingSafeEqual(got, expected);
}

/** Same rule everywhere an admin password is set. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return 'Use at least 10 characters.';
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return 'Use letters and at least one number.';
  return null;
}

/** A spare hash so a wrong email takes as long as a wrong password. */
export const DUMMY_HASH = 'scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// ---------------------------------------------------------------------------
// Sessions

export function createSessionValue(adminId: number, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + TTL_SECONDS}.${adminId}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the admin id a valid session belongs to, or null. */
export function sessionAdminId(value: string | undefined, now = Date.now()): number | null {
  if (!value || !adminConfigured()) return null;
  const [exp, id, sig] = value.split('.');
  if (!exp || !id || !sig || !safeEqual(sig, sign(`${exp}.${id}`))) return null;
  if (Number(exp) * 1000 <= now) return null;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function startSession(adminId: number) {
  (await cookies()).set(ADMIN_COOKIE, createSessionValue(adminId), {
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

/** The signed-in admin, or null. */
export async function currentAdmin(): Promise<AdminUser | null> {
  const id = sessionAdminId((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!id) return null;
  const admin = await getAdmin(id);
  if (!admin) return null;
  const { passwordHash: _hash, ...rest } = admin; // eslint-disable-line @typescript-eslint/no-unused-vars
  return rest;
}

export async function isAdmin() {
  return (await currentAdmin()) !== null;
}

/** Use at the top of every admin page and server action. Returns who is signed in. An admin still on a temporary password is sent to choose a new one first. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  if (admin.mustChangePassword) redirect('/admin/new-password');
  return admin;
}
