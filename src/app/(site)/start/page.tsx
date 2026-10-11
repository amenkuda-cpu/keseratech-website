import type { Metadata } from 'next';
import { ProjectBuilder, type BuilderPrefill } from '@/components/commercial/project-builder';
import { getEstimator, getPlans } from '@/lib/db';
import { COMPANY } from '@/content/site';

export const metadata: Metadata = {
  title: 'Get a Website, App or Software Quote in Zimbabwe',
  description: 'Tell Kesera Technologies what you need built: a website, mobile app, software or AI automation. See an estimated price in minutes and send your project to us.',
  alternates: { canonical: '/start' },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function StartPage({ searchParams }: PageProps<'/start'>) {
  const q = await searchParams;
  const prefill: BuilderPrefill = {
    service: one(q.service),
    type: one(q.type),
    package: one(q.package),
    features: one(q.features)?.split(',').filter(Boolean).slice(0, 20),
    users: one(q.users),
  };
  return (
    <div className="paper min-h-dvh pt-[68px]">
      <div className="shell pb-28 pt-14 md:pt-20">
        <p className="t-label text-ink/55">Start a project · Sera Tech</p>
        <h1 className="t-display-l mt-6 max-w-[16ch]">Tell us what you’re building.</h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/70">
          Six short steps. You’ll see an estimated price before you send anything, and we confirm the real price with you before work starts.
        </p>
        <div className="mt-14 md:mt-20">
          <ProjectBuilder config={await getEstimator()} plans={await getPlans()} prefill={prefill} />
        </div>
        <p className="mt-16 text-sm text-ink/60">
          Prefer to talk? Email <a className="underline underline-offset-2" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{' '}
          <a className="underline underline-offset-2" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
        </p>
      </div>
    </div>
  );
}
