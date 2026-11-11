import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PricingTabs } from '@/components/commercial/pricing-tabs';
import { SoftwareEstimator } from '@/components/commercial/software-estimator';
import { getEstimator, getPlans } from '@/lib/db';
import { Label } from '@/components/system/primitives';

export const metadata: Metadata = {
  title: 'Website, App & Software Prices in Zimbabwe',
  description: 'Clear prices in Zimbabwe: websites from $120, apps from $250, CRM dashboards from $100, AI chatbots from $40 and AI automation from $80, plus a live estimator for custom software.',
  alternates: { canonical: '/pricing' },
};

// The trust points from the brief. Keep them to commitments the business has made.
const PROMISES = [
  { title: 'Clear pricing', text: 'Published packages, and an estimate before you commit to anything.' },
  { title: 'Transparent process', text: 'You see each stage, from scoping and design to testing and launch.' },
  { title: 'Clear communication', text: 'Regular updates in plain language, not jargon.' },
  { title: 'Post-launch support', text: 'Support after launch, agreed with you before the project starts.' },
];

export default async function PricingPage() {
  const plans = await getPlans();
  const config = await getEstimator();
  return (
    <div className="paper pt-[68px]">
      <section className="shell pb-20 pt-14 md:pb-28 md:pt-20" aria-labelledby="pricing-title">
        <p className="t-label text-ink/55">Sera Tech · Pricing</p>
        <h1 id="pricing-title" className="t-display-l mt-6 max-w-[14ch]">Clear prices. Real scope.</h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/70">
          Fixed packages for websites, apps, CRM dashboards, AI chatbots and AI automation. Anything bigger is priced by scope, and you can estimate it below.
        </p>
        <nav aria-label="Pricing sections" className="t-label mt-10 flex flex-wrap gap-x-8 gap-y-3 text-ink/70">
          <a href="#packages" className="hover:text-ink">01 Packages</a>
          <a href="#software" className="hover:text-ink">02 Custom software</a>
        </nav>
      </section>

      <section id="packages" className="shell scroll-mt-24 pb-24 md:pb-36" aria-labelledby="packages-title">
        <div className="mb-10 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div>
            <Label index="01">Packages</Label>
            <h2 id="packages-title" className="t-display-m mt-5">Choose a service</h2>
          </div>
          <p className="max-w-sm text-sm text-ink/65">Every package is designed for your business, works on every screen and is launched by us. Prices are in US dollars.</p>
        </div>
        <PricingTabs plans={plans} />
      </section>

      <section id="software" className="shell scroll-mt-24 pb-24 md:pb-36" aria-labelledby="software-title">
        <div className="mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <div>
            <Label index="02">Custom software</Label>
            <h2 id="software-title" className="t-display-m mt-5">Priced by scope</h2>
          </div>
          <p className="max-w-sm text-sm text-ink/65">Configure the system you need and see an estimated range. Nothing is sent until you choose to start.</p>
        </div>
        <SoftwareEstimator config={config} />
      </section>

      <section className="border-t border-ink/12" aria-label="How we price">
        <div className="shell grid gap-px py-20 sm:grid-cols-2 lg:grid-cols-4 md:py-28">
          {PROMISES.map((p, i) => (
            <div key={p.title} className="py-6 sm:pr-8">
              <p className="t-label text-ink/45">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="t-title mt-5 text-[1.15rem]">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="shell flex flex-col gap-4 border-t border-ink/12 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink/70">Not sure which fits? Describe it and we’ll recommend one.</p>
          <Link href="/start" className="t-label inline-flex items-center gap-2 text-ink hover:text-[#0a63d1]">
            Start a project <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
