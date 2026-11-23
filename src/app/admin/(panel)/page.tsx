import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bot, CircleDollarSign, Inbox, Plus, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { getRevenueTarget, listEnquiries, listWaitlist } from '@/lib/db';
import { allRevenue } from '@/lib/revenue';
import { workforceOverview, employeeState } from '@/lib/workforce-feed';
import { deltaPct, greeting, lastMonths, longDate, monthLabel, monthOf, statusCounts, targetProgress, todayYmd, usd } from '@/lib/admin-stats';
import { referenceFor } from '@/lib/enquiries';
import { SegmentBar, Sparkline, StackedColumns, TargetRing } from '@/components/admin/charts';
import { MessageButtons } from '@/components/admin/message-buttons';

export const dynamic = 'force-dynamic';

const RANGES = [3, 6, 12] as const;

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="a-chip bg-[#eef4fd] text-[#1c5cab]">New</span>;
  if (pct === 0) return <span className="a-chip bg-[#f1f4f8] text-[#6b7a93]">Flat</span>;
  const up = pct > 0;
  return (
    <span className={`a-chip ${up ? 'bg-[#ecf8f2] text-[#0b7a55]' : 'bg-[#fdf0f0] text-[#b42323]'}`}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

const TONE: Record<string, string> = { good: 'bg-[#ecf8f2] text-[#0b7a55]', trial: 'bg-[#eef4fd] text-[#1c5cab]', wait: 'bg-[#fff6e8] text-[#8a5a00]', off: 'bg-[#f1f4f8] text-[#6b7a93]' };

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const admin = await requireAdmin();
  const wanted = (await searchParams).range;
  const range = RANGES.find((r) => String(r) === wanted) ?? 6;
  const [enquiries, waitlist, { entries: revenue }, target, wf] = await Promise.all([listEnquiries(), listWaitlist(), allRevenue(), getRevenueTarget(), workforceOverview()]);

  const months = lastMonths(range);
  const months12 = lastMonths(12);
  const thisMonth = todayYmd().slice(0, 7);
  const lastMonth = lastMonths(2)[0];
  const revMonth = (m: string) => revenue.filter((r) => r.receivedOn.slice(0, 7) === m).reduce((s, r) => s + r.amountCents, 0);
  const enqMonth = (m: string) => enquiries.filter((e) => monthOf(e.createdAt) === m).length;
  const wlMonth = (m: string) => waitlist.filter((w) => monthOf(w.createdAt) === m).length;
  const revTotals = months.map(revMonth);
  const rangeTotal = revTotals.reduce((a, b) => a + b, 0);
  const tp = targetProgress(revenue, target);
  const newOnes = enquiries.filter((e) => e.status === 'NEW');
  const hireNew = newOnes.filter((e) => e.data.source === 'ai-workforce').length;
  const won = enquiries.filter((e) => e.status === 'WON').length;
  const decided = enquiries.filter((e) => e.status === 'WON' || e.status === 'CLOSED').length;
  const wfData = wf.ok ? wf.data : null;
  const firstName = admin.name.split(' ')[0];

  const tiles = [
    { label: 'Money in this month', value: usd(revMonth(thisMonth)), delta: deltaPct(revMonth(thisMonth), revMonth(lastMonth)), icon: CircleDollarSign, trend: months12.map(revMonth), sub: `${usd(revMonth(lastMonth))} last month`, href: '/admin/finance' },
    { label: 'Enquiries this month', value: String(enqMonth(thisMonth)), delta: deltaPct(enqMonth(thisMonth), enqMonth(lastMonth)), icon: Inbox, trend: months12.map(enqMonth), sub: `${enquiries.length} all time`, href: '/admin/enquiries' },
    { label: 'AI employees working', value: wfData ? String(wfData.totals.activeEmployees) : '–', delta: null as number | null, hideDelta: true, icon: Bot, trend: [] as number[], sub: wfData ? `${wfData.totals.customers} businesses · ${wfData.totals.trials} on trial` : 'Workforce app not connected', href: '/admin/workforce' },
    { label: 'Waitlist sign-ups', value: String(waitlist.length), delta: deltaPct(wlMonth(thisMonth), wlMonth(lastMonth)), icon: Users, trend: months12.map(wlMonth), sub: `${wlMonth(thisMonth)} this month`, href: '/admin/waitlist' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <section className="a-card a-hero relative overflow-hidden p-6 sm:p-8">
          <p className="text-[13px] text-[#fff]/60">{longDate()}</p>
          <h1 className="mt-1 text-[30px] font-extrabold tracking-tight sm:text-[38px]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-[#fff]/75">
            {newOnes.length ? (
              <>
                {newOnes.length} {newOnes.length === 1 ? 'enquiry is' : 'enquiries are'} waiting for a reply{hireNew ? `, ${hireNew} of them for AI employees` : ''}.
              </>
            ) : (
              'All caught up. Nothing is waiting for you.'
            )}
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              ['Made this year', usd(tp.earnedCents)],
              ['AI customers', wfData ? String(wfData.totals.customers) : '–'],
              ['Win rate', decided ? `${Math.round((won / decided) * 100)}%` : '–'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fff]/45">{k}</dt>
                <dd className="mt-1 text-[22px] font-bold tabular-nums sm:text-[26px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="a-card flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="a-kicker">Revenue target</p>
            <span className={`a-chip ${tp.status === 'done' || tp.status === 'ahead' ? 'bg-[#ecf8f2] text-[#0b7a55]' : 'bg-[#fff6e8] text-[#8a5a00]'}`}>
              {tp.status === 'done' ? 'Reached' : tp.status === 'ahead' ? 'On pace' : tp.status === 'ended' ? 'Deadline passed' : 'Behind pace'}
            </span>
          </div>
          <div className="mt-2 flex flex-1 items-center gap-5">
            <TargetRing pct={tp.pct} value={usd(tp.earnedCents)} sub={`of ${usd(tp.targetCents)}`} size={150} id="ov-ring" />
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[12px] text-[#6b7a93]">Still to go</dt>
                <dd className="text-[20px] font-bold tabular-nums text-[#0a2558]">{usd(tp.remainingCents)}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#6b7a93]">Needed each week</dt>
                <dd className="font-semibold tabular-nums text-[#0a2558]">{usd(tp.perWeekNeededCents)}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#6b7a93]">Days left</dt>
                <dd className="font-semibold tabular-nums text-[#0a2558]">{tp.daysLeft}</dd>
              </div>
            </dl>
          </div>
          <Link href="/admin/finance" className="a-btn mt-4 self-start">
            <Plus className="size-4" /> Record a payment
          </Link>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="a-card a-tile block p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-28px_rgb(13_54_107/0.45)]">
            <div className="flex items-start justify-between">
              <span className="a-icon">
                <t.icon className="size-[18px]" />
              </span>
              {!('hideDelta' in t) && <Delta pct={t.delta} />}
            </div>
            <p className="mt-4 text-[13px] text-[#6b7a93]">{t.label}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-[26px] font-extrabold tabular-nums tracking-tight text-[#0a2558]">{t.value}</span>
              {t.trend.length > 0 && <Sparkline values={t.trend} />}
            </div>
            <p className="mt-1 text-[12px] text-[#8a97ad]">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="a-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="a-kicker">Revenue</p>
              <p className="mt-1 text-[28px] font-extrabold tabular-nums tracking-tight text-[#0a2558]">
                {usd(rangeTotal, 2)} <span className="text-sm font-medium text-[#8a97ad]">last {range} months</span>
              </p>
            </div>
            <nav aria-label="Range" className="flex gap-1 rounded-full bg-[#f1f4f9] p-1">
              {RANGES.map((r) => (
                <Link key={r} href={`/admin?range=${r}`} aria-current={r === range ? 'page' : undefined} className="a-tab">
                  {r}M
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-4">
            <StackedColumns labels={months.map((m) => monthLabel(m))} series={[{ name: 'Revenue', values: revTotals }]} format={(c) => usd(c)} caption={`Revenue by month, last ${range} months`} gid="ov-rev" />
          </div>
        </section>

        <section className="a-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="a-kicker">AI Workforce</p>
            <Link href="/admin/customers" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1c5cab] hover:underline">
              All customers <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {wfData ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  ['Businesses', wfData.totals.customers],
                  ['Hired', wfData.totals.employees],
                  ['Tasks (30 d)', wfData.totals.tasks30d],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-[#f5f8fc] p-3">
                    <p className="text-[11.5px] text-[#6b7a93]">{k}</p>
                    <p className="text-[20px] font-bold tabular-nums text-[#0a2558]">{v}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-4 divide-y divide-[#eef2f7]">
                {wfData.customers.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eef4fd] text-[13px] font-bold text-[#1c5cab]">{c.name.charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#14213d]">{c.name}</span>
                      <span className="block truncate text-[12px] text-[#8a97ad]">{c.employees.map((e) => e.name).join(', ') || 'No employee yet'}</span>
                    </span>
                    {c.employees[0] && <span className={`a-chip ${TONE[employeeState(c.employees[0]).tone]}`}>{employeeState(c.employees[0]).label}</span>}
                  </li>
                ))}
                {!wfData.customers.length && <li className="py-4 text-sm text-[#8a97ad]">No businesses have signed up yet.</li>}
              </ul>
            </>
          ) : (
            <p className="mt-4 rounded-2xl bg-[#f5f8fc] p-4 text-sm text-[#6b7a93]">{wf.ok ? '' : wf.error}</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="a-card p-5 sm:p-6">
          <p className="a-kicker">Sales pipeline</p>
          <p className="mb-4 mt-1 text-[13px] text-[#6b7a93]">{enquiries.length} enquiries, from first contact to won or closed</p>
          <SegmentBar items={statusCounts(enquiries)} caption="Enquiries by status" />
          <div className="mt-6">
            <p className="a-kicker">Enquiries per month</p>
            <div className="mt-2">
              <StackedColumns labels={lastMonths(6).map((m) => monthLabel(m))} series={[{ name: 'Enquiries', values: lastMonths(6).map(enqMonth) }]} height={180} caption="Enquiries per month, last 6 months" gid="ov-enq" />
            </div>
          </div>
        </section>
        <section className="a-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="a-kicker">Waiting for a reply</p>
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1c5cab] hover:underline">
              All enquiries <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {newOnes.length ? (
            <ul className="mt-3 divide-y divide-[#eef2f7]">
              {newOnes.slice(0, 6).map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0a2558] text-[12px] font-bold text-[#fff]">{e.data.name.charAt(0).toUpperCase()}</span>
                  <Link href={`/admin/enquiries?q=${encodeURIComponent(referenceFor(e.id))}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#14213d]">
                      {e.data.name}
                      {e.data.company ? ` · ${e.data.company}` : ''}
                    </span>
                    <span className="block truncate text-[12px] text-[#8a97ad]">
                      {e.data.source === 'ai-workforce' ? 'AI employee request' : e.data.service} · {referenceFor(e.id)}
                    </span>
                  </Link>
                  <MessageButtons email={e.data.email} phone={e.data.phone} name={e.data.name} subject={`Your enquiry with Kesera Technologies (${referenceFor(e.id)})`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl bg-[#f5f8fc] p-4 text-sm text-[#6b7a93]">No new enquiries. Nice work.</p>
          )}
        </section>
      </div>
    </div>
  );
}
