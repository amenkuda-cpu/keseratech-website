import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DIVISIONS, DIVISION_SLUGS, SERVICES, divisionBySlug } from '@/content/site';
import { DIVISION_PAGES } from '@/content/divisions';
import { listProjects } from '@/lib/db';
import { Cta, Dot, Label, StatusTag } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { DivisionGlyph } from '@/components/visuals/division-glyph';
import { ProjectVisual, SchematicFrame } from '@/components/visuals/project-visual';
import { AssistantsDemo } from '@/components/home/assistants-demo';
import { FrontDeskFlow } from '@/components/home/front-desk-flow';
import { UpcycleFlow } from '@/components/visuals/upcycle-flow';
import { ReuseGallery } from '@/components/visuals/reuse-gallery';
import { Photo } from '@/components/visuals/photo';
import { photo } from '@/content/photos';


/** Hero size from the longest line, so long names ("Assistants") never overflow the column. */
function displaySize(lines: string[]) {
  const longest = Math.max(...lines.map((l) => l.length));
  const em = longest * 0.98; // expanded caps run ~0.86em per character; wide letters (M, W) need the margin
  return `min(8.6rem, ${(86 / em).toFixed(2)}vw, ${(880 / em / 16).toFixed(2)}rem)`;
}

export async function generateStaticParams() {
  return DIVISION_SLUGS.map((division) => ({ division }));
}

export async function generateMetadata({ params }: PageProps<'/[division]'>): Promise<Metadata> {
  const d = divisionBySlug((await params).division);
  if (!d) return {};
  return { title: d.name, description: `${d.short} ${d.intro}`.slice(0, 160) };
}

export default async function DivisionPage({ params }: PageProps<'/[division]'>) {
  const division = divisionBySlug((await params).division);
  if (!division) notFound();
  const page = DIVISION_PAGES[division.slug];
  const projects = (await listProjects()).filter((p) => p.division === division.slug);
  const index = DIVISIONS.findIndex((d) => d.slug === division.slug);
  const nextDivision = DIVISIONS[(index + 1) % DIVISIONS.length]!;
  const external = (href: string) => href.startsWith('mailto:');
  const nameLines = division.name.startsWith('Sera ') ? ['Sera', division.name.slice(5)] : [division.name];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="division-title">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(50% 60% at 85% 20%, color-mix(in srgb, ${division.accent} 12%, transparent), transparent 70%)` }} />
        <div aria-hidden className="drafting absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_80%_30%,black,transparent_70%)]" />
        <div className="shell grid gap-12 pb-20 pt-[calc(68px+3.5rem)] md:pb-28 md:pt-[calc(68px+6rem)] lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="t-label flex items-center gap-3 text-dim">
              <Dot color={division.accent} size={8} glow />
              Kesera division · {division.discipline}
            </p>
            <div style={{ fontSize: displaySize(nameLines) }}>
              <MaskLines id="division-title" as="h1" immediate className="t-display-xl mt-8 text-[1em]" lines={nameLines} />
            </div>
            <p className="t-display-m mt-8 max-w-[18ch] text-[clamp(1.5rem,2.8vw,2.6rem)] text-white/80">{division.headline}</p>
            <p className="t-lead mt-8 max-w-2xl text-dim">{division.intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {external(page.primary.href) ? (
                <a href={page.primary.href} className="group/cta inline-flex min-h-12 items-center justify-between gap-6 rounded-[4px] bg-signal px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#3a98ff] [font-variation-settings:'wdth'_112]">
                  {page.primary.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ) : (
                <Cta href={page.primary.href}>{page.primary.label}</Cta>
              )}
              {page.secondary && <Cta href={page.secondary.href} variant="ghost">{page.secondary.label}</Cta>}
            </div>
          </div>
          {division.slug === 'sera-home' ? (
            <div className="relative grid grid-cols-5 gap-3 lg:col-span-4 lg:self-center">
              <Photo photo={photo('container-stall-benin')} aspect="3/4" priority caption={false} className="col-span-3" sizes="(min-width: 1024px) 20vw, 60vw" />
              <div className="col-span-2 flex flex-col justify-end gap-3">
                <Photo photo={photo('drum-field')} aspect="1/1" caption={false} sizes="(min-width: 1024px) 14vw, 40vw" />
                <Photo photo={photo('handwash-ethiopia')} aspect="3/4" caption={false} sizes="(min-width: 1024px) 14vw, 40vw" />
              </div>
              <p className="t-label col-span-5 text-[0.6rem] text-white/40">
                Examples of reuse (not Sera Home projects). Credits in the gallery below.
              </p>
            </div>
          ) : (
            <div className="hidden items-center justify-center text-white/25 lg:col-span-4 lg:flex">
              <div className="size-[min(26vw,360px)]">
                <DivisionGlyph slug={division.slug} accent={division.accent} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Focus areas */}
      <section className="border-t border-hair" aria-labelledby="focus-title">
        <div className="shell section">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Label index="01">Focus areas</Label>
              <h2 id="focus-title" className="sr-only">Focus areas</h2>
            </div>
            <ul className="grid border-t border-hair sm:grid-cols-2 md:col-span-8">
              {division.focus.map((f, i) => (
                <li key={f} className="flex items-baseline gap-5 border-b border-hair py-5 sm:odd:pr-6">
                  <span className="t-label text-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span className="t-title text-[1.15rem] normal-case [font-variation-settings:'wdth'_105]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Signature */}
      {page.signature === 'assistants' && <AssistantsDemo index="02" heading={['See it', 'at work.']} showLink={false} />}
      {page.signature === 'front-desk' && <FrontDeskFlow index="02" heading={['How a call', 'is handled.']} showLink={false} />}
      {page.signature === 'upcycle' && (
        <>
          <section className="border-t border-hair" aria-labelledby="signature-title">
            <div className="shell section">
              <div className="grid gap-10 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <Label index="02">Recycling · reuse · upcycling</Label>
                  <MaskLines id="signature-title" as="h2" className="t-display-l mt-10" lines={['How waste', 'becomes a home']} />
                </div>
                <p className="t-body text-dim md:col-span-5">{page.signatureText}</p>
              </div>
              <div className="mt-14 md:mt-20">
                <UpcycleFlow />
              </div>
            </div>
          </section>
          <section id="examples" className="scroll-mt-20 border-t border-hair" aria-labelledby="examples-title">
            <div className="shell section">
              <div className="grid gap-10 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <Label index="03">Real-world examples</Label>
                  <MaskLines id="examples-title" as="h2" className="t-display-l mt-10" lines={['What waste', 'becomes']} />
                </div>
                <p className="t-body text-dim md:col-span-5">
                  Containers, drums, tyres and bottles are already building homes, shops, offices and facilities around the world. These photographs show what is possible, and the standard Sera Home builds to.
                </p>
              </div>
              <div className="mt-14 md:mt-20">
                <ReuseGallery />
              </div>
            </div>
          </section>
          <section className="border-t border-hair" aria-labelledby="smart-title">
            <div className="shell section grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <Label index="04">Smart living inside</Label>
                <h2 id="smart-title" className="t-display-m mt-10">Reclaimed outside. Intelligent inside.</h2>
                <p className="t-body mt-6 text-dim">
                  A reused shell can still be a modern home. Sera Home fits solar power, storage, lighting, security and automation, so a container home runs on its own energy and looks after itself.
                </p>
              </div>
              <Reveal className="lg:col-span-7">
                <SchematicFrame note="Concept schematic">
                  <ProjectVisual visual="home" />
                </SchematicFrame>
              </Reveal>
            </div>
          </section>
        </>
      )}
      {(page.signature === 'irrigation' || page.signature === 'ev') && (
        <section className="border-t border-hair" aria-labelledby="signature-title">
          <div className="shell section">
            <div className="grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <Label index="02">Signature</Label>
                <MaskLines id="signature-title" as="h2" className="t-display-l mt-10" lines={[page.signatureTitle]} />
              </div>
              <p className="t-body text-dim md:col-span-5">{page.signatureText}</p>
            </div>
            <Reveal className="mt-14 md:mt-20">
              <SchematicFrame note="Concept schematic">
                <ProjectVisual visual={page.signature} />
              </SchematicFrame>
            </Reveal>
          </div>
        </section>
      )}
      {page.signature === 'services' && (
        <section className="border-t border-hair" aria-labelledby="signature-title">
          <div className="shell section">
            <div className="grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <Label index="02">Services</Label>
                <MaskLines id="signature-title" as="h2" className="t-display-l mt-10" lines={[page.signatureTitle]} />
              </div>
              <p className="t-body text-dim md:col-span-5">{page.signatureText}</p>
            </div>
            <ul className="mt-16 grid gap-3 md:mt-20 md:grid-cols-3">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <Link href={`/start?service=${s.id}`} className="group/s flex h-full flex-col rounded-[6px] border border-hair p-6 transition-colors hover:border-white/30 md:p-8">
                    <span className="t-label text-faint">{s.index}</span>
                    <span className="t-title mt-8">{s.name}</span>
                    <span className="mt-4 text-sm leading-relaxed text-dim">{s.summary}</span>
                    <span className="t-label mt-6 text-faint">{s.examples.slice(0, 4).join(' · ')}</span>
                    <span className="t-label mt-auto inline-flex items-center gap-2 pt-10 text-white group-hover/s:text-signal-soft">
                      {s.cta} <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Approach */}
      <section className="border-t border-hair" aria-labelledby="approach-title">
        <div className="shell section">
          <Label index="03">Approach</Label>
          <h2 id="approach-title" className="t-display-m mt-10 max-w-[20ch]">How {division.name} works</h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[6px] bg-hair sm:grid-cols-2 lg:grid-cols-4">
            {page.approach.map((a, i) => (
              <li key={a.title} className="bg-void p-6 md:p-8">
                <span className="grid size-9 place-items-center rounded-full border font-mono text-[0.7rem]" style={{ borderColor: division.accent, color: division.accent }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="t-title mt-8 text-[1.15rem]">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">{a.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="border-t border-hair" aria-labelledby="div-projects-title">
          <div className="shell section">
            <Label index={page.signature === 'upcycle' ? '06' : '04'}>Projects</Label>
            <h2 id="div-projects-title" className="t-display-m mt-10">What {division.name} is building</h2>
            <ul className="mt-14 grid gap-4 md:grid-cols-2">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group/p flex h-full flex-col rounded-[6px] border border-hair p-6 transition-colors hover:border-white/30 md:p-8">
                    <StatusTag status={p.status} className="self-start" />
                    <span className="t-display-m mt-8 text-[clamp(1.6rem,2.6vw,2.4rem)]">{p.name}</span>
                    <span className="mt-3 text-dim">{p.tagline}</span>
                    <span className="t-label mt-auto inline-flex items-center gap-2 pt-10 text-white group-hover/p:text-signal-soft">
                      Project details <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Next division */}
      <Link href={`/${nextDivision.slug}`} className="group/next block border-t border-hair">
        <div className="shell flex items-center justify-between gap-6 py-14 md:py-20">
          <div>
            <p className="t-label text-faint">Next division</p>
            <p className="t-display-m mt-4 flex items-center gap-4">
              <Dot color={nextDivision.accent} size={12} />
              <span className="transition-colors group-hover/next:text-signal-soft">{nextDivision.name}</span>
            </p>
          </div>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-hair transition-colors group-hover/next:border-white group-hover/next:bg-white group-hover/next:text-void">
            <ArrowRight className="size-5" />
          </span>
        </div>
      </Link>
    </>
  );
}

