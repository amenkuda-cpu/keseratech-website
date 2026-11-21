import { Hero } from '@/components/home/hero';
import { Intro } from '@/components/home/intro';
import { AiWorkforce } from '@/components/home/ai-workforce';
import { DivisionsIndex } from '@/components/home/divisions-index';
import { VenturesShowcase } from '@/components/home/ventures-showcase';
import { Commercial } from '@/components/home/commercial';
import { TechEcosystem } from '@/components/home/tech-ecosystem';
import { AssistantsDemo } from '@/components/home/assistants-demo';
import { FrontDeskFlow } from '@/components/home/front-desk-flow';
import { ProcessPipeline } from '@/components/home/process-pipeline';
import { Closing } from '@/components/home/closing';
import { ClientQuotes } from '@/components/home/client-quotes';
import { PhotoBand } from '@/components/home/photo-band';
import { AmeyAi } from '@/components/home/amey-ai';
import { AgriseraHorizon } from '@/components/home/agrisera-horizon';
import { EvChargeScene } from '@/components/home/ev-charge-scene';
import { PullTransition } from '@/components/scenes/pull-transition';
import { getPlans, listProjects } from '@/lib/db';
import type { Metadata } from 'next';
import { STATUS_STAGE } from '@/content/site';
import { OrganizationJsonLd } from '@/components/site/structured-data';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const ventures = (await listProjects()).filter((p) => p.kind === 'venture');
  const featured = ventures.filter((p) => p.featured).slice(0, 5);
  const plans = await getPlans();

  const markers = Object.entries(
    ventures.reduce<Record<string, string[]>>((acc, p) => {
      (acc[STATUS_STAGE[p.status]] ??= []).push(p.name);
      return acc;
    }, {}),
  ).map(([stage, names]) => ({ stage, names }));

  return (
    <>
      <OrganizationJsonLd />
      <Hero projectsInDevelopment={ventures.filter((p) => p.status === 'IN_DEVELOPMENT').length} />
      {/* Kesera AI Workforce comes first after the hero: it is the main revenue product. */}
      <AiWorkforce />
      <Intro />
      {/* Scroll scenes: robotic arm -> divisions, crane -> Sera Tech, EV -> process.
          Always at least two sections apart; timing in src/animations/scroll-scenes.ts. */}
      <PullTransition clip="robotic-arm" nextClassName="bg-void" label="A robotic arm assembles itself and lifts the next section into view.">
        <DivisionsIndex />
      </PullTransition>
      <PhotoBand id="solar-technicians" line="We’d rather build something small that people use than something big that nobody does." />
      <VenturesShowcase projects={featured} />
      <PullTransition clip="crane" nextClassName="bg-void" label="A crane hook catches the edge of the next section and hoists it into view.">
        <ClientQuotes />
      </PullTransition>
      <TechEcosystem index="04" />
      <AssistantsDemo index="05" />
      <FrontDeskFlow index="06" />
      <EvChargeScene />
      <ProcessPipeline markers={markers} index="07" more />
      <AgriseraHorizon index="08" />
      <AmeyAi />
      {/* Pricing sits near the end: people see the work and products first. */}
      <Commercial index="09" plans={plans} />
      <Closing />
    </>
  );
}
