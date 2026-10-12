import 'server-only';
import { createClient } from '@libsql/client/web';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { DEFAULT_ESTIMATOR, DEFAULT_PLANS, estimatorSchema, planSchema, type EstimatorConfig, type Plan } from './pricing';
import { DIVISION_SLUGS, STATUSES } from '@/content/site';
import { SEED_PROJECTS } from '@/content/projects';

// SQLite, two ways, same tables and queries:
// - online: a Turso database over HTTPS (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN), through libSQL's
//   pure-JavaScript web client, so hosts like Netlify need no native modules;
// - locally (no Turso settings): a file under DATA_DIR through Node's built-in node:sqlite.

type Arg = string | number;
type Stmt = { sql: string; args?: Arg[] };
type Row = Record<string, unknown>;
type Store = {
  execute(stmt: Stmt): Promise<{ rows: Row[]; lastInsertRowid?: number | bigint }>;
  /** Runs the statements in one transaction. */
  batch(stmts: Stmt[]): Promise<void>;
};

const NOW = `strftime('%Y-%m-%dT%H:%M:%fZ','now')`;

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
    { sql: `INSERT OR IGNORE INTO kv (key, value) VALUES ('estimator', ?)`, args: [JSON.stringify(DEFAULT_ESTIMATOR)] },
    ...SEED_PROJECTS.map((p) => ({ sql: `INSERT OR IGNORE INTO projects (slug, data, sort) VALUES (?, ?, ?)`, args: [p.slug, JSON.stringify(p), p.sort] })),
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
