import 'server-only';
import type { RevenueEntry } from './db';

// Pesepay payments, read from the Kesera AI Workforce app (workforce.keseratech.com).
// Pesepay offers no API that lists a merchant's transactions, so the app that started each payment
// (and verified it with Pesepay) is the record. Set PESEPAY_FEED_URL and FINANCE_FEED_SECRET.

export type FeedStatus = { configured: boolean; ok: boolean; count: number; error?: string; checkedAt: string };
type FeedPayment = { id: string; amountCents: number; feeCents: number; currency: string; kind: string; reference: string; providerReference: string | null; paidAt: string; customer: string };

const TZ_DAY = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Harare', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));

let cache: { at: number; entries: RevenueEntry[]; status: FeedStatus } | null = null;

/** Pesepay payments as read-only revenue entries (negative ids so they never clash with the ledger). Cached for a minute. */
export async function pesepayRevenue(): Promise<{ entries: RevenueEntry[]; status: FeedStatus }> {
  const url = process.env.PESEPAY_FEED_URL?.trim();
  const secret = process.env.FINANCE_FEED_SECRET?.trim();
  const checkedAt = new Date().toISOString();
  if (!url || !secret) return { entries: [], status: { configured: false, ok: false, count: 0, checkedAt } };
  if (cache && Date.now() - cache.at < 60_000) return cache;
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${secret}` }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`The Workforce app answered ${res.status}.`);
    const body = (await res.json()) as { payments?: FeedPayment[] };
    const entries: RevenueEntry[] = (body.payments ?? [])
      .filter((p) => p.currency === 'USD' && p.amountCents > 0)
      .map((p, i) => ({
        id: -(i + 1),
        receivedOn: TZ_DAY(p.paidAt),
        client: p.customer,
        amountCents: p.amountCents,
        category: 'AI Workforce',
        method: 'Pesepay',
        note: `Pesepay ${p.providerReference ?? p.reference} · ${p.kind === 'renewal' ? 'renewal' : 'first month'} (automatic)`,
        createdBy: 'pesepay',
      }));
    cache = { at: Date.now(), entries, status: { configured: true, ok: true, count: entries.length, checkedAt } };
    return cache;
  } catch (e) {
    const status: FeedStatus = { configured: true, ok: false, count: cache?.entries.length ?? 0, error: e instanceof Error ? e.message : 'Could not reach the Workforce app.', checkedAt };
    return { entries: cache?.entries ?? [], status };
  }
}
