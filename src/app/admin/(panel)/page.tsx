import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Bot, CircleDollarSign, Inbox, Sparkles, Target, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { getRevenueTarget, listEnquiries, listWaitlist } from '@/lib/db';
import { allRevenue } from '@/lib/revenue';
import { deltaPct, enquiriesByMonth, greeting, lastMonths, longDate, monthLabel, monthOf, revenueByMonth, statusCounts, targetProgress, todayYmd, usd } from '@/lib/admin-stats';
import { referenceFor } from '@/lib/enquiries';
import { PALETTE, SegmentBar, Sparkline, StackedColumns, TargetRing } from '@/components/admin/charts';

export const dynamic = 'force-dynamic';

const RANGES = [3, 6, 12] as const;

function Delta({ pct, goodWhenUp = true }: { pct: number | null; goodWhenUp?: boolean }) {
  if (pct === null) return <span className="a-chip bg-[#e8f8f1] text-[#0b7a55]">New</span>;
  if (pct === 0) return <span className="a-chip bg-[#eef2f8] text-[#6b7a93]">No change</span>;
  const up = pct > 0;
  const good = up === goodWhenUp;
  return (
    <span className={`a-chip ${good ? 'bg-[#e8f8f1] text-[#0b7a55]' : 'bg-[#fdecec] text-[#b42323]'}`}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireAdmin();
  const wanted = (await searchParams).range;
  const range = RANGES.find((r) => String(r) === wanted) ?? 6;
  const [enquiries, waitlist, { entries: revenue, pesepay }, target] = await Promise.all([listEnquiries(), listWaitlist(), allRevenue(), getRevenueTarget()]);

  const months = lastMonths(range);
  const months12 = lastMonths(12);
  const thisMonth = todayYmd().slice(0, 7);
  const lastMonth = lastMonths(2)[0];
  const revSeries = revenueByMonth(revenue, months);
  const rangeTotal = revSeries.reduce((s, x) => s + x.values.reduce((a, b) => a + b, 0), 0);
  const tp = targetProgress(revenue, target);

  const revMonth = (m: string) => revenue.filter((r) => r.receivedOn.slice(0, 7) === m).reduce((s, r) => s + r.amountCents, 0);
  const enqMonth = (m: string, src?: string) => enquiries.filter((e) => monthOf(e.createdAt) === m && (!src || e.data.source === src)).length;
  const wlMonth = (m: string) => waitlist.filter((w) => monthOf(w.createdAt) === m).length;
  const ai = enquiries.filter((e) => e.data.source === 'ai-workforce');
  const newOnes = enquiries.filter((e) => e.status === 'NEW');
  const won = enquiries.filter((e) => e.status === 'WON').length;
  const decided = enquiries.filter((e) => e.status === 'WON' || e.status === 'CLOSED').length;

  const tiles = [
    { label: 'Money in this month', value: usd(revMonth(thisMonth)), delta: deltaPct(revMonth(thisMonth), revMonth(lastMonth)), color: PALETTE[2], icon: CircleDollarSign, trend: months12.map(revMonth), sub: `${usd(revMonth(lastMonth))} last month`, href: '/admin/finance' },
    { label: 'Enquiries this month', value: String(enqMonth(thisMonth)), delta: deltaPct(enqMonth(thisMonth), enqMonth(lastMonth)), color: PALETTE[0], icon: Inbox, trend: months12.map((m) => enqMonth(m)), sub: `${enquiries.length} all time`, href: '/admin/enquiries' },
    { label: 'AI Workforce requests', value: String(ai.length), delta: deltaPct(enqMonth(thisMonth, 'ai-workforce'), enqMonth(lastMonth, 'ai-workforce')), color: PALETTE[6], icon: Bot, trend: months12.map((m) => enqMonth(m, 'ai-workforce')), sub: `${ai.filter((e) => e.status === 'NEW').length} waiting for a reply`, href: '/admin/enquiries?source=ai-workforce' },
    { label: 'Waitlist sign-ups', value: String(waitlist.length), delta: deltaPct(wlMonth(thisMonth), wlMonth(lastMonth)), color: PALETTE[1], icon: Users, trend: months12.map(wlMonth), sub: `${wlMonth(thisMonth)} this month`, href: '/admin/waitlist' },
  ];

  const attention = newOnes.length + (pesepay.configured && !pesepay.ok ? 1 : 0);
  const firstName = admin.name.split(' ')[0];

  return (
    <div className="space-y-6">
      <section className="a-card relative overflow-hidden p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.35),transparent_65%)]" />
        <div className="pointer-events-none absolute -bottom-28 right-40 size-64 rounded-full bg-[radial-gradient(circle,rgb(235_104_52/0.18),transparent_65%)]" />
        <p className="text-sm text-[#6b7a93]">{longDate()}</p>
        <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-[#0a2463] sm:text-[36px]">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[15px] text-[#41506b]">
          {attention ? (
            <>
              <b className="text-[#eb6834]">{attention}</b> {attention === 1 ? 'thing needs' : 'things need'} your attention
            </>
          ) : (
            'All caught up. Nothing is waiting for you.'
          )}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="a-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-[#41506b]">Revenue</h2>
              <p className="mt-1 text-[28px] font-extrabold tabular-nums text-[#14213d]">
                {usd(rangeTotal, 2)} <span className="text-sm font-medium text-[#6b7a93]">last {range} months</span>
              </p>
            </div>
            <nav aria-label="Range" className="flex gap-1 rounded-full bg-[#eef3fa] p-1">
              {RANGES.map((r) => (
                <Link key={r} href={`/admin?range=${r}`} aria-current={r === range ? 'page' : undefined} className="a-tab">
                  {r} months
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-4">
            <StackedColumns labels={months.map((m) => monthLabel(m))} series={revSeries} format={(c) => usd(c)} caption={`Revenue by month and category, last ${range} months`} />
          </div>
          {pesepay.configured && (
            <p className={`mt-3 text-[12.5px] ${pesepay.ok ? 'text-[#0b7a55]' : 'text-[#b42323]'}`}>
              {pesepay.ok ? `● Pesepay connected: ${pesepay.count} payment${pesepay.count === 1 ? '' : 's'} included automatically` : `● Pesepay feed not reachable: ${pesepay.error}`}
            </p>
          )}
        </section>

        <section className="a-card flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#41506b]">
              <Target className="size-4 text-[#eb6834]" /> Revenue target
            </h2>
            <span className={`a-chip ${tp.status === 'done' || tp.status === 'ahead' ? 'bg-[#e8f8f1] text-[#0b7a55]' : 'bg-[#fff2e8] text-[#b4501c]'}`}>
              {tp.status === 'done' ? 'Target reached' : tp.status === 'ahead' ? 'On pace' : tp.status === 'ended' ? 'Deadline passed' : 'Behind pace'}
            </span>
          </div>
          <div className="mt-3 flex flex-1 flex-wrap items-center justify-center gap-6">
            <TargetRing pct={tp.pct} value={`${Math.floor(tp.pct)}%`} sub={`of ${usd(tp.targetCents)}`} id="overview-ring" />
            <dl className="grid min-w-[180px] flex-1 grid-cols-2 gap-3 text-sm">
              <div className="col-span-2 rounded-2xl bg-gradient-to-br from-[#e8f8f1] to-[#eaf3ff] p-3">
                <dt className="text-[12px] text-[#41506b]">Made so far</dt>
                <dd className="text-[24px] font-extrabold tabular-nums text-[#0b7a55]">{usd(tp.earnedCents, 2)}</dd>
              </div>
              <div className="rounded-2xl bg-[#fff6ef] p-3">
                <dt className="text-[12px] text-[#41506b]">Still to go</dt>
                <dd className="font-bold tabular-nums text-[#14213d]">{usd(tp.remainingCents)}</dd>
              </div>
              <div className="rounded-2xl bg-[#f3f0ff] p-3">
                <dt className="text-[12px] text-[#41506b]">Days left</dt>
                <dd className="font-bold tabular-nums text-[#14213d]">{tp.daysLeft}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 rounded-2xl bg-[#f5f8fd] p-3 text-[13px] leading-relaxed text-[#41506b]">
            {tp.status === 'done' ? (
              <>Done! You passed {usd(tp.targetCents)} before {new Date(`${tp.deadline}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.</>
            ) : (
              <>
                To reach <b>{usd(tp.targetCents)}</b> by <b>{new Date(`${tp.deadline}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</b>, bring in about{' '}
                <b className="text-[#eb6834]">{usd(tp.perWeekNeededCents)} a week</b>.
              </>
            )}
          </p>
          <Link href="/admin/finance" className="a-btn mt-4 self-start">
            <Sparkles className="size-4" /> Record a payment
          </Link>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="a-card a-tile block p-5 transition hover:-translate-y-0.5" style={{ ['--tile' as string]: t.color }}>
            <div className="flex items-start justify-between">
              <span className="a-icon">
                <t.icon className="size-5" />
              </span>
              <Delta pct={t.delta} />
            </div>
            <p className="mt-4 text-[13px] text-[#41506b]">{t.label}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-[26px] font-extrabold tabular-nums text-[#14213d]">{t.value}</span>
              <Sparkline values={t.trend} color={t.color} />
            </div>
            <p className="mt-1 text-[12px] text-[#6b7a93]">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="a-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#41506b]">Enquiries by month</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">Where each request came from, last 6 months</p>
          <StackedColumns labels={lastMonths(6).map((m) => monthLabel(m))} series={enquiriesByMonth(enquiries, lastMonths(6))} colors={[PALETTE[0], PALETTE[6], PALETTE[1]]} caption="Enquiries by month and source" />
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#41506b]">Sales pipeline</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">
            {enquiries.length} enquiries · win rate {decided ? `${Math.round((won / decided) * 100)}%` : '–'}
          </p>
          <SegmentBar items={statusCounts(enquiries)} caption="Enquiries by status" />
          <h3 className="mb-2 mt-6 text-[13px] font-semibold text-[#41506b]">Needs a reply</h3>
          {newOnes.length ? (
            <ul className="divide-y divide-[#eef2f8]">
              {newOnes.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries?q=${encodeURIComponent(referenceFor(e.id))}`} className="flex items-center gap-3 py-2.5 hover:bg-[#f7faff]">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: e.data.source === 'ai-workforce' ? PALETTE[6] : e.data.source === 'project-builder' ? PALETTE[0] : PALETTE[1] }}>
                      {e.data.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#14213d]">{e.data.name}{e.data.company ? ` · ${e.data.company}` : ''}</span>
                      <span className="block truncate text-[12px] text-[#6b7a93]">{e.data.service}</span>
                    </span>
                    <span className="text-[11px] text-[#8a97ad]">{referenceFor(e.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-[#f5f8fd] p-4 text-sm text-[#6b7a93]">No new enquiries. Nice work.</p>
          )}
        </section>
      </div>
    </div>
  );
}
