'use client';

import { useState } from 'react';
import { submitEnquiry } from '@/app/(site)/start/actions';
import { cn } from '@/lib/utils';

type Emp = { key: string; name: string; title: string };

const field = 'w-full rounded-sm border border-hair-strong bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-signal focus:bg-white/[0.06]';

/** Hire request: stored with the site's other enquiries (source "ai-workforce") so the team follows up. */
export function HireForm({ employees }: { employees: readonly Emp[] }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; message?: string; ref?: string; errors?: Record<string, string> }>({ status: 'idle' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const names = employees.filter((x) => chosen.includes(x.key)).map((x) => `${x.name} (${x.title})`);
    setState({ status: 'sending' });
    const res = await submitEnquiry({
      name: f.get('name'),
      company: f.get('company'),
      email: f.get('email'),
      phone: f.get('phone'),
      description: `AI WORKFORCE HIRE REQUEST\nEmployees: ${names.join(', ') || 'Not sure yet — please advise'}\n\n${String(f.get('needs') ?? '').trim()}`,
      service: 'automation',
      projectType: 'ai-employee',
      source: 'ai-workforce',
      website: f.get('website') ?? '',
    });
    if (res.ok) setState({ status: 'done', ref: res.reference });
    else setState({ status: 'error', message: res.error, errors: res.fieldErrors });
  }

  if (state.status === 'done') {
    return (
      <div className="rounded-sm border border-hair-strong bg-white/[0.03] p-8">
        <p className="t-label text-signal">Request received · {state.ref}</p>
        <h3 className="t-title mt-4 text-[1.6rem]">Thank you. We’ll be in touch shortly.</h3>
        <p className="mt-3 text-dim">A member of the Kesera team will contact you to start your free trial, connect your tools and get your first assignment going.</p>
      </div>
    );
  }

  const err = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset>
        <legend className="t-label mb-3 text-dim">Who would you like to hire?</legend>
        <div className="flex flex-wrap gap-2">
          {employees.map((x) => {
            const on = chosen.includes(x.key);
            return (
              <button
                key={x.key}
                type="button"
                aria-pressed={on}
                onClick={() => setChosen((c) => (on ? c.filter((k) => k !== x.key) : [...c, x.key]))}
                className={cn('rounded-full border px-4 py-2 text-sm transition', on ? 'border-signal bg-signal/15 text-white' : 'border-hair-strong text-dim hover:text-white')}
              >
                {x.name} <span className="text-white/45">· {x.title.replace('AI ', '')}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="t-label mb-2 block text-dim">Your name</span>
          <input name="name" required autoComplete="name" className={field} />
          {err.name && <span className="mt-1 block text-sm text-[#ff7b6e]">{err.name}</span>}
        </label>
        <label className="block">
          <span className="t-label mb-2 block text-dim">Business</span>
          <input name="company" autoComplete="organization" className={field} />
        </label>
        <label className="block">
          <span className="t-label mb-2 block text-dim">Email</span>
          <input name="email" type="email" required autoComplete="email" className={field} />
          {err.email && <span className="mt-1 block text-sm text-[#ff7b6e]">{err.email}</span>}
        </label>
        <label className="block">
          <span className="t-label mb-2 block text-dim">Phone / WhatsApp</span>
          <input name="phone" type="tel" autoComplete="tel" className={field} placeholder="+263 …" />
          {err.phone && <span className="mt-1 block text-sm text-[#ff7b6e]">{err.phone}</span>}
        </label>
      </div>
      <label className="block">
        <span className="t-label mb-2 block text-dim">What should your AI employee do?</span>
        <textarea name="needs" rows={4} required className={field} placeholder="e.g. Answer customer enquiries on email, keep our bookings spreadsheet up to date and prepare a weekly sales report." />
        {err.description && <span className="mt-1 block text-sm text-[#ff7b6e]">Please add a sentence or two about the work.</span>}
      </label>
      {/* Honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p className="text-sm text-[#ff7b6e]">{state.message}</p>}
      <button
        type="submit"
        disabled={state.status === 'sending'}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-signal px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-signal-soft disabled:opacity-60"
      >
        {state.status === 'sending' ? 'Sending…' : 'Request my free trial'}
      </button>
      <p className="text-sm text-faint">No payment and no card. We’ll set up your 30-day free trial with you.</p>
    </form>
  );
}
