'use client';

import { Cta } from '@/components/system/primitives';
import { Magnetic, MaskLines } from '@/components/system/motion';
import { Ecosystem } from './ecosystem';
import { HeroVideo } from './hero-video';

export function Hero({ projectsInDevelopment }: { projectsInDevelopment: number }) {
  // Plain CSS entrance: paints with the HTML, no JavaScript needed first.
  const fade = (delay: number) => ({
    className: 'animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]',
    style: { animationDelay: `${delay}s` },
  });

  return (
    <section aria-label="Introduction" className="relative isolate overflow-hidden pt-[68px]">
      {/* Background video, darkened so the headline and the dial stay readable */}
      <HeroVideo className="-z-20" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_6_11/0.88)_0%,rgb(5_6_11/0.62)_45%,rgb(5_6_11/0.72)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(5_6_11/0.55)_0%,transparent_25%,transparent_70%,rgb(5_6_11/0.95)_100%)]" />
      {/* Drafting grid */}
      <div aria-hidden className="drafting absolute inset-0 -z-10 opacity-40" />

      <div className="shell grid min-h-[calc(100svh-68px)] grid-cols-1 items-center gap-y-12 pb-10 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-x-10 lg:pb-16">
        <div className="lg:col-span-6 xl:col-span-6">
          <p style={fade(0.05).style} className={`t-label flex items-center gap-3 text-dim ${fade(0).className}`}>
            <span className="size-1.5 rounded-full bg-signal" aria-hidden />
            Kesera Technologies Holdings
          </p>

          <MaskLines
            as="h1"
            immediate
            delay={0.1}
            className="t-display-xl mt-7 text-[clamp(2.9rem,13.6vw,5.4rem)] lg:text-[clamp(4.6rem,6.6vw,7.4rem)] md:mt-9"
            lines={[
              'Building',
              'What’s',
              <span key="next" className="inline-flex items-baseline">
                Next
                <span aria-hidden className="ml-[0.06em] inline-block size-[0.19em] translate-y-[-0.02em] rounded-full bg-signal shadow-[0_0_0.35em_rgb(26_134_250/0.8)]" />
                <span className="sr-only">.</span>
              </span>,
            ]}
          />

          <p style={fade(0.55).style} className={`t-lead mt-8 max-w-[34rem] text-dim md:mt-10 ${fade(0).className}`}>
            Kesera Technologies is a Zimbabwean technology company. We build websites, mobile apps and custom software, and develop AI, agricultural and energy technology for the world ahead.
          </p>

          <div style={fade(0.7).style} className={`mt-9 flex flex-col gap-3 sm:flex-row sm:items-center ${fade(0).className}`}>
            <Magnetic>
              <Cta href="#divisions" className="w-full sm:w-auto">Explore Kesera</Cta>
            </Magnetic>
            <Cta href="/start" variant="ghost" className="w-full sm:w-auto">
              Start a project
            </Cta>
          </div>
        </div>

        <div
          className="mx-auto w-full max-w-[560px] animate-[fade-up_1.4s_cubic-bezier(0.16,1,0.3,1)_both] lg:col-span-6 lg:max-w-[600px]"
          style={{ animationDelay: '0.25s' }}
        >
          <Ecosystem />
        </div>
      </div>

      <div className="relative">
        <div aria-hidden className="horizon origin-center" />
        <div className="shell">
          <dl className="t-label grid grid-cols-2 gap-y-4 py-6 text-faint md:grid-cols-4">
            <div><dt className="sr-only">Divisions</dt><dd><span className="text-white">06</span> Divisions</dd></div>
            <div><dt className="sr-only">Projects</dt><dd><span className="text-white">{String(projectsInDevelopment).padStart(2, '0')}</span> Projects in development</dd></div>
            <div><dt className="sr-only">Disciplines</dt><dd>Software · AI · Engineering</dd></div>
            <div className="md:text-right"><dt className="sr-only">Based in</dt><dd>Zimbabwe → the world</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
