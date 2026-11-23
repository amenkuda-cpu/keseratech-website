import { ExternalLink } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { usd } from '@/lib/admin-stats';
import { employeeState, workforceOverview } from '@/lib/workforce-feed';
import { MessageButtons } from '@/components/admin/message-buttons';
import { workforceEmployeeActionForm } from '../../actions';

export const dynamic = 'force-dynamic';

const TONE: Record<string, string> = { good: 'bg-[#ecf8f2] text-[#0b7a55]', trial: 'bg-[#eef4fd] text-[#1c5cab]', wait: 'bg-[#fff6e8] text-[#8a5a00]', off: 'bg-[#f1f4f8] text-[#6b7a93]' };
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Harare' }) : '–');

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; done?: string; error?: string }> }) {
  await requireAdmin();
  const { q = '', done, error } = await searchParams;
  const wf = await workforceOverview();
  const needle = q.trim().toLowerCase();
  const customers = wf.ok ? wf.data.customers.filter((c) => !needle || [c.name, c.owner?.name, c.owner?.email, c.industry].some((v) => v?.toLowerCase().includes(needle))) : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="a-kicker">AI Workforce</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[#0a2558]">Customers</h1>
          <p className="mt-1 text-sm text-[#6b7a93]">Every business that signed up on workforce.keseratech.com, who they hired, and what they have paid.</p>
        </div>
        <form className="w-full max-w-xs">
          <input name="q" defaultValue={q} placeholder="Search businesses or people…" aria-label="Search customers" className="a-input" />
        </form>
      </header>

      {done && <p role="status" className="rounded-2xl border border-[#cdeedd] bg-[#ecf8f2] px-4 py-3 text-sm font-medium text-[#0b7a55]">{done}</p>}
      {error && <p role="alert" className="rounded-2xl border border-[#f5cccc] bg-[#fdf0f0] px-4 py-3 text-sm font-medium text-[#b42323]">{error}</p>}
      {!wf.ok ? (
        <p className="a-card p-6 text-sm text-[#b42323]">{wf.error}</p>
      ) : customers.length === 0 ? (
        <p className="a-card p-6 text-sm text-[#6b7a93]">{needle ? 'No customer matches that search.' : 'No businesses have signed up yet.'}</p>
      ) : (
        <div className="a-card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[#eef2f7] text-[11.5px] uppercase tracking-[0.1em] text-[#8a97ad]">
              <tr>
                <th className="px-5 py-3 font-semibold">Business</th>
                <th className="px-5 py-3 font-semibold">AI employees</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">Paid</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-[#f1f4f8] align-top last:border-0 hover:bg-[#fafcff]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#14213d]">{c.name}</p>
                    <p className="text-[12.5px] text-[#6b7a93]">{c.owner ? `${c.owner.name} · ${c.owner.email}` : '–'}</p>
                    {c.industry && <p className="text-[12px] text-[#8a97ad]">{c.industry}</p>}
                  </td>
                  <td className="px-5 py-4">
                    {c.employees.length ? (
                      <ul className="space-y-1.5">
                        {c.employees.map((e) => {
                          const st = employeeState(e);
                          return (
                            <li key={e.id} className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-[#14213d]">{e.name}</span>
                              <span className={`a-chip ${TONE[st.tone]}`}>{st.label}</span>
                              {e.subscription?.periodEnd && <span className="text-[11.5px] text-[#8a97ad]">until {day(e.subscription.periodEnd)}</span>}
                              <span className="text-[11.5px] text-[#8a97ad]">{e.tasks} tasks</span>
                              <EmployeeControls id={e.id} status={e.status} tone={st.tone} />
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-[#8a97ad]">Signed up, no employee yet</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#41506b]">
                    {day(c.createdAt)}
                    {c.owner?.lastLoginAt && <p className="text-[11.5px] text-[#8a97ad]">last seen {day(c.owner.lastLoginAt)}</p>}
                  </td>
                  <td className="px-5 py-4 text-right font-bold tabular-nums text-[#0a2558]">{usd(c.paidCents, 2)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {c.owner && <MessageButtons email={c.owner.email} name={c.owner.name} subject="Your Kesera AI employee" />}
                      <a href={c.adminUrl} target="_blank" rel="noreferrer" className="a-btn-ghost">
                        <ExternalLink className="size-3.5" /> Manage
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Free month for anyone not yet paid/active; pause or resume for working employees. */
function EmployeeControls({ id, status, tone }: { id: string; status: string; tone: string }) {
  const btn = 'rounded-full border border-[#dbe4f1] bg-white px-2.5 py-0.5 text-[11.5px] font-semibold text-[#1c3b6e] hover:border-[#b8cbe6] hover:bg-[#f6f9fe]';
  return (
    <span className="inline-flex gap-1">
      {status !== 'suspended' && tone !== 'good' && (
        <form action={workforceEmployeeActionForm}>
          <input type="hidden" name="employeeId" value={id} />
          <input type="hidden" name="action" value="comp" />
          <input type="hidden" name="months" value="1" />
          <button className={btn} title="Switch this employee on for a free month">Activate free (1 month)</button>
        </form>
      )}
      {status === 'suspended' ? (
        <form action={workforceEmployeeActionForm}>
          <input type="hidden" name="employeeId" value={id} />
          <input type="hidden" name="action" value="resume" />
          <button className={btn}>Resume</button>
        </form>
      ) : (
        status === 'active' && (
          <form action={workforceEmployeeActionForm}>
            <input type="hidden" name="employeeId" value={id} />
            <input type="hidden" name="action" value="suspend" />
            <button className={btn}>Pause</button>
          </form>
        )
      )}
    </span>
  );
}
