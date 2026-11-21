import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { WORKFORCE } from '@/content/workforce';

/**
 * Kesera AI Workforce, placed straight after the hero: what it is, the six
 * employees, the explainer film and the way to hire. No price on the home page
 * (owner's request); pricing lives on /ai-workforce.
 */
export function AiWorkforce() {
  return (
    <section id="ai-workforce" aria-labelledby="aiw-home-title" className="section relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 size-[520px] rounded-full bg-signal/15 blur-[140px]" />
      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <Label>New · Kesera AI Workforce</Label>
            <MaskLines id="aiw-home-title" as="h2" className="t-display-l mt-8 max-w-[14ch]" lines={['Hire AI employees', <em key="w">that get real work done.</em>]} />
            <p className="t-lead mt-8 max-w-[34rem] text-white/80">
              Specialised AI employees for admin, sales, marketing, customer support, research and finance. Tell them what you need in plain language; they plan the work, use your business
              tools and hand you finished, checked files.
            </p>
            <ul className="mt-8 space-y-3 text-[15px] text-white/80">
              {['Real tasks with progress you can follow', 'Ask your approval before acting on your behalf', 'Never make payments or ask for passwords'].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-signal" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ai-workforce#hire"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-signal px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-signal-soft"
              >
                Hire an AI employee <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/ai-workforce"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-hair-strong px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/50"
              >
                See how it works
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <figure className="overflow-hidden rounded-sm border border-hair bg-black shadow-[0_40px_80px_-40px_rgb(26_134_250/0.45)]">
              <video className="aspect-video w-full" controls playsInline preload="none" poster="/workforce/explainer-poster.jpg">
                <source src="/workforce/kesera-ai-workforce-explainer.mp4" type="video/mp4" />
              </video>
              <figcaption className="t-label px-5 py-3 text-faint">How it works · under a minute</figcaption>
            </figure>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-sm border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-3">
          {WORKFORCE.map((e) => (
            <li key={e.key} className="bg-void">
              <Link href="/ai-workforce#team" className="group flex h-full items-start gap-4 p-6 transition hover:bg-white/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/workforce/${e.key}.webp`}
                  alt={`${e.name}, ${e.title} (AI)`}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-full object-cover"
                  style={{ boxShadow: `0 0 0 2px ${e.accent}66` }}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="t-title text-[1.2rem]">{e.name}</span>
                    <ArrowRight size={15} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-signal" aria-hidden />
                  </span>
                  <span className="block text-sm text-dim">{e.title}</span>
                  <span className="mt-2 block text-[14px] leading-relaxed text-white/80">{e.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
