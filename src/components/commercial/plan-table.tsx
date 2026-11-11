import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PLAN_GROUP_INFO, planPriceLabel, planSubline, planTier, type Plan } from '@/lib/pricing';
import { Stagger } from '@/components/system/motion';
import { cn } from '@/lib/utils';

// Pricing cards for the paper (light) chapter. The recommended plan is set in ink, raised and badged;
// every card has its own call to action that opens the project form with that package chosen.

export function PlanTable({ plans, className }: { plans: Plan[]; className?: string }) {
  return (
    <Stagger
      as="div"
      itemAs="div"
      gap={0.09}
      className={cn('grid items-stretch gap-5 md:gap-6', plans.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3', className)}
      itemClassName="flex"
    >
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </Stagger>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const hi = !!plan.highlight;
  const price = planPriceLabel(plan);
  const sub = planSubline(plan);
  const group = PLAN_GROUP_INFO[plan.group];
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        'lift group/plan relative flex w-full flex-col rounded-[14px] p-7 md:p-8 lg:p-9',
        hi
          ? 'bg-ink text-white shadow-[0_30px_70px_-30px_rgb(10_99_209/0.55)] ring-1 ring-[#0a63d1]/40 md:-my-3 md:py-11'
          : 'border border-ink/12 bg-white/70 hover:border-ink/25',
      )}
    >
      {plan.highlight && (
        <span className="t-label absolute -top-3 left-7 rounded-full bg-signal px-3 py-1.5 text-[0.62rem] text-white shadow-[0_8px_20px_-8px_rgb(26_134_250/0.8)] md:left-8 lg:left-9">
          {plan.highlight}
        </span>
      )}

      <header>
        <h3 id={`plan-${plan.id}`} className="t-title text-[1.6rem] md:text-[1.75rem]">
          {planTier(plan)}
          <span className="sr-only"> {group.label}</span>
        </h3>
        <p aria-hidden className={cn('t-label mt-2', hi ? 'text-white/55' : 'text-ink/50')}>{group.label}</p>
      </header>

      <div className={cn('mt-8 border-t pt-7', hi ? 'border-white/15' : 'border-ink/10')}>
        <p className="flex items-baseline gap-2">
          {price.prefix && <span className={cn('t-label', hi ? 'text-white/60' : 'text-ink/55')}>{price.prefix}</span>}
          <span className="font-display text-[clamp(2.8rem,4.4vw,3.8rem)] font-semibold leading-none tracking-[-0.01em] tabular-nums">
            {price.amount}
            {price.suffix}
          </span>
        </p>
        <p className={cn('mt-3 min-h-5 text-sm font-medium', hi ? 'text-signal-soft' : 'text-[#0a63d1]')}>{sub ?? (plan.plus ? 'Starting price, quoted to scope' : 'One-off price')}</p>
        {plan.blurb && <p className={cn('mt-4 text-sm leading-relaxed', hi ? 'text-white/70' : 'text-ink/65')}>{plan.blurb}</p>}
      </div>

      <ul className="mt-7 flex-1 space-y-3.5 text-[0.95rem]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <span
              aria-hidden
              className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', hi ? 'bg-signal text-white' : 'bg-[#0a63d1]/10 text-[#0a63d1]')}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className={hi ? 'text-white/90' : 'text-ink/85'}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/start?service=${group.service}&package=${plan.id}`}
        className={cn(
          'group/cta mt-10 inline-flex min-h-12 items-center justify-between rounded-full px-6 text-[0.8rem] font-bold uppercase tracking-[0.08em] transition-[background-color,color,border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 active:scale-[0.98]',
          hi
            ? 'bg-signal text-white hover:bg-[#3a98ff] hover:shadow-[0_14px_30px_-12px_rgb(26_134_250/0.9)]'
            : 'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white',
        )}
      >
        Choose plan
        <span className={cn('grid size-7 place-items-center rounded-full transition-transform duration-300 group-hover/cta:translate-x-1', hi ? 'bg-white text-signal' : 'bg-ink text-white group-hover/cta:bg-white group-hover/cta:text-ink')}>
          <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.5} />
        </span>
        <span className="sr-only">: {plan.name}</span>
      </Link>
    </article>
  );
}
