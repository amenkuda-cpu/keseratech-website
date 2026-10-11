import { HorizonLine, Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { Ecosystem } from './ecosystem';

// The six divisions as one system: the interactive dial, introduced after the showcase.

export function EcosystemSection({ projectsInDevelopment }: { projectsInDevelopment: number }) {
  return (
    <section aria-labelledby="ecosystem-title" className="relative isolate overflow-hidden">
      <HorizonLine />
      <div aria-hidden className="drafting absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_70%_50%,black_20%,transparent_75%)]" />
      <div className="shell section grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <Label>Kesera Technologies Holdings</Label>
          <MaskLines id="ecosystem-title" as="h2" className="t-display-l mt-10" lines={['Six divisions.', 'One system.']} />
          <Reveal>
            <p className="t-lead mt-8 max-w-md text-dim">
              Software, AI, agriculture, energy and smart living, connected so that what one division learns, all of them use. Choose a division to see what it does.
            </p>
          </Reveal>
        </div>
        <Reveal className="mx-auto w-full max-w-[560px] lg:col-span-7 lg:max-w-[620px]">
          <Ecosystem />
        </Reveal>
      </div>
      <div className="shell">
        <dl className="t-label grid grid-cols-2 gap-y-4 border-t border-hair py-6 text-faint md:grid-cols-4">
          <div><dt className="sr-only">Divisions</dt><dd><span className="text-white">06</span> Divisions</dd></div>
          <div><dt className="sr-only">Projects</dt><dd><span className="text-white">{String(projectsInDevelopment).padStart(2, '0')}</span> Projects in development</dd></div>
          <div><dt className="sr-only">Disciplines</dt><dd>Software · AI · Engineering</dd></div>
          <div className="md:text-right"><dt className="sr-only">Based in</dt><dd>Zimbabwe → the world</dd></div>
        </dl>
      </div>
    </section>
  );
}
