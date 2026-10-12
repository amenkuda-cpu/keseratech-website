'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/lib/db';
import { divisionBySlug } from '@/content/site';
import { exploreTarget } from '@/lib/project-links';
import { StoreButtons } from '@/components/projects/store-buttons';
import { Cta, Dot, Label, Lines, StatusTag } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { ProjectVisual, SchematicFrame } from '@/components/visuals/project-visual';

// "What we're building": the visual stays pinned while the three project chapters scroll past it.

function Chapter({ project, index, onActive }: { project: Project; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  const division = divisionBySlug(project.division)!;
  const target = exploreTarget(project);

  return (
    <article ref={ref} aria-labelledby={`venture-${project.slug}`} className="flex flex-col justify-center py-16 lg:min-h-[100svh] lg:py-0">
      <div className="mb-8 lg:hidden">
        <SchematicFrame>
          <ProjectVisual visual={project.visual} playing={inView} />
        </SchematicFrame>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="t-label text-faint">P/{String(index + 1).padStart(2, '0')}</span>
        <span className="t-label flex items-center gap-2 text-dim">
          <Dot color={division.accent} size={6} />
          {division.name}
        </span>
        <StatusTag status={project.status} />
      </div>

      <p className="t-title mt-8 text-dim">{project.name}</p>
      <h3 id={`venture-${project.slug}`} className="t-display-m mt-3 text-[clamp(1.9rem,3.6vw,3.4rem)]">
        <Lines text={project.headline} />
      </h3>
      <p className="t-body mt-7 max-w-[34rem] text-dim">{project.summary}</p>

      <ul className="mt-8 grid max-w-[34rem] gap-y-2.5 text-sm text-white/85">
        {project.capabilities.slice(0, 4).map((c) => (
          <li key={c} className="flex items-baseline gap-3">
            <span aria-hidden className="h-px w-3 shrink-0 translate-y-[-3px]" style={{ background: division.accent }} />
            {c}
          </li>
        ))}
      </ul>

      <StoreButtons links={project.links} name={project.name} className="mt-10" />

      <div className={project.links?.appStore || project.links?.googlePlay ? 'mt-6 flex flex-wrap items-center gap-x-8 gap-y-4' : 'mt-10 flex flex-wrap items-center gap-x-8 gap-y-4'}>
        <Cta href={target.href} variant="ghost">{target.label}</Cta>
        {target.href !== `/projects/${project.slug}` && (
          <Link href={`/projects/${project.slug}`} className="t-label inline-flex items-center gap-2 py-2 text-dim hover:text-white">
            Project details <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function VenturesShowcase({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = projects[active] ?? projects[0];
  if (!current) return null;

  return (
    <section id="building" aria-labelledby="building-title" className="section relative scroll-mt-16 border-t border-hair">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index="03">Kesera Ventures</Label>
            <MaskLines id="building-title" as="h2" className="t-display-l mt-10" lines={['What we’re', 'building']} />
          </div>
          <Reveal className="md:col-span-5">
            <p className="t-title normal-case [font-variation-settings:'wdth'_100] text-white">Ideas are easy. Building them is the hard part.</p>
            <p className="t-body mt-5 text-dim">
              These are Kesera’s own products, designed and engineered in-house. They are in development now. We show how each system works and where it stands, and we will show results when there are results to show.
            </p>
          </Reveal>
        </div>

        <div className="mt-8 lg:mt-0 lg:grid lg:grid-cols-12 lg:gap-x-14">
          {/* Pinned visual (desktop) */}
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-[calc(50svh-min(30vw,330px))] pt-10">
              <SchematicFrame note="Concept schematic">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.slug}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProjectVisual visual={current.visual} />
                  </motion.div>
                </AnimatePresence>
              </SchematicFrame>
              <div className="mt-5 flex items-center gap-4" aria-hidden>
                <span className="t-label text-faint">{String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                <div className="flex flex-1 gap-1.5">
                  {projects.map((p, i) => (
                    <span key={p.slug} className="h-px flex-1 bg-white/15">
                      <span
                        className="block h-px origin-left bg-white transition-transform duration-700"
                        style={{ transform: `scaleX(${i <= active ? 1 : 0})`, background: divisionBySlug(p.division)!.accent }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {projects.map((p, i) => (
              <Chapter key={p.slug} project={p} index={i} onActive={setActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
