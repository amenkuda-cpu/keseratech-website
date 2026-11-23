import { BadgeDollarSign, TrendingUp, Wallet, Zap } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { PAYMENT_METHODS, REVENUE_CATEGORIES, getRevenueTarget } from '@/lib/db';
import { allRevenue } from '@/lib/revenue';
import { countBy, lastMonths, monthLabel, revenueByMonth, targetProgress, todayYmd, usd } from '@/lib/admin-stats';
import { BLUES, Donut, HBars, PaceChart, StackedColumns, TargetRing } from '@/components/admin/charts';
import { AddPaymentForm, TargetForm } from '@/components/admin/finance-forms';
import { deleteRevenueAction } from '../../actions';

export const dynamic = 'force-dynamic';

const day = (ymd: string) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function FinancePage() {
  await requireAdmin();
  const [{ entries, pesepay }, target] = await Promise.all([allRevenue(), getRevenueTarget()]);
  const tp = targetProgress(entries, target);
  const months = lastMonths(12);
  const sum = (xs: typeof entries) => xs.reduce((s, r) => s + r.amountCents, 0);
  const byCategory = REVENUE_CATEGORIES.map((c) => ({ name: c, value: sum(entries.filter((e) => e.category === c)) }));
  const byMethod = countBy(entries, (e) => e.method).map((m) => ({ name: m.name, value: sum(entries.filter((e) => e.method === m.name)) })).sort((a, b) => b.value - a.value);
  const thisMonth = todayYmd().slice(0, 7);
  const pesepayTotal = sum(entries.filter((e) => e.method === 'Pesepay'));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0a2463]">Finance & target</h1>
        <p className="mt-1 text-sm text-[#41506b]">Money in, where it came from, and how close you are to the goal.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Revenue this month', value: usd(sum(entries.filter((e) => e.receivedOn.startsWith(thisMonth))), 2), icon: Wallet },
          { label: `Made in ${tp.start.slice(0, 4)}`, value: usd(tp.earnedCents, 2), icon: TrendingUp },
          { label: 'Through Pesepay', value: usd(pesepayTotal, 2), icon: Zap },
        ].map((t) => (
          <div key={t.label} className="a-card a-tile p-5">
            <span className="a-icon">
              <t.icon className="size-5" />
            </span>
            <p className="mt-4 text-[13px] text-[#41506b]">{t.label}</p>
            <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#14213d]">{t.value}</p>
          </div>
        ))}
      </div>

      <section className="a-card overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-3">
            <TargetRing pct={tp.pct} value={usd(tp.earnedCents)} sub={`of ${usd(tp.targetCents)} goal`} size={200} id="finance-ring" />
            <span className={`a-chip ${tp.status === 'done' || tp.status === 'ahead' ? 'bg-[#e8f8f1] text-[#0b7a55]' : 'bg-[#fff2e8] text-[#b4501c]'}`}>
              {tp.status === 'done' ? 'Target reached 🎉' : tp.status === 'ahead' ? 'On pace' : tp.status === 'ended' ? 'Deadline passed' : `${usd(Math.max(0, tp.onPaceCents - tp.earnedCents))} behind pace`}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#41506b]">
              <BadgeDollarSign className="size-4 text-[#1c5cab]" /> {usd(tp.targetCents)} by {day(tp.deadline)}
            </h2>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#dbe8fb]">
              <div className="bar-grow h-full rounded-full bg-gradient-to-r from-[#2a78d6] via-[#22b8e6] to-[#1baf7a]" style={{ width: `${Math.max(tp.pct > 0 ? 2 : 0, tp.pct)}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-[12.5px] text-[#41506b]">
              <span>
                <b className="text-[#14213d]">{tp.pct.toFixed(1)}%</b> done · {usd(tp.remainingCents)} to go
              </span>
              <span>
                {tp.daysLeft} days left · about <b className="text-[#eb6834]">{usd(tp.perWeekNeededCents)}/week</b> needed
              </span>
            </div>
            <div className="mt-4">
              <PaceChart points={tp.cumulative.map((c) => ({ label: monthLabel(c.month), cents: c.cents }))} targetCents={tp.targetCents} format={(c) => usd(c)} caption="Running revenue total against the target" />
            </div>
          </div>
        </div>
        <div className="border-t border-[#eef2f8] bg-[#f7faff] px-5 py-4 sm:px-6">
          <TargetForm amount={tp.targetCents / 100} deadline={tp.deadline} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="a-card p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#41506b]">Money in by month</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">Last 12 months, by what it was for</p>
          <StackedColumns labels={months.map((m) => monthLabel(m))} series={revenueByMonth(entries, months)} format={(c) => usd(c)} caption="Revenue by month and category, last 12 months" />
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-1 text-[15px] font-semibold text-[#41506b]">Record a payment</h2>
          <p className="mb-4 text-[12.5px] text-[#6b7a93]">
            Pesepay payments made through the Workforce app appear automatically. Add anything else here: EcoCash, cash, bank transfers, or Pesepay payment links.
          </p>
          <AddPaymentForm today={todayYmd()} categories={REVENUE_CATEGORIES} methods={PAYMENT_METHODS} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#41506b]">What earned the money</h2>
          <Donut items={byCategory} centerLabel="all time" format={(c) => usd(c)} caption="Revenue by category, all time" />
        </section>
        <section className="a-card p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-[#41506b]">How clients paid</h2>
          {byMethod.length ? <HBars items={byMethod} format={(c) => usd(c)} caption="Revenue by payment method" /> : <p className="text-sm text-[#6b7a93]">No payments yet.</p>}
        </section>
      </div>

      <section className="a-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-[#41506b]">All payments</h2>
          <span className={`text-[12.5px] ${!pesepay.configured ? 'text-[#6b7a93]' : pesepay.ok ? 'text-[#0b7a55]' : 'text-[#b42323]'}`}>
            {!pesepay.configured ? 'Pesepay feed not connected yet' : pesepay.ok ? `● Pesepay live · ${pesepay.count} automatic` : `● Pesepay feed error: ${pesepay.error}`}
          </span>
        </div>
        {entries.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#e3e9f3] text-[12px] uppercase tracking-wider text-[#6b7a93]">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="py-2 pr-3 font-semibold">Client</th>
                  <th className="py-2 pr-3 font-semibold">For</th>
                  <th className="py-2 pr-3 font-semibold">Paid by</th>
                  <th className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-[#eef2f8] last:border-0">
                    <td className="py-2.5 pr-3 text-[#41506b]">{day(e.receivedOn)}</td>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold text-[#14213d]">{e.client}</span>
                      {e.note && <span className="block text-[12px] text-[#6b7a93]">{e.note}</span>}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="inline-flex items-center gap-1.5 text-[#41506b]">
                        <span className="size-2.5 rounded-[3px]" style={{ background: BLUES[Math.max(0, (REVENUE_CATEGORIES as readonly string[]).indexOf(e.category))] }} aria-hidden />
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`a-chip ${e.method === 'Pesepay' ? 'bg-[#f0edff] text-[#4b3bb8]' : 'bg-[#eef3fa] text-[#41506b]'}`}>{e.method}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-[#14213d]">{usd(e.amountCents, 2)}</td>
                    <td className="py-2.5 text-right">
                      {e.id > 0 ? (
                        <form action={deleteRevenueAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button className="text-[12px] text-[#8a97ad] hover:text-[#b42323]">Remove</button>
                        </form>
                      ) : (
                        <span className="text-[11px] text-[#8a97ad]">automatic</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#f5f8fd] p-5 text-sm text-[#6b7a93]">No payments recorded yet. Record your first one above and the target ring starts moving.</p>
        )}
      </section>
    </div>
  );
}
