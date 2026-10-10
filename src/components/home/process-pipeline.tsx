'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PIPELINE } from '@/content/site';
import { Cta, Label } from '@/components/system/primitives';
import { MaskLines } from '@/components/system/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Idea → Scale. The line fills with scroll and each stage lights as the line reaches it.
// `markers` pins live projects to the stage they are in.

export function ProcessPipeline({ markers, index = '09', more = false }: { markers: { stage: string; names: string[] }[]; index?: string; more?: boolean }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stages = gsap.utils.toArray<HTMLElement>('[data-stage]');
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: '(min-width: 1024px)', motion: '(prefers-reduced-motion: no-preference)' },
        (ctx) => {
          const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
          if (!motion) {
            stages.forEach((s) => (s.dataset.active = 'true'));
            return;
          }
          stages.forEach((s) => (s.dataset.active = 'false'));
          gsap.fromTo(
            '[data-fill]',
            desktop ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 },
            {
              ...(desktop ? { scaleX: 1 } : { scaleY: 1 }),
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-track]',
                start: desktop ? 'top 75%' : 'top 70%',
                end: desktop ? 'top 25%' : 'bottom 55%',
                scrub: 0.6,
                onUpdate: (self) => {
                  stages.forEach((s, i) => {
                    s.dataset.active = String(self.progress >= i / (stages.length - 1) - 0.02);
                  });
                },
              },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section aria-labelledby="process-title" className="section border-t border-hair">
      <div ref={scope} className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Innovation pipeline</Label>
            <MaskLines id="process-title" as="h2" className="t-display-l mt-10" lines={['From idea', 'to scale.']} />
          </div>
          <p className="t-body text-dim md:col-span-4 md:col-start-9">
            Every Kesera product, and every client project, moves through the same stages. Nothing skips testing, and nothing is called finished before it is deployed and supported.
          </p>
        </div>

        <div data-track className="relative mt-16 md:mt-24">
          {/* Track */}
          <div aria-hidden className="absolute left-[1.06rem] top-2 bottom-2 w-px bg-white/10 lg:left-0 lg:right-0 lg:top-[1.06rem] lg:bottom-auto lg:h-px lg:w-auto" />
          <div aria-hidden data-fill className="absolute left-[1.06rem] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-signal to-signal-soft lg:left-0 lg:right-0 lg:top-[1.06rem] lg:bottom-auto lg:h-px lg:w-auto lg:origin-left lg:bg-gradient-to-r" />

          <ol className="relative grid gap-8 lg:grid-cols-8 lg:gap-4">
            {PIPELINE.map((stage, i) => {
              const marker = markers.find((m) => m.stage === stage.id);
              return (
                <li key={stage.id} data-stage data-active="true" className="group/stage grid grid-cols-[2.25rem_1fr] gap-x-4 lg:block">
                  <span
                    aria-hidden
                    className="relative z-10 grid size-[2.15rem] place-items-center rounded-full border border-white/15 bg-void font-mono text-[0.68rem] text-white/45 transition-colors duration-500 group-data-[active=true]/stage:border-signal group-data-[active=true]/stage:bg-signal group-data-[active=true]/stage:text-white"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="pt-1 lg:mt-6 lg:pt-0">
                    <p className="t-title text-[1.05rem] text-white/45 transition-colors duration-500 group-data-[active=true]/stage:text-white">{stage.label}</p>
                    <p className="mt-2 text-sm text-faint">{stage.note}</p>
                    {marker && (
                      <div className="mt-4 rounded-[4px] border border-signal/40 bg-signal/[0.06] p-3">
                        <p className="t-label text-signal-soft">We are here</p>
                        <ul className="mt-2 space-y-1 text-xs text-white/80">
                          {marker.names.map((n) => <li key={n}>{n}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {more && (
          <div className="mt-20 grid gap-6 border-t border-hair pt-10 md:mt-28 md:grid-cols-12 md:items-end">
            <p className="t-display-m md:col-span-5">More is coming.</p>
            <p className="t-body text-dim md:col-span-4">
              New Kesera projects join this line when they enter research, and move along it as they are built, tested and launched.
            </p>
            <div className="md:col-span-3 md:justify-self-end">
              <Cta href="/projects" variant="ghost">All projects</Cta>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
