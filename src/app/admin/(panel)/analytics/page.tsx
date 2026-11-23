import { requireAdmin } from '@/lib/admin-auth';
import { listEnquiries, listWaitlist } from '@/lib/db';
import { allRevenue } from '@/lib/revenue';
import { countBy, deltaPct, enquiriesByMonth, lastMonths, monthLabel, monthOf, revenueByMonth, sourceLabel, SOURCES, statusCounts, usd, waitlistByMonth } from '@/lib/admin-stats';
import { Donut, HBars, PALETTE, SegmentBar, StackedColumns } from '@/components/admin/charts';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await requireAdmin();
  const [enquiries, waitlist, { entries: revenue }] = await Promise.all([listEnquiries(), listWaitlist(), allRevenue()]);
  const months = lastMonths(12);
  const last30 = Date.now() - 30 * 86_400_000;
  const prev30 = Date.now() - 60 * 86_400_000;
  const inWindow = <T,>(xs: T[], at: (x: T) => string, from: number, to: number) => xs.filter((x) => Date.parse(at(x)) >= from && Date.parse(at(x)) < to);
  const now = Date.now() + 1;
  const kpis = [
    { label: 'Enquiries', cur: inWindow(enquiries, (e) => e.createdAt, last30, now).length, prev: inWindow(enquiries, (e) => e.createdAt, prev30, last30).length, fmt: String, color: PALETTE[0] },
    {
      label: 'Revenue',
      cur: inWindow(revenue, (r) => `${r.receivedOn}T12:00:00Z`, last30, now).reduce((s, r) => s + r.amountCents, 0),
      prev: inWindow(revenue, (r) => `${r.receivedOn}T12:00:00Z`, prev30, last30).reduce((s, r) => s + r.amountCents, 0),
      fmt: (c: number) => usd(c, 2),
      color: PALETTE[2],
    },
    { label: 'Waitlist sign-ups', cur: inWindow(waitlist, (w) => w.createdAt, last30, now).length, prev: inWindow(waitlist, (w) => w.createdAt, prev30, last30).length, fmt: String, color: PALETTE[1] },
    {
      label: 'AI Workforce requests',
      cur: inWindow(enquiries.filter((e) => e.data.source === 'ai-workforce'), (e) => e.createdAt, last30, now).length,
      prev: inWindow(enquiries.filter((e) => e.data.source === 'ai-workforce'), (e) => e.createdAt, prev30, last30).length,
      fmt: String,
      color: PALETTE[6],
    },
  ];
  const services = countBy(enquiries, (e) => e.data.service || 'Not given').slice(0, 7);
  const sources = SOURCES.map((s) => ({ name: s, value: enquiries.filter((e) => sourceLabel(e.data.source) === s).length }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0a2463]">Analytics</h1>
        <p className="mt-1 text-sm text-[#41506b]">Every number compares the last 30 days with the 30 days before.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const d = deltaPct(k.cur, k.prev);
          return (
            <div key={k.label} className="a-card a-tile p-5" style={{ ['--tile' as string]: k.color }}>
              <p className="text-[13px] text-[#41506b]">{k.label}</p>
              <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#14213d]">{k.fmt(k.cur)}</p>
              <p className="mt-1 text-[12px] text-[#6b7a93]">
                {d === null ? 'New this period' : `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`} · {k.fmt(k.prev)} the 30 days before
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="a-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#41506b]">Revenue (USD)</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">Last 12 months, by category</p>
          <StackedColumns labels={months.map((m) => monthLabel(m))} series={revenueByMonth(revenue, months)} format={(c) => usd(c)} caption="Revenue by month, last 12 months" />
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#41506b]">Enquiries</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">Last 12 months, by source</p>
          <StackedColumns labels={months.map((m) => monthLabel(m))} series={enquiriesByMonth(enquiries, months)} colors={[PALETTE[0], PALETTE[6], PALETTE[1]]} caption="Enquiries by month and source, last 12 months" />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#41506b]">Where enquiries come from</h2>
          <Donut items={sources} colors={[PALETTE[0], PALETTE[6], PALETTE[1]]} centerLabel="enquiries" caption="Enquiries by source" />
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#41506b]">What people ask for</h2>
          {services.length ? <HBars items={services} caption="Enquiries by service" /> : <p className="text-sm text-[#6b7a93]">No enquiries yet.</p>}
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#41506b]">Pipeline status</h2>
          <SegmentBar items={statusCounts(enquiries)} caption="Enquiries by status" />
        </section>
      </div>

      <section className="a-card p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold text-[#41506b]">Waitlist sign-ups</h2>
        <p className="mb-4 text-[12.5px] text-[#6b7a93]">
          Amey AI waitlist, last 12 months · {waitlist.filter((w) => monthOf(w.createdAt) === months[months.length - 1]).length} this month
        </p>
        <StackedColumns labels={months.map((m) => monthLabel(m))} series={[{ name: 'Sign-ups', values: waitlistByMonth(waitlist, months) }]} colors={[PALETTE[1]]} height={200} caption="Waitlist sign-ups by month" />
      </section>
    </div>
  );
}
