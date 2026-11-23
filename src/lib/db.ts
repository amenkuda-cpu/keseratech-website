import 'server-only';
import { createClient } from '@libsql/client/web';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { DEFAULT_ESTIMATOR, DEFAULT_PLANS, PLANS_VERSION, estimatorSchema, planSchema, type EstimatorConfig, type Plan } from './pricing';
import { DIVISION_SLUGS, STATUSES } from '@/content/site';
import { SEED_PROJECTS } from '@/content/projects';

// SQLite, two ways, same tables and queries:
// - online: a Turso database over HTTPS (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN), through libSQL's
//   pure-JavaScript web client, so hosts like Netlify need no native modules;
// - locally (no Turso settings): a file under DATA_DIR through Node's built-in node:sqlite.

type Arg = string | number | null;
type Stmt = { sql: string; args?: Arg[] };
type Row = Record<string, unknown>;
type Store = {
  execute(stmt: Stmt): Promise<{ rows: Row[]; lastInsertRowid?: number | bigint }>;
  /** Runs the statements in one transaction. */
  batch(stmts: Stmt[]): Promise<void>;
};

const NOW = `strftime('%Y-%m-%dT%H:%M:%fZ','now')`;

/** A Vercel preview deployment: same database as the live site, so it must not migrate data. */
const PREVIEW = process.env.VERCEL_ENV === 'preview';

const SCHEMA: Stmt[] = [
  `CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (${NOW})
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    slug TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (${NOW})
  )`,
  `CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (${NOW}),
    status TEXT NOT NULL DEFAULT 'NEW',
    data TEXT NOT NULL
  )`,
  // Product waitlists (Amey AI first). One row per email per product.
  `CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (${NOW}),
    product TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    business TEXT,
    UNIQUE (product, email)
  )`,
  // Money received, recorded by admins (the Finance page and the revenue target read this).
  `CREATE TABLE IF NOT EXISTS revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (${NOW}),
    received_on TEXT NOT NULL,
    client TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category TEXT NOT NULL,
    method TEXT NOT NULL,
    note TEXT,
    created_by TEXT
  )`,
  // Named website administrators. Passwords are scrypt hashes (see lib/admin-auth.ts).
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (${NOW}),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    last_login_at TEXT,
    must_change_password INTEGER NOT NULL DEFAULT 1
  )`,
].map((sql) => ({ sql }));

function turso(url: string): Store {
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return {
    async execute({ sql, args = [] }) {
      const res = await client.execute({ sql, args });
      return { rows: res.rows as unknown as Row[], lastInsertRowid: res.lastInsertRowid };
    },
    async batch(stmts) {
      await client.batch(stmts.map(({ sql, args = [] }) => ({ sql, args })), 'write');
    },
  };
}

async function localFile(): Promise<Store> {
  // Loaded only here, so online builds never touch node:sqlite.
  const { DatabaseSync } = await import('node:sqlite');
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, 'sera.db'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  const exec = ({ sql, args = [] }: Stmt) => {
    const st = db.prepare(sql);
    if (/^\s*select/i.test(sql)) return { rows: st.all(...args) as Row[] };
    const r = st.run(...args);
    return { rows: [], lastInsertRowid: r.lastInsertRowid };
  };
  return {
    async execute(stmt) {
      return exec(stmt);
    },
    async batch(stmts) {
      db.exec('BEGIN');
      try {
        stmts.forEach(exec);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

async function prepare(): Promise<Store> {
  const url = process.env.TURSO_DATABASE_URL;
  const store = url ? turso(url) : await localFile();
  await store.batch([
    ...SCHEMA,
    { sql: `INSERT OR IGNORE INTO kv (key, value) VALUES ('plans', ?)`, args: [JSON.stringify(DEFAULT_PLANS)] },
    // When PLANS_VERSION goes up, the new default plans replace the stored ones once; later admin edits stay.
    // Preview deployments share the live database, so they never run this: getPlans() shows them the
    // new defaults instead, and the live data changes only when the new version reaches production.
    ...(PREVIEW
      ? []
      : [
          {
            sql: `UPDATE kv SET value = ?, updated_at = ${NOW} WHERE key = 'plans'
                  AND NOT EXISTS (SELECT 1 FROM kv WHERE key = 'plans_version' AND CAST(value AS INTEGER) >= ?)`,
            args: [JSON.stringify(DEFAULT_PLANS), PLANS_VERSION],
          },
          {
            sql: `INSERT INTO kv (key, value) VALUES ('plans_version', ?)
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value WHERE CAST(kv.value AS INTEGER) < CAST(excluded.value AS INTEGER)`,
            args: [String(PLANS_VERSION)],
          },
        ]),
    // First administrator, created once while the table is empty (INITIAL_ADMIN_* hold an email, a name and a password hash, never a password).
    ...(!PREVIEW && process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_PASSWORD_HASH
      ? [
          {
            sql: `INSERT INTO admin_users (email, name, password_hash, must_change_password) SELECT ?, ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM admin_users)`,
            args: [process.env.INITIAL_ADMIN_EMAIL.trim().toLowerCase(), (process.env.INITIAL_ADMIN_NAME ?? 'Admin').trim(), process.env.INITIAL_ADMIN_PASSWORD_HASH.trim()],
          },
        ]
      : []),
    { sql: `INSERT OR IGNORE INTO kv (key, value) VALUES ('estimator', ?)`, args: [JSON.stringify(DEFAULT_ESTIMATOR)] },
    ...SEED_PROJECTS.map((p) => ({ sql: `INSERT OR IGNORE INTO projects (slug, data, sort) VALUES (?, ?, ?)`, args: [p.slug, JSON.stringify(p), p.sort] })),
    // AgriSera Horizon replaces the older Smart Irrigation page (/projects/smart-irrigation redirects
    // to it). Unpublish the old row once, live only; it stays in /admin and can be republished there.
    ...(PREVIEW
      ? []
      : [
          {
            sql: `UPDATE projects SET data = json_set(data, '$.published', json('false'), '$.featured', json('false'))
                  WHERE slug = 'smart-irrigation' AND NOT EXISTS (SELECT 1 FROM kv WHERE key = 'horizon_replaces_irrigation')`,
          },
          { sql: `INSERT OR IGNORE INTO kv (key, value) VALUES ('horizon_replaces_irrigation', '1')` },
        ]),
  ]);
  return store;
}

// One connection, and one schema/seed run, per server process.
const globalForDb = globalThis as unknown as { __seraDb?: Promise<Store> };

function db(): Promise<Store> {
  globalForDb.__seraDb ??= prepare().catch((e) => {
    globalForDb.__seraDb = undefined; // let the next request retry
    throw e;
  });
  return globalForDb.__seraDb;
}

async function one<T>(sql: string, args: Arg[] = []): Promise<T | undefined> {
  const res = await (await db()).execute({ sql, args });
  return res.rows[0] as T | undefined;
}

async function all<T>(sql: string, args: Arg[] = []): Promise<T[]> {
  const res = await (await db()).execute({ sql, args });
  return res.rows as T[];
}

async function run(sql: string, args: Arg[] = []) {
  return (await db()).execute({ sql, args });
}

// ---------------------------------------------------------------------------
// Pricing

export async function getPlans(): Promise<Plan[]> {
  if (PREVIEW) {
    const v = await one<{ value: string }>(`SELECT value FROM kv WHERE key = 'plans_version'`);
    if (Number(v?.value ?? 0) < PLANS_VERSION) return [...DEFAULT_PLANS].sort((a, b) => a.sort - b.sort);
  }
  const row = await one<{ value: string }>(`SELECT value FROM kv WHERE key = 'plans'`);
  const parsed = z.array(planSchema).safeParse(row ? JSON.parse(row.value) : null);
  const plans = parsed.success ? parsed.data : DEFAULT_PLANS;
  return [...plans].sort((a, b) => a.sort - b.sort);
}

export async function savePlans(plans: Plan[]) {
  const valid = z.array(planSchema).parse(plans);
  await run(`UPDATE kv SET value = ?, updated_at = ${NOW} WHERE key = 'plans'`, [JSON.stringify(valid)]);
}

export async function getEstimator(): Promise<EstimatorConfig> {
  const row = await one<{ value: string }>(`SELECT value FROM kv WHERE key = 'estimator'`);
  const parsed = estimatorSchema.safeParse(row ? JSON.parse(row.value) : null);
  return parsed.success ? parsed.data : DEFAULT_ESTIMATOR;
}

export async function saveEstimator(config: EstimatorConfig) {
  const valid = estimatorSchema.parse(config);
  await run(`UPDATE kv SET value = ?, updated_at = ${NOW} WHERE key = 'estimator'`, [JSON.stringify(valid)]);
}

// ---------------------------------------------------------------------------
// Projects (CMS)

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(60),
  name: z.string().min(1).max(60),
  kind: z.enum(['venture', 'client']),
  division: z.enum(DIVISION_SLUGS),
  status: z.enum(STATUSES),
  /** Short line, e.g. "Delivery + parcels + errands" */
  tagline: z.string().max(80),
  /** Display headline; line breaks become separate lines. */
  headline: z.string().max(120),
  summary: z.string().max(600),
  capabilities: z.array(z.string().max(120)).max(12),
  sections: z.array(z.object({ title: z.string().max(80), text: z.string().max(1500) })).max(8),
  visual: z.enum(['delivery', 'irrigation', 'ev', 'upcycle', 'marketplace', 'none']),
  /** Where people can get it (finished products). Optional so older saved projects stay valid. */
  links: z
    .object({
      website: z.string().url().nullable().optional(),
      appStore: z.string().url().nullable().optional(),
      googlePlay: z.string().url().nullable().optional(),
    })
    .optional(),
  /** Client projects only */
  client: z.string().max(80).nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  sort: z.number().int(),
});
export type Project = z.infer<typeof projectSchema>;

function rowsToProjects(rows: { data: string }[]): Project[] {
  return rows.flatMap((r) => {
    const p = projectSchema.safeParse(JSON.parse(r.data));
    return p.success ? [p.data] : [];
  });
}

export async function listProjects(opts: { includeUnpublished?: boolean } = {}): Promise<Project[]> {
  const rows = await all<{ data: string }>(`SELECT data FROM projects ORDER BY sort, slug`);
  return rowsToProjects(rows).filter((p) => opts.includeUnpublished || p.published);
}

export async function getProject(slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<Project | null> {
  const row = await one<{ data: string }>(`SELECT data FROM projects WHERE slug = ?`, [slug]);
  const p = row ? rowsToProjects([row])[0] ?? null : null;
  return p && (p.published || opts.includeUnpublished) ? p : null;
}

export async function saveProject(project: Project, previousSlug?: string) {
  const p = projectSchema.parse(project);
  const statements: Stmt[] = [];
  if (previousSlug && previousSlug !== p.slug) statements.push({ sql: `DELETE FROM projects WHERE slug = ?`, args: [previousSlug] });
  statements.push({
    sql: `INSERT INTO projects (slug, data, sort) VALUES (?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET data = excluded.data, sort = excluded.sort, updated_at = ${NOW}`,
    args: [p.slug, JSON.stringify(p), p.sort],
  });
  await (await db()).batch(statements); // one transaction: a renamed project is never lost
}

export async function deleteProject(slug: string) {
  await run(`DELETE FROM projects WHERE slug = ?`, [slug]);
}

// ---------------------------------------------------------------------------
// Enquiries (project builder + contact)

export const ENQUIRY_STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'CLOSED'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type EnquiryData = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  description: string;
  service: string;
  projectType: string | null;
  package: string | null;
  features: string[];
  users: string | null;
  timeline: string | null;
  estimateLowCents: number | null;
  estimateHighCents: number | null;
  source: string;
};

export type Enquiry = { id: number; createdAt: string; status: EnquiryStatus; data: EnquiryData };

export async function createEnquiry(data: EnquiryData): Promise<number> {
  const res = await run(`INSERT INTO enquiries (data) VALUES (?)`, [JSON.stringify(data)]);
  return Number(res.lastInsertRowid);
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const rows = await all<{ id: number; created_at: string; status: EnquiryStatus; data: string }>(
    `SELECT id, created_at, status, data FROM enquiries ORDER BY id DESC LIMIT 500`,
  );
  return rows.map((r) => ({ id: Number(r.id), createdAt: r.created_at, status: r.status, data: JSON.parse(r.data) as EnquiryData }));
}

export async function setEnquiryStatus(id: number, status: EnquiryStatus) {
  await run(`UPDATE enquiries SET status = ? WHERE id = ?`, [status, id]);
}

// ---------------------------------------------------------------------------
// Waitlists

export type WaitlistEntry = { id: number; createdAt: string; product: string; name: string; email: string; business: string | null };

/** Adds someone to a product's waitlist. Signing up again with the same email updates the name and business. */
export async function joinWaitlist(entry: { product: string; name: string; email: string; business: string | null }) {
  await run(
    `INSERT INTO waitlist (product, name, email, business) VALUES (?, ?, ?, ?)
     ON CONFLICT (product, email) DO UPDATE SET name = excluded.name, business = COALESCE(excluded.business, waitlist.business)`,
    [entry.product, entry.name, entry.email, entry.business ?? null],
  );
}

export async function listWaitlist(product?: string): Promise<WaitlistEntry[]> {
  const rows = await all<{ id: number; created_at: string; product: string; name: string; email: string; business: string | null }>(
    `SELECT id, created_at, product, name, email, business FROM waitlist ${product ? 'WHERE product = ?' : ''} ORDER BY id DESC LIMIT 2000`,
    product ? [product] : [],
  );
  return rows.map((r) => ({ id: Number(r.id), createdAt: r.created_at, product: r.product, name: r.name, email: r.email, business: r.business }));
}

// ---------------------------------------------------------------------------
// Website administrators

export type AdminUser = { id: number; email: string; name: string; createdAt: string; lastLoginAt: string | null; mustChangePassword: boolean };
type AdminRow = { id: number; email: string; name: string; password_hash: string; created_at: string; last_login_at: string | null; must_change_password: number };
const toAdmin = (r: AdminRow): AdminUser => ({ id: Number(r.id), email: r.email, name: r.name, createdAt: r.created_at, lastLoginAt: r.last_login_at, mustChangePassword: Number(r.must_change_password) === 1 });

export async function findAdminByEmail(email: string): Promise<(AdminUser & { passwordHash: string }) | null> {
  const r = await one<AdminRow>(`SELECT * FROM admin_users WHERE email = ?`, [email.trim().toLowerCase()]);
  return r ? { ...toAdmin(r), passwordHash: r.password_hash } : null;
}

export async function getAdmin(id: number): Promise<(AdminUser & { passwordHash: string }) | null> {
  const r = await one<AdminRow>(`SELECT * FROM admin_users WHERE id = ?`, [id]);
  return r ? { ...toAdmin(r), passwordHash: r.password_hash } : null;
}

export async function listAdmins(): Promise<AdminUser[]> {
  return (await all<AdminRow>(`SELECT * FROM admin_users ORDER BY id`)).map(toAdmin);
}

export async function createAdmin(a: { email: string; name: string; passwordHash: string }) {
  // New admins get a starting password from a colleague, so they must choose their own on first sign-in.
  await run(`INSERT INTO admin_users (email, name, password_hash, must_change_password) VALUES (?, ?, ?, 1)`, [a.email.trim().toLowerCase(), a.name.trim(), a.passwordHash]);
}

export async function deleteAdmin(id: number) {
  await run(`DELETE FROM admin_users WHERE id = ?`, [id]);
}

export async function setAdminPassword(id: number, passwordHash: string) {
  await run(`UPDATE admin_users SET password_hash = ?, must_change_password = 0 WHERE id = ?`, [passwordHash, id]);
}

export async function markAdminLogin(id: number) {
  await run(`UPDATE admin_users SET last_login_at = ${NOW} WHERE id = ?`, [id]);
}

// ---------------------------------------------------------------------------
// Revenue and target

export const REVENUE_CATEGORIES = ['Websites', 'AI Workforce', 'Amey AI', 'Apps & systems', 'Other'] as const;
export const PAYMENT_METHODS = ['EcoCash', 'InnBucks', 'Bank transfer', 'Cash', 'Card', 'Pesepay', 'Other'] as const;
export type RevenueEntry = { id: number; receivedOn: string; client: string; amountCents: number; category: string; method: string; note: string | null; createdBy: string | null };

export async function listRevenue(): Promise<RevenueEntry[]> {
  const rows = await all<{ id: number; received_on: string; client: string; amount_cents: number; category: string; method: string; note: string | null; created_by: string | null }>(
    `SELECT id, received_on, client, amount_cents, category, method, note, created_by FROM revenue ORDER BY received_on DESC, id DESC LIMIT 5000`,
  );
  return rows.map((r) => ({ id: Number(r.id), receivedOn: r.received_on, client: r.client, amountCents: Number(r.amount_cents), category: r.category, method: r.method, note: r.note, createdBy: r.created_by }));
}

export async function addRevenue(e: Omit<RevenueEntry, 'id'>) {
  await run(`INSERT INTO revenue (received_on, client, amount_cents, category, method, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    e.receivedOn,
    e.client,
    e.amountCents,
    e.category,
    e.method,
    e.note,
    e.createdBy,
  ]);
}

export async function deleteRevenue(id: number) {
  await run(`DELETE FROM revenue WHERE id = ?`, [id]);
}

export type RevenueTarget = { amountCents: number; deadline: string };
export const DEFAULT_TARGET: RevenueTarget = { amountCents: 100_000, deadline: '2026-12-31' };

export async function getRevenueTarget(): Promise<RevenueTarget> {
  const r = await one<{ value: string }>(`SELECT value FROM kv WHERE key = 'revenue_target'`);
  try {
    return r ? { ...DEFAULT_TARGET, ...(JSON.parse(r.value) as Partial<RevenueTarget>) } : DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

export async function setRevenueTarget(t: RevenueTarget) {
  await run(`INSERT INTO kv (key, value) VALUES ('revenue_target', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = ${NOW}`, [JSON.stringify(t)]);
}

// ---------------------------------------------------------------------------
// Admin sign-in lockout (stored in the database, so it holds across every server instance)

const LOCK_AFTER = 8;
const LOCK_MINUTES = 15;

export async function adminLoginLockedUntil(email: string): Promise<number> {
  const r = await one<{ value: string }>(`SELECT value FROM kv WHERE key = ?`, [`login-fail:${email}`]);
  if (!r) return 0;
  const v = JSON.parse(r.value) as { count: number; first: number; until?: number };
  return v.until && v.until > Date.now() ? v.until : 0;
}

export async function recordAdminLoginFailure(email: string) {
  const key = `login-fail:${email}`;
  const r = await one<{ value: string }>(`SELECT value FROM kv WHERE key = ?`, [key]);
  const now = Date.now();
  let v = r ? (JSON.parse(r.value) as { count: number; first: number; until?: number }) : { count: 0, first: now };
  if (now - v.first > LOCK_MINUTES * 60_000) v = { count: 0, first: now };
  v.count += 1;
  if (v.count >= LOCK_AFTER) v.until = now + LOCK_MINUTES * 60_000;
  await run(`INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = ${NOW}`, [key, JSON.stringify(v)]);
}

export async function clearAdminLoginFailures(email: string) {
  await run(`DELETE FROM kv WHERE key = ?`, [`login-fail:${email}`]);
}
