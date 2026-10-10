import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { DivisionsIndex } from '@/components/home/divisions-index';
import { VenturesShowcase } from '@/components/home/ventures-showcase';
import { Commercial } from '@/components/home/commercial';
import { TechEcosystem } from '@/components/home/tech-ecosystem';
import { AssistantsDemo } from '@/components/home/assistants-demo';
import { FrontDeskFlow } from '@/components/home/front-desk-flow';
import { ProcessPipeline } from '@/components/home/process-pipeline';
import { Closing } from '@/components/home/closing';
import { getPlans, listProjects } from '@/lib/db';
import { STATUS_STAGE } from '@/content/site';

export default async function HomePage() {
  const ventures = (await listProjects()).filter((p) => p.kind === 'venture');
  const featured = ventures.filter((p) => p.featured).slice(0, 4);
  const plans = await getPlans();
  const appPlans = plans.filter((p) => p.group === 'app');

  const markers = Object.entries(
    ventures.reduce<Record<string, string[]>>((acc, p) => {
      (acc[STATUS_STAGE[p.status]] ??= []).push(p.name);
      return acc;
    }, {}),
  ).map(([stage, names]) => ({ stage, names }));

  return (
    <>
      <Hero projectsInDevelopment={ventures.filter((p) => p.status === 'IN_DEVELOPMENT').length} />
      <Intro />
      <DivisionsIndex />
      <VenturesShowcase projects={featured} />
      <Commercial
        index="04"
        websitePlans={plans.filter((p) => p.group === 'website')}
        appFromCents={appPlans.length ? Math.min(...appPlans.map((p) => p.priceCents)) : null}
      />
      <TechEcosystem index="05" />
      <AssistantsDemo index="06" />
      <FrontDeskFlow index="07" />
      <ProcessPipeline markers={markers} index="08" more />
      <Closing />
    </>
  );
}
