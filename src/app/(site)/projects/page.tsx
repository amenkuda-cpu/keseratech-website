import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { listProjects } from '@/lib/db';
import { divisionBySlug } from '@/content/site';
import { Cta, Dot, Label, StatusTag } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { ProjectVisual, SchematicFrame } from '@/components/visuals/project-visual';
import { FutureBoard } from '@/components/home/future-board';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Kesera Ventures (BikerDash, Smart Irrigation and Smart EV Charging) and the projects Sera Tech builds for clients.',
};

export default async function ProjectsPage() {
  const all = await listProjects();
  const ventures = all.filter((p) => p.kind === 'venture');
  const clients = all.filter((p) => p.kind === 'client');

  return (
    <>
      <section className="shell pb-16 pt-[calc(68px+3.5rem)] md:pt-[calc(68px+6rem)]" aria-labelledby="ventures-title">
        <Label>Kesera Ventures</Label>
        <MaskLines id="ventures-title" as="h1" immediate className="t-display-xl mt-8 text-[clamp(2.8rem,8vw,8rem)]" lines={['Built here.', 'Born here.']} />
        <p className="t-lead mt-10 max-w-2xl text-dim">
          Products Kesera designs, engineers and will operate itself, developed in Zimbabwe for real conditions here and beyond. These are our own ventures, not client work.
        </p>
      </section>

      <section aria-label="Ventures" className="shell pb-[var(--section)] max-md:px-0">
        {/* Phones: swipe between ventures. Larger screens: stacked feature rows. */}
        <ul className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:none] md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {ventures.map((p, i) => {
            const d = divisionBySlug(p.division)!;
            return (
              <li key={p.slug} className="w-[86vw] shrink-0 snap-center md:w-auto">
                <Reveal>
                  <Link href={`/projects/${p.slug}`} className="group/v grid overflow-hidden rounded-[8px] border border-hair bg-deep/40 transition-colors duration-500 hover:border-white/25 md:grid-cols-12">
                    <div className="border-b border-hair md:col-span-7 md:border-b-0 md:border-r">
                      <SchematicFrame className="rounded-none border-0">
                        <ProjectVisual visual={p.visual} />
                      </SchematicFrame>
                    </div>
                    <div className="flex flex-col p-6 md:col-span-5 md:p-10">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="t-label text-faint">V/{String(i + 1).padStart(2, '0')}</span>
                        <StatusTag status={p.status} />
                      </div>
                      <p className="t-label mt-8 flex items-center gap-2 text-dim">
                        <Dot color={d.accent} size={6} /> {d.name}
                      </p>
                      <h2 className="t-display-m mt-4 text-[clamp(1.8rem,3.4vw,3.2rem)]">{p.name}</h2>
                      <p className="mt-3 text-white/80">{p.tagline}</p>
                      <p className="mt-6 line-clamp-4 text-sm leading-relaxed text-dim">{p.summary}</p>
                      <span className="t-label mt-auto inline-flex items-center gap-2 pt-10 text-white">
                        Explore {p.name}
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/v:-translate-y-0.5 group-hover/v:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      <FutureBoard projects={ventures} index="02" />

      <section aria-labelledby="clients-title" className="section border-t border-hair">
        <div className="shell">
          <Label index="03">Client projects</Label>
          <MaskLines id="clients-title" as="h2" className="t-display-l mt-10" lines={['Built for', 'our clients.']} />
          {clients.length > 0 ? (
            <ul className="mt-16 grid gap-4 md:grid-cols-2">
              {clients.map((p) => {
                const d = divisionBySlug(p.division)!;
                return (
                  <li key={p.slug}>
                    <Link href={`/projects/${p.slug}`} className="block rounded-[6px] border border-hair p-6 transition-colors hover:border-white/30 md:p-8">
                      <p className="t-label flex items-center gap-2 text-faint"><Dot color={d.accent} size={6} /> {p.client ?? d.name}</p>
                      <h3 className="t-title mt-6">{p.name}</h3>
                      <p className="mt-3 text-sm text-dim">{p.tagline}</p>
                      <StatusTag status={p.status} className="mt-6" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-16 grid gap-8 rounded-[6px] border border-dashed border-hair p-8 md:grid-cols-12 md:items-center md:p-12">
              <p className="t-lead text-dim md:col-span-7">
                Client case studies are published with each client’s permission, once their project is live. They will appear here.
              </p>
              <div className="md:col-span-4 md:col-start-9 md:justify-self-end">
                <Cta href="/start">Start a project</Cta>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
