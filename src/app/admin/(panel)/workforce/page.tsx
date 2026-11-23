import Link from 'next/link';
import { ArrowRight, Bot, Building2, CircleCheck, Clock, ExternalLink, UserPlus } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { listEnquiries } from '@/lib/db';
import { workforceOverview } from '@/lib/workforce-feed';
import { referenceFor } from '@/lib/enquiries';
import { MessageButtons } from '@/components/admin/message-buttons';

export const dynamic = 'force-dynamic';

export default async function WorkforcePage() {
  await requireAdmin();
  const [wf, enquiries] = await Promise.all([workforceOverview(), listEnquiries()]);
  const requests = enquiries.filter((e) => e.data.source === 'ai-workforce');
  const open = requests.filter((e) => e.status === 'NEW' || e.status === 'CONTACTED');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="a-kicker">AI Workforce</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[#0a2558]">AI employees</h1>
          <p className="mt-1 text-sm text-[#6b7a93]">Your six employees, who has hired them, and the requests still coming in.</p>
        </div>
        <a href="https://workforce.keseratech.com/admin" target="_blank" rel="noreferrer" className="a-btn-ghost">
          <ExternalLink className="size-3.5" /> Open the Workforce app admin
        </a>
      </header>

      {!wf.ok ? (
        <p className="a-card p-6 text-sm text-[#b42323]">{wf.error}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Businesses signed up', value: wf.data.totals.customers, icon: Building2 },
              { label: 'Employees hired', value: wf.data.totals.employees, icon: Bot },
              { label: 'Working now', value: wf.data.totals.activeEmployees, icon: CircleCheck, sub: `${wf.data.totals.trials} on free trial` },
              { label: 'Tasks in 30 days', value: wf.data.totals.tasks30d, icon: Clock, sub: `${wf.data.totals.tasksDone} finished all time` },
            ].map((t) => (
              <div key={t.label} className="a-card p-5">
                <span className="a-icon">
                  <t.icon className="size-[18px]" />
                </span>
                <p className="mt-4 text-[13px] text-[#6b7a93]">{t.label}</p>
                <p className="mt-1 text-[26px] font-extrabold tabular-nums text-[#0a2558]">{t.value}</p>
                {t.sub && <p className="text-[12px] text-[#8a97ad]">{t.sub}</p>}
              </div>
            ))}
          </div>

          <section>
            <h2 className="mb-3 text-[15px] font-semibold text-[#41506b]">The team</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {wf.data.roles.map((r) => (
                <article key={r.key} className="a-card overflow-hidden">
                  <div className="flex items-center gap-4 bg-gradient-to-br from-[#06163a] to-[#123f8a] p-5 text-[#fff]">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt="" width={64} height={64} className="size-16 rounded-2xl object-cover ring-2 ring-white/20" />
                    ) : (
                      <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-2xl font-bold">{r.name.charAt(0)}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-lg font-bold">{r.name}</p>
                      <p className="truncate text-[13px] text-[#fff]/65">{r.title}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-2 text-[12.5px] leading-relaxed text-[#6b7a93]">{r.summary}</p>
                    <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                      {[
                        ['Hired', r.hired],
                        ['Working', r.active],
                        ['Trial', r.onTrial],
                        ['Tasks', r.tasks],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl bg-[#f5f8fc] py-2">
                          <dd className="text-[17px] font-bold tabular-nums text-[#0a2558]">{v}</dd>
                          <dt className="text-[11px] text-[#8a97ad]">{k}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="a-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="a-kicker">Hire requests</p>
            <p className="mt-1 text-sm text-[#6b7a93]">
              From the “Hire an AI employee” form on keseratech.com · {open.length} still open of {requests.length}
            </p>
          </div>
          <Link href="/admin/hire-requests" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1c5cab] hover:underline">
            Manage requests <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {requests.length ? (
          <ul className="mt-3 divide-y divide-[#eef2f7]">
            {requests.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef4fd] text-[#1c5cab]">
                  <UserPlus className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#14213d]">
                    {e.data.name}
                    {e.data.company ? ` · ${e.data.company}` : ''}
                  </span>
                  <span className="block truncate text-[12px] text-[#8a97ad]">
                    {e.data.description.slice(0, 90)} · {referenceFor(e.id)} · {e.status.charAt(0) + e.status.slice(1).toLowerCase()}
                  </span>
                </span>
                <MessageButtons email={e.data.email} phone={e.data.phone} name={e.data.name} subject="Your AI employee from Kesera Technologies" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#f5f8fc] p-4 text-sm text-[#6b7a93]">No hire requests yet.</p>
        )}
      </section>
    </div>
  );
}
