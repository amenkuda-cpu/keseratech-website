import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { Check, ShieldCheck, X } from 'lucide-react';
import { HireForm } from '@/components/workforce/hire-form';
import { Label } from '@/components/system/primitives';
import { WORKFORCE, WORKFORCE_PRICE_USD } from '@/content/workforce';

export const metadata: Metadata = {
  title: 'AI Workforce — Hire AI Employees in Zimbabwe',
  description:
    'Hire an AI executive assistant, sales executive, marketing manager, customer support representative, research analyst or finance administrator from Kesera Technologies. USD 200 per employee per month.',
  alternates: { canonical: '/ai-workforce' },
};

const photo = (key: string) => (existsSync(path.join(process.cwd(), 'public', 'workforce', `${key}.webp`)) ? `/workforce/${key}.webp` : null);

const STEPS = [
  { t: 'Choose your employee', b: 'Pick a specialist, or tell us the job and we’ll design one for you.' },
  { t: 'A short conversation', b: 'Your employee asks a few questions about your business. No forms, no technical setup.' },
  { t: 'Connect your tools', b: 'Optional: Gmail, Outlook, Google Calendar, Drive or Sheets, through official sign-in. We never ask for passwords.' },
  { t: 'Give it real work', b: 'Type or speak a request. It becomes a task you can follow stage by stage, with finished, checked files at the end.' },
];

export default function AiWorkforcePage() {
  return (
    <div className="pt-[68px]">
      <section className="shell pb-16 pt-14 md:pb-24 md:pt-20" aria-labelledby="aiw-title">
        <p className="t-label text-dim">Kesera AI Workforce</p>
        <h1 id="aiw-title" className="t-display-l mt-6 max-w-[16ch]">
          AI employees that get <em>real work</em> done.
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-white/80">
          Hire specialised AI employees for admin, sales, marketing, customer support, research and finance. Talk to them like a colleague. They plan the work, use your business tools, check their
          results and hand you finished files.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#hire" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-signal px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white hover:bg-signal-soft">
            Hire an AI employee
          </a>
          <a href="#team" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-hair-strong px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white hover:border-white/50">
            Meet the team
          </a>
        </div>
        <p className="mt-6 text-sm text-faint">USD {WORKFORCE_PRICE_USD} per employee per month · EcoCash, InnBucks, Zimswitch, Visa and Mastercard</p>
      </section>

      <section id="team" className="shell scroll-mt-24 pb-20 md:pb-32" aria-labelledby="team-title">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Label index="01">The team</Label>
            <h2 id="team-title" className="t-display-m mt-5">Six specialists</h2>
          </div>
          <p className="max-w-sm text-sm text-dim">Each has its own job description, working method and quality checks. They are AI, and they always say so.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-sm border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-3">
          {WORKFORCE.map((e) => {
            const p = photo(e.key);
            return (
              <article key={e.key} className="flex flex-col bg-void p-7">
                <div className="flex items-center gap-4">
                  {p ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p} alt={`${e.name}, ${e.title} (AI)`} width={64} height={64} loading="lazy" className="size-16 rounded-full object-cover" style={{ boxShadow: `0 0 0 2px ${e.accent}55` }} />
                  ) : (
                    <span aria-hidden className="grid size-16 place-items-center rounded-full text-2xl font-semibold text-white" style={{ background: `linear-gradient(145deg, ${e.accent}, #0a1020)` }}>
                      {e.name[0]}
                    </span>
                  )}
                  <div>
                    <h3 className="t-title text-[1.45rem]">{e.name}</h3>
                    <p className="text-sm text-dim">{e.title}</p>
                  </div>
                </div>
                <p className="mt-5 text-[15px] text-white/85">{e.tagline}</p>
                <ul className="mt-5 space-y-2 text-sm text-dim">
                  {e.does.map((d) => (
                    <li key={d} className="flex gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-signal" /> {d}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell pb-20 md:pb-32" aria-labelledby="how-title">
        <Label index="02">How it works</Label>
        <h2 id="how-title" className="t-display-m mt-5">Like hiring a remote employee</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-sm border border-hair bg-hair md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.t} className="bg-void p-7">
              <span className="t-label text-signal">0{i + 1}</span>
              <h3 className="t-title mt-3 text-[1.2rem]">{s.t}</h3>
              <p className="mt-2 text-sm text-dim">{s.b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="flex gap-3 text-[15px] text-white/80">
            <ShieldCheck className="mt-0.5 shrink-0 text-signal" size={20} /> They ask your approval before sending emails or acting on your behalf, and one button pauses your whole workforce.
          </div>
          <div className="flex gap-3 text-[15px] text-white/80">
            <X className="mt-0.5 shrink-0 text-[#ff7b6e]" size={20} /> They never make payments, transfers or refunds, never sign anything and never ask for your passwords.
          </div>
        </div>
      </section>

      <section id="hire" className="shell scroll-mt-24 pb-24 md:pb-36" aria-labelledby="hire-title">
        <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
          <div>
            <Label index="03">Hire</Label>
            <h2 id="hire-title" className="t-display-m mt-5">One simple price</h2>
            <p className="mt-6 font-display text-[3.4rem] leading-none">
              ${WORKFORCE_PRICE_USD}
              <span className="ml-2 font-sans text-base text-dim">per employee / month</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-dim">
              <li>Up to 300 assignments a month</li>
              <li>Cloud-computer time for website tasks</li>
              <li>Company knowledge, training and memory</li>
              <li>Independent quality checks on deliverables</li>
              <li>Cancel any time; your files stay yours</li>
            </ul>
          </div>
          <div className="rounded-sm border border-hair bg-white/[0.02] p-6 sm:p-8">
            <HireForm employees={WORKFORCE} />
          </div>
        </div>
      </section>
    </div>
  );
}
