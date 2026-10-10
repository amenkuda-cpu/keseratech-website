import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SERVICES } from '@/content/site';
import { formatUsd, type Plan } from '@/lib/pricing';
import { Label } from '@/components/system/primitives';
import { Magnetic, MaskLines, Reveal } from '@/components/system/motion';
import { PlanTable } from '@/components/commercial/plan-table';

// The commercial chapter: the page turns to paper. Sera Tech's services and website prices.

export function Commercial({ websitePlans, appFromCents, index = '05' }: { websitePlans: Plan[]; appFromCents: number | null; index?: string }) {
  return (
    <section aria-labelledby="built-title" className="paper relative">
      <div className="shell section">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Label index={index}>Sera Tech</Label>
            <MaskLines id="built-title" as="h2" className="t-display-l mt-10" lines={['Need something', 'built?']} />
          </div>
          <Reveal className="md:col-span-4">
            <p className="t-lead">Sera Tech turns ideas into websites, applications and software systems.</p>
            <Magnetic className="mt-8">
              <Link
                href="/start"
                className="group/cta inline-flex min-h-12 items-center gap-6 rounded-[4px] bg-ink px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#16213b] [font-variation-settings:'wdth'_112]"
              >
                Start a project
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        {/* Services: three columns divided by hairlines, not three cards */}
        <div className="mt-20 grid border-t border-ink/15 md:mt-28 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08} className="border-b border-ink/15 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <p className="t-label text-ink/50">{s.index}</p>
              <h3 className="t-title mt-6">{s.name}</h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/70">{s.summary}</p>
              <ul className="t-label mt-8 flex flex-wrap gap-x-4 gap-y-2.5 text-ink/60">
                {s.examples.map((e) => (
                  <li key={e} className="flex items-center gap-2">
                    <span aria-hidden className="size-1 rounded-full bg-ink/40" />
                    {e}
                  </li>
                ))}
              </ul>
              <Link href={`/start?service=${s.id}`} className="t-label mt-10 inline-flex items-center gap-2 border-b border-ink pb-1 text-ink hover:text-[#0a63d1]">
                {s.cta} <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 md:mt-36">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="t-label text-ink/50">Website packages</p>
              <h3 className="t-display-m mt-5">Clear prices.<br />No surprises.</h3>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink/65">
              Fixed packages for websites. Apps and custom software are estimated from what you need. Try the{' '}
              <Link href="/pricing#software" className="underline underline-offset-4 hover:text-ink">estimator</Link>.
            </p>
          </div>
          <div className="mt-12 md:mt-16">
            <PlanTable plans={websitePlans} service="website" />
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink/65">{appFromCents !== null && `Apps from ${formatUsd(appFromCents)}, `}custom software priced by scope.</p>
            <Link href="/pricing" className="t-label inline-flex items-center gap-2 text-ink hover:text-[#0a63d1]">
              All pricing <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
