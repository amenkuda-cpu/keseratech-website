import 'server-only';
import { listRevenue, type RevenueEntry } from './db';
import { pesepayRevenue, type FeedStatus } from './pesepay-feed';

/** Everything Kesera has been paid: the manual ledger plus Pesepay payments read from the Workforce app. */
export async function allRevenue(): Promise<{ entries: RevenueEntry[]; pesepay: FeedStatus }> {
  const [ledger, feed] = await Promise.all([listRevenue(), pesepayRevenue()]);
  const entries = [...ledger, ...feed.entries].sort((a, b) => (a.receivedOn < b.receivedOn ? 1 : a.receivedOn > b.receivedOn ? -1 : 0));
  return { entries, pesepay: feed.status };
}
