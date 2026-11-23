import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { WorkforceDemos } from '@/components/workforce/demos';
import { WhatsAppIcon, WORKFORCE_WHATSAPP, YourOkFirst } from '@/components/workforce/trust';
import { hireUrl } from '@/content/workforce';

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
            <Label>New · 7-day free trial</Label>
            <MaskLines id="aiw-home-title" as="h2" className="t-display-l mt-8 max-w-[14ch]" lines={['Hire AI employees', <em key="w">that get real work done.</em>]} />
            <p className="t-lead mt-8 max-w-[34rem] text-white/80">
              Specialised AI employees for admin, sales, marketing, customer support, research and finance. Tell them what you need in plain language; they plan the work, use your business
              tools and hand you finished, checked files.
            </p>
            <ul className="mt-8 space-y-3 text-[15px] text-white/80">
              {['Your first employee free for 7 days, no card needed', 'Real tasks with progress you can follow', 'Finished, checked files: documents, spreadsheets, replies'].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-signal" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={hireUrl()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-signal px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-signal-soft"
              >
                Start your free trial <ArrowRight size={16} aria-hidden />
              </Link>
              <a
                href={WORKFORCE_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-hair-strong px-7 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/50"
              >
                <WhatsAppIcon size={17} /> Ask on WhatsApp
              </a>
            </div>
            <p className="mt-4 text-sm text-dim">
              Already hired one?{' '}
              <a href="https://workforce.keseratech.com/login" className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Customer sign in
              </a>
            </p>
            <p className="mt-4 text-sm text-faint">
              7 days free on your first employee · No card needed ·{' '}
              <Link href="/ai-workforce" className="underline decoration-white/30 underline-offset-4 hover:text-white">
                See how it works
              </Link>
            </p>
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

        <div className="mt-20">
          <p className="t-label text-faint">Watch it work</p>
          <h3 className="t-display-m mt-4 max-w-[22ch]">Pick an employee. Watch a job get done.</h3>
          <div className="mt-8">
            <WorkforceDemos />
          </div>
          <div className="mt-10">
            <p className="t-label mb-4 text-faint">You stay in charge</p>
            <YourOkFirst />
          </div>
        </div>
      </div>
    </section>
  );
}
