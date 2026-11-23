import 'server-only';

// AI Workforce snapshot from workforce.keseratech.com (/api/finance/overview), for the control panel.
// Same secret and host as the Pesepay feed (PESEPAY_FEED_URL, FINANCE_FEED_SECRET).

export type WfEmployee = {
  id: string;
  roleKey: string;
  name: string;
  title: string;
  status: string;
  createdAt: string | null;
  activatedAt: string | null;
  subscription: { status: string; billing: string; periodEnd: string | null } | null;
  tasks: number;
  tasksDone: number;
};
export type WfCustomer = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  createdAt: string | null;
  owner: { name: string; email: string; lastLoginAt: string | null } | null;
  employees: WfEmployee[];
  paidCents: number;
  payments: number;
  adminUrl: string;
};
export type WfRole = { key: string; name: string; title: string; summary: string; photo: string | null; hired: number; active: number; onTrial: number; tasks: number };
export type WfOverview = {
  generatedAt: string;
  site: string;
  roles: WfRole[];
  customers: WfCustomer[];
  totals: { customers: number; employees: number; activeEmployees: number; trials: number; tasks30d: number; tasksDone: number };
};

export type WfResult = { ok: true; data: WfOverview } | { ok: false; configured: boolean; error: string };

let cache: { at: number; data: WfOverview } | null = null;

export async function workforceOverview(): Promise<WfResult> {
  const feed = process.env.PESEPAY_FEED_URL?.trim();
  const secret = process.env.FINANCE_FEED_SECRET?.trim();
  if (!feed || !secret) return { ok: false, configured: false, error: 'The AI Workforce connection is not set up.' };
  if (cache && Date.now() - cache.at < 60_000) return { ok: true, data: cache.data };
  try {
    const url = new URL('/api/finance/overview', feed).toString();
    const res = await fetch(url, { headers: { authorization: `Bearer ${secret}` }, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`The Workforce app answered ${res.status}.`);
    const data = (await res.json()) as WfOverview;
    cache = { at: Date.now(), data };
    return { ok: true, data };
  } catch (e) {
    if (cache) return { ok: true, data: cache.data };
    return { ok: false, configured: true, error: e instanceof Error ? e.message : 'Could not reach the Workforce app.' };
  }
}

/** Customer-facing words for an employee's state. */
export function employeeState(e: WfEmployee): { label: string; tone: 'good' | 'trial' | 'wait' | 'off' } {
  if (e.status === 'suspended') return { label: 'Suspended', tone: 'off' };
  if (e.subscription?.billing === 'trial' && e.subscription.status === 'active') return { label: 'Free trial', tone: 'trial' };
  if (e.status === 'active') return { label: e.subscription?.billing === 'complimentary' ? 'Active (free)' : 'Active, paid', tone: 'good' };
  if (e.status === 'pending_payment') return { label: 'Waiting to pay', tone: 'wait' };
  if (e.status === 'onboarding' || e.status === 'draft') return { label: 'Setting up', tone: 'wait' };
  if (e.status === 'paused') return { label: 'Paused', tone: 'off' };
  return { label: e.status === 'expired' ? 'Expired' : e.status === 'cancelled' ? 'Cancelled' : e.status, tone: 'off' };
}
