import 'server-only';
import { ENQUIRY_STATUSES, REVENUE_CATEGORIES, type Enquiry, type RevenueEntry, type RevenueTarget, type WaitlistEntry } from './db';

// Numbers for the admin dashboards. Everything is counted in Harare time.

const TZ = 'Africa/Harare';
const ymd = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export const monthOf = (isoOrYmd: string) => (isoOrYmd.length > 10 ? ymd(new Date(isoOrYmd)) : isoOrYmd).slice(0, 7);
export const todayYmd = (now = new Date()) => ymd(now);

/** The last n month keys ("2026-06"), oldest first, ending with the current month. */
export function lastMonths(n: number, now = new Date()): string[] {
  const [y, m] = todayYmd(now).split('-').map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
}

export const monthLabel = (key: string, long = false) =>
  new Intl.DateTimeFormat('en-GB', { month: long ? 'long' : 'short', timeZone: 'UTC' }).format(new Date(`${key}-01T00:00:00Z`));

export const SOURCE_LABELS: Record<string, string> = { 'project-builder': 'Project builder', 'ai-workforce': 'AI Workforce' };
export const sourceLabel = (s: string) => SOURCE_LABELS[s] ?? 'Contact & other';
export const SOURCES = ['Project builder', 'AI Workforce', 'Contact & other'] as const;

export type Series = { name: string; values: number[] };

function stack<T>(items: T[], months: string[], monthKey: (t: T) => string, group: (t: T) => string, groups: readonly string[], amount: (t: T) => number = () => 1): Series[] {
  const idx = new Map(months.map((m, i) => [m, i]));
  const out = groups.map((name) => ({ name, values: months.map(() => 0) }));
  for (const t of items) {
    const i = idx.get(monthKey(t));
    if (i === undefined) continue;
    const g = out.find((s) => s.name === group(t)) ?? out[out.length - 1];
    g.values[i] += amount(t);
  }
  return out;
}

export const enquiriesByMonth = (enquiries: Enquiry[], months: string[]) =>
  stack(enquiries, months, (e) => monthOf(e.createdAt), (e) => sourceLabel(e.data.source), SOURCES);

export const revenueByMonth = (revenue: RevenueEntry[], months: string[]) =>
  stack(revenue, months, (r) => monthOf(r.receivedOn), (r) => ((REVENUE_CATEGORIES as readonly string[]).includes(r.category) ? r.category : 'Other'), REVENUE_CATEGORIES, (r) => r.amountCents);

export const waitlistByMonth = (entries: WaitlistEntry[], months: string[]) => {
  const idx = new Map(months.map((m, i) => [m, i]));
  const values = months.map(() => 0);
  for (const e of entries) {
    const i = idx.get(monthOf(e.createdAt));
    if (i !== undefined) values[i]++;
  }
  return values;
};

export function countBy<T>(items: T[], key: (t: T) => string): { name: string; value: number }[] {
  const m = new Map<string, number>();
  for (const t of items) m.set(key(t), (m.get(key(t)) ?? 0) + 1);
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export const statusCounts = (enquiries: Enquiry[]) => ENQUIRY_STATUSES.map((s) => ({ name: s.charAt(0) + s.slice(1).toLowerCase(), value: enquiries.filter((e) => e.status === s).length }));

export type TargetProgress = {
  targetCents: number;
  earnedCents: number;
  remainingCents: number;
  pct: number;
  deadline: string;
  start: string;
  daysLeft: number;
  weeksLeft: number;
  perWeekNeededCents: number;
  /** Where a straight line from 0 at the start to the target at the deadline would be today. */
  onPaceCents: number;
  status: 'done' | 'ahead' | 'behind' | 'ended';
  /** Running total by month from the start of the target year to the deadline month. */
  cumulative: { month: string; cents: number | null }[];
};

export function targetProgress(revenue: RevenueEntry[], target: RevenueTarget, now = new Date()): TargetProgress {
  const start = `${target.deadline.slice(0, 4)}-01-01`;
  const today = todayYmd(now);
  const inWindow = revenue.filter((r) => r.receivedOn >= start && r.receivedOn <= target.deadline);
  const earnedCents = inWindow.reduce((s, r) => s + r.amountCents, 0);
  const day = 86_400_000;
  const t0 = Date.parse(`${start}T00:00:00Z`);
  const t1 = Date.parse(`${target.deadline}T23:59:59Z`);
  const tn = Date.parse(`${today}T12:00:00Z`);
  const daysLeft = Math.max(0, Math.ceil((t1 - tn) / day));
  const weeksLeft = Math.max(daysLeft / 7, daysLeft > 0 ? 1 / 7 : 0);
  const remainingCents = Math.max(0, target.amountCents - earnedCents);
  const onPaceCents = Math.round(target.amountCents * Math.min(1, Math.max(0, (tn - t0) / (t1 - t0))));
  const months: string[] = [];
  for (let d = new Date(t0); d.getTime() <= t1; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) {
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  let run = 0;
  const thisMonth = today.slice(0, 7);
  const cumulative = months.map((m) => {
    run += inWindow.filter((r) => r.receivedOn.slice(0, 7) === m).reduce((s, r) => s + r.amountCents, 0);
    return { month: m, cents: m <= thisMonth ? run : null };
  });
  return {
    targetCents: target.amountCents,
    earnedCents,
    remainingCents,
    pct: target.amountCents > 0 ? Math.min(100, (earnedCents / target.amountCents) * 100) : 0,
    deadline: target.deadline,
    start,
    daysLeft,
    weeksLeft,
    perWeekNeededCents: weeksLeft > 0 ? Math.ceil(remainingCents / weeksLeft) : remainingCents,
    onPaceCents,
    status: earnedCents >= target.amountCents ? 'done' : daysLeft === 0 ? 'ended' : earnedCents >= onPaceCents ? 'ahead' : 'behind',
    cumulative,
  };
}

/** Change from the previous value as a percentage, or null when there is nothing to compare with. */
export const deltaPct = (current: number, previous: number) => (previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? null : 0);

export const usd = (cents: number, digits = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(cents / 100);

export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: TZ }).format(now));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export const longDate = (now = new Date()) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(now);
