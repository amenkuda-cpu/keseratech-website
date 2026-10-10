import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { planPriceLabel, type Plan } from '@/lib/pricing';
import { cn } from '@/lib/utils';

// Spec-sheet price comparison for the paper (light) chapter. The highlighted plan is set in ink.

export function PlanTable({ plans, service }: { plans: Plan[]; service: 'website' | 'app' }) {
  return (
    <div
      className={cn(
        'grid gap-3 md:gap-0 md:border-y md:border-ink/15',
        plans.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3',
      )}
    >
      {plans.map((plan) => {
        const hi = !!plan.highlight;
        const price = planPriceLabel(plan);
        return (
          <article
            key={plan.id}
            aria-labelledby={`plan-${plan.id}`}
            className={cn(
              'relative flex flex-col rounded-[6px] p-6 md:rounded-none md:p-8 lg:p-10',
              hi ? 'bg-ink text-white md:-my-4 md:rounded-[6px] md:py-12 lg:py-14' : 'border border-ink/15 md:border-0 md:border-r md:last:border-r-0',
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 id={`plan-${plan.id}`} className="t-label">{plan.name}</h3>
              {plan.highlight && (
                <span className="t-label rounded-sm bg-signal px-2 py-1 text-[0.62rem] text-white">{plan.highlight}</span>
              )}
            </div>

            <p className="mt-8 flex items-baseline gap-2">
              {price.prefix && <span className={cn('t-label', hi ? 'text-white/60' : 'text-ink/55')}>{price.prefix}</span>}
              <span className="t-display-m text-[clamp(2.4rem,4vw,3.6rem)] tabular-nums">
                {price.amount}
                {price.suffix}
              </span>
            </p>
            <p className={cn('mt-4 min-h-[3em] text-sm leading-relaxed', hi ? 'text-white/70' : 'text-ink/65')}>{plan.blurb}</p>

            <ul className={cn('mt-8 flex-1 space-y-3 border-t pt-8 text-sm', hi ? 'border-white/15' : 'border-ink/12')}>
              {plan.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check aria-hidden className={cn('mt-0.5 size-4 shrink-0', hi ? 'text-signal-soft' : 'text-[#0a63d1]')} strokeWidth={2} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/start?service=${service}&package=${plan.id}`}
              className={cn(
                'group/cta mt-10 inline-flex min-h-12 items-center justify-between rounded-[4px] px-5 text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors [font-variation-settings:"wdth"_112]',
                hi ? 'bg-signal text-white hover:bg-[#3a98ff]' : 'border border-ink/25 hover:border-ink hover:bg-ink hover:text-white',
              )}
            >
              Choose {plan.name.replace(/ (Website|Development)$/, '')}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-1" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
