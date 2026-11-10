import type { Metadata } from 'next';
import { ArrowUpRight, Mail } from 'lucide-react';
import { COMPANY } from '@/content/site';
import { WORK } from '@/content/work';
import { FOUNDER, SHOW_PLACEHOLDERS } from '@/content/people';
import { Reveal } from '@/components/system/motion';
import { PersonFrame, PlaceholderTag } from '@/components/site/people';
import { WorkVideo } from '@/components/work/work-video';
import { StoreButtons } from '@/components/projects/store-buttons';
import { cn } from '@/lib/utils';

// "Our Work": websites built by Amen at Kesera. Linked from the main menu. Projects come from src/content/work.ts.

export const metadata: Metadata = {
  title: { absolute: 'Our Work: Websites Built by Kesera | Kesera Technologies' },
  description: 'Websites and apps Kesera has designed and built: online shops, company and brand sites, a law firm, a church and the PocketJobs app.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  const projects = WORK.filter((p) => SHOW_PLACEHOLDERS || !p.placeholder);
  const withPhoto = !!FOUNDER.photo || SHOW_PLACEHOLDERS;

  return (
    <>
      <header className="shell grid gap-10 pb-16 pt-[calc(68px+3.5rem)] md:grid-cols-12 md:items-end md:pb-24 md:pt-[calc(68px+6rem)]">
        <div className="md:col-span-7">
          <h1 className="t-display-xl text-[clamp(2.6rem,8vw,6.4rem)]">
            Hi, I’m Amen.
            <em className="block">Here’s some of my work.</em>
          </h1>
          <p className="t-lead mt-8 max-w-[34rem] text-white/80">
            These are websites and apps I’ve designed and built for businesses, brands and organisations in Zimbabwe and beyond: online shops, company sites, a law firm, a church and our own app, PocketJobs. Each one starts with how the business actually works. Every project below has a link, so you can try it for yourself.
          </p>
        </div>
        {withPhoto && (
          <div className="md:col-span-4 md:col-start-9">
            <PersonFrame photo={FOUNDER.photo} label="Photo of Amen" className="aspect-[4/5] w-full max-w-sm md:ml-auto" sizes="(min-width: 768px) 30vw, 80vw" />
          </div>
        )}
      </header>

      <section aria-label="Projects" className="border-t border-hair">
        <ol className="shell">
          {projects.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <Reveal key={p.name} as="li" className="grid gap-8 border-b border-hair py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-12">
                <div className={cn('lg:col-span-8', flip && 'lg:col-start-5 lg:row-start-1')}>
                  <div className="overflow-hidden rounded-[8px] border border-hair-strong bg-deep">
                    {/* A slim browser bar, so the recording reads as a website */}
                    <div aria-hidden className="flex items-center gap-1.5 border-b border-hair px-3 py-2">
                      <span className="size-2 rounded-full bg-white/20" />
                      <span className="size-2 rounded-full bg-white/20" />
                      <span className="size-2 rounded-full bg-white/20" />
                    </div>
                    {p.video ? (
                      <WorkVideo mp4={p.video.mp4} webm={p.video.webm} poster={p.video.poster} label={`Screen recording of the ${p.name} website, scrolling through the pages`} />
                    ) : (
                      <div className="grid aspect-[16/10] place-items-center text-center">
                        <div>
                          <p className="t-label text-[#e8b26a]">Placeholder</p>
                          <p className="mt-2 text-sm text-white/60">Screen recording goes here (public/work/)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn('lg:col-span-4', flip && 'lg:col-start-1 lg:row-start-1')}>
                  <p className="t-label text-faint">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="t-display-m mt-4">
                    {p.name}
                    <PlaceholderTag show={SHOW_PLACEHOLDERS && p.placeholder} />
                  </h2>
                  <p className="t-body mt-5 text-white/75">{p.summary}</p>
                  {p.tags.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
                      {p.tags.map((t) => (
                        <li key={t} className="rounded-full border border-hair-strong px-3 py-1 text-xs text-white/70">{t}</li>
                      ))}
                    </ul>
                  )}
                  {p.apps && <StoreButtons links={p.apps} name={p.name} className="mt-8" />}
                  {(p.liveUrl || p.moreLinks?.length) && (
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-12 items-center gap-3 rounded-[4px] border border-hair-strong px-5 text-[0.95rem] font-semibold transition-colors hover:border-white/50 hover:bg-white/[0.04]"
                        >
                          Visit live site <ArrowUpRight aria-hidden className="size-4" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                      {p.moreLinks?.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 py-2 text-sm text-white/75 underline-offset-4 hover:text-white hover:underline">
                          {l.label} <ArrowUpRight aria-hidden className="size-3.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="talk-title" className="section">
        <div className="shell grid gap-10 md:grid-cols-12 md:items-end">
          <h2 id="talk-title" className="t-display-l md:col-span-7">
            Like what you see?
            <em className="block">Let’s talk.</em>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
            <a
              href={COMPANY.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-between gap-6 rounded-[4px] bg-[#25d366] px-5 text-[0.95rem] font-semibold text-black transition-colors hover:bg-[#3ee07a]"
            >
              WhatsApp me <ArrowUpRight aria-hidden className="size-4" />
            </a>
            <a
              href={`mailto:${COMPANY.email}?subject=${encodeURIComponent('Website enquiry')}`}
              className="inline-flex min-h-12 items-center justify-between gap-6 rounded-[4px] border border-hair-strong px-5 text-[0.95rem] font-semibold transition-colors hover:border-white/50 hover:bg-white/[0.04]"
            >
              Email {COMPANY.email} <Mail aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
