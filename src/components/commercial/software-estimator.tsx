'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { estimate, formatUsd, type EstimatorConfig } from '@/lib/pricing';
import { Tween } from '@/components/system/motion';
import { cn } from '@/lib/utils';

// Custom software: priced by scope. Visitors configure it and see a live range.

type Kind = 'software' | 'webapp';

export function SoftwareEstimator({ config }: { config: EstimatorConfig }) {
  const [kind, setKind] = useState<Kind>('software');
  const svc = config.services[kind];
  const [type, setType] = useState(svc.types[0]!.id);
  const [users, setUsers] = useState(config.userTiers[0]!.id);
  const [features, setFeatures] = useState<string[]>(['admin', 'accounts', 'database']);

  const switchKind = (k: Kind) => {
    setKind(k);
    setType(config.services[k].types[0]!.id);
    setFeatures((f) => f.filter((id) => config.services[k].features.some((x) => x.id === id)));
  };

  const est = estimate(config, { service: kind, type, users, features, timeline: 'flexible' });
  const startHref = `/start?service=${kind}&type=${type}&users=${users}&features=${features.join(',')}`;
  const fmt = (n: number) => formatUsd(Math.round(n / 100) * 100);

  const chip = (on: boolean) =>
    cn('min-h-11 rounded-full border px-4 text-sm transition-colors', on ? 'border-white bg-white text-ink' : 'border-white/20 text-white/75 hover:border-white/50 hover:text-white');

  return (
    <div className="grid gap-10 rounded-[8px] bg-ink p-6 text-white md:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
      <div className="space-y-10 lg:col-span-7">
        <fieldset>
          <legend className="t-label text-white/50">Build</legend>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Build">
            {(['software', 'webapp'] as const).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => switchKind(k)} className={chip(kind === k)}>
                {config.services[k].label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-label text-white/50">What is it?</legend>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Type">
            {svc.types.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={type === t.id} onClick={() => setType(t.id)} className={chip(type === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-label text-white/50">Number of users</legend>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Number of users">
            {config.userTiers.map((u) => (
              <button key={u.id} type="button" role="radio" aria-checked={users === u.id} onClick={() => setUsers(u.id)} className={cn(chip(users === u.id), 'rounded-[6px]')}>
                {u.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-label text-white/50">Features</legend>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {svc.features.map((f) => {
              const on = features.includes(f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setFeatures((cur) => (on ? cur.filter((x) => x !== f.id) : [...cur, f.id]))}
                    className={cn('flex min-h-12 w-full items-center gap-3 rounded-[6px] border px-4 text-left text-sm transition-colors', on ? 'border-signal/70 bg-signal/10' : 'border-white/12 hover:border-white/35')}
                  >
                    <span className={cn('grid size-5 shrink-0 place-items-center rounded-[4px] border', on ? 'border-signal bg-signal' : 'border-white/30')}>
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{f.label}</span>
                    <span className="t-label text-white/45">+{formatUsd(f.cents)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      <div className="lg:col-span-5">
        <div className="flex h-full flex-col rounded-[6px] border border-white/12 p-6 lg:sticky lg:top-28 lg:h-auto lg:p-8" aria-live="polite">
          <p className="t-label text-white/50">Estimated range</p>
          <p className="t-display-m mt-5 text-[clamp(2rem,3.6vw,3.2rem)]">
            {est ? (
              <>
                <Tween value={est.lowCents} format={fmt} />
                <span className="block text-[0.5em] text-white/40">to <Tween value={est.highCents} format={fmt} /></span>
              </>
            ) : (
              '—'
            )}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-white/60">
            Custom software is priced by scope. This range assumes a flexible timeline; we confirm a fixed price after a short scoping call.
          </p>
          <Link href={startHref} className="group/cta mt-8 inline-flex min-h-12 items-center justify-between gap-6 rounded-[4px] bg-signal px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#3a98ff] [font-variation-settings:'wdth'_112]">
            Start this project
            <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
