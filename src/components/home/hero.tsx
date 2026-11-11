'use client';

import { Cta } from '@/components/system/primitives';
import { CountUp, MaskLines, Parallax } from '@/components/system/motion';
import { HeroVideo } from './hero-video';

export function Hero({ projectsInDevelopment }: { projectsInDevelopment: number }) {
  // Plain CSS entrance: paints with the HTML, no JavaScript needed first.
  const fade = (delay: number) => ({
    className: 'animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]',
    style: { animationDelay: `${delay}s` },
  });

  return (
    <section aria-label="Introduction" className="relative isolate overflow-hidden pt-[68px]">
      {/* Full-width video of people at work, drifting slowly forward and moving slower than the page
          as it scrolls (parallax). A plain dark wash keeps the headline readable. */}
      <div aria-hidden className="absolute inset-x-0 -top-[8%] -z-20 h-[116%]">
        <Parallax className="size-full" strength={140}>
          <div className="relative size-full motion-safe:animate-[slow-zoom_14s_cubic-bezier(0.16,1,0.3,1)_both]">
            <HeroVideo />
          </div>
        </Parallax>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-black/55" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-void" />

      <div className="shell grid min-h-[calc(100svh-68px)] grid-cols-1 content-end gap-y-10 pb-14 pt-24 lg:grid-cols-12 lg:gap-x-10 lg:pb-20">
        <div className="lg:col-span-8">
          <p style={fade(0.05).style} className={`t-label text-white/75 ${fade(0).className}`}>Kesera Technologies · Zimbabwe</p>

          <MaskLines
            as="h1"
            immediate
            delay={0.1}
            className="t-display-xl mt-6 text-[clamp(2.8rem,12vw,5rem)] lg:text-[clamp(4.4rem,6.6vw,7.2rem)]"
            lines={['Good technology,', <em key="z">made in Zimbabwe.</em>]}
          />
        </div>

        {/* Off to the right on wide screens, so the hero isn't one centred block */}
        <div className="lg:col-span-4 lg:pb-3" style={fade(0.5).style}>
          <p className={`t-lead text-white/85 ${fade(0).className}`}>
            We build websites, apps and software for businesses. We’re also working on our own projects in farming, energy and housing.
          </p>
          <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${fade(0).className}`}>
            <Cta href="/start" className="w-full sm:w-auto">Start a project</Cta>
            <Cta href="#who-we-are" variant="ghost" className="w-full sm:w-auto">Who we are</Cta>
          </div>
        </div>
      </div>

      <div className="relative">
        <div aria-hidden className="horizon" />
        <div className="shell">
          <dl className="t-label grid grid-cols-2 gap-y-3 py-5 text-faint md:flex md:gap-x-12">
            <div><dt className="sr-only">Divisions</dt><dd><CountUp to={6} className="text-white" /> divisions</dd></div>
            <div><dt className="sr-only">Projects</dt><dd><CountUp to={projectsInDevelopment} className="text-white" /> projects being built</dd></div>
            <div className="col-span-2 md:ml-auto"><dt className="sr-only">Based in</dt><dd>Based in Zimbabwe</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
