import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getProject, listProjects } from '@/lib/db';
import { divisionBySlug } from '@/content/site';
import { exploreTarget } from '@/lib/project-links';
import { Cta, Dot, Label, Lines, StatusTag } from '@/components/system/primitives';
import { Reveal } from '@/components/system/motion';
import { ProjectVisual, SchematicFrame } from '@/components/visuals/project-visual';
import { StageTracker } from '@/components/projects/stage-tracker';
import { StoreButtons } from '@/components/projects/store-buttons';

export async function generateStaticParams() {
  return (await listProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: { absolute: `${p.name} | Kesera Technologies` }, description: p.summary.slice(0, 160), alternates: { canonical: `/projects/${p.slug}` } };
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const division = divisionBySlug(project.division)!;
  const all = (await listProjects()).filter((p) => p.kind === project.kind);
  const next = all[(all.findIndex((p) => p.slug === project.slug) + 1) % all.length];
  const target = exploreTarget(project);

  return (
    <article>
      <header className="shell pt-[calc(68px+2.5rem)] md:pt-[calc(68px+4.5rem)]">
        <Link href="/projects" className="t-label inline-flex items-center gap-2 py-2 text-dim hover:text-white">
          <ArrowLeft className="size-3.5" /> {project.kind === 'venture' ? 'Kesera Ventures' : 'Client projects'}
        </Link>
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href={`/${division.slug}`} className="t-label flex items-center gap-2 text-dim hover:text-white">
            <Dot color={division.accent} size={7} /> {division.name}
          </Link>
          <StatusTag status={project.status} />
          {project.client && <span className="t-label text-faint">Client · {project.client}</span>}
        </div>
        <p className="t-title mt-10 text-dim">{project.name}</p>
        <h1 className="t-display-xl mt-4 text-[clamp(2.6rem,7.4vw,7.6rem)]">
          <Lines text={project.headline} />
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-lead text-dim">{project.summary}</p>
            <StoreButtons links={project.links} name={project.name} className="mt-8" />
            {project.links?.website && (
              <a href={project.links.website} target="_blank" rel="noreferrer" className="t-label mt-5 inline-flex items-center gap-2 py-2 text-white hover:text-signal-soft">
                Visit {project.links.website.replace(/^https?:\/\//, '')} <ArrowRight className="size-3.5 -rotate-45" />
              </a>
            )}
          </div>
          <div className="flex flex-col gap-3 md:col-span-4 md:col-start-9 md:items-end">
            {target.href !== `/projects/${project.slug}` && <Cta href={target.href} variant="ghost">{target.label}</Cta>}
            <Cta href="/start">Start a project</Cta>
          </div>
        </div>
      </header>

      {project.visual !== 'none' && (
        <Reveal className="shell mt-16 md:mt-24">
          <SchematicFrame note="Concept schematic">
            <ProjectVisual visual={project.visual} />
          </SchematicFrame>
        </Reveal>
      )}

      <section className="shell mt-20 md:mt-28" aria-labelledby="stage-title">
        <div className="rounded-[6px] border border-hair p-6 md:p-10">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="stage-title" className="t-label text-white">Where it stands</h2>
            <p className="text-sm text-dim">Updated as the project moves. We show stages, not promises.</p>
          </div>
          <StageTracker status={project.status} accent={division.accent} />
        </div>
      </section>

      <div className="shell section">
        {project.sections.map((s, i) => (
          <Reveal key={s.title} as="section" className="grid gap-6 border-t border-hair py-12 md:grid-cols-12 md:py-16">
            <div className="md:col-span-4">
              <Label index={String(i + 1).padStart(2, '0')}>{s.title}</Label>
            </div>
            <p className="t-lead text-white/85 md:col-span-7 md:col-start-6">{s.text}</p>
          </Reveal>
        ))}

        {project.capabilities.length > 0 && (
          <Reveal as="section" className="grid gap-6 border-t border-hair py-12 md:grid-cols-12 md:py-16">
            <div className="md:col-span-4">
              <Label index={String(project.sections.length + 1).padStart(2, '0')}>What it does</Label>
            </div>
            <ul className="grid border-l border-t border-hair sm:grid-cols-2 md:col-span-7 md:col-start-6">
              {project.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 border-b border-r border-hair p-5 text-[0.95rem]">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: division.accent }} />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      {next && next.slug !== project.slug && (
        <Link href={`/projects/${next.slug}`} className="group/next block border-t border-hair">
          <div className="shell flex items-center justify-between gap-6 py-14 md:py-20">
            <div>
              <p className="t-label text-faint">Next project</p>
              <p className="t-display-m mt-4 transition-colors group-hover/next:text-signal-soft">{next.name}</p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-hair transition-colors group-hover/next:border-white group-hover/next:bg-white group-hover/next:text-void">
              <ArrowRight className="size-5" />
            </span>
          </div>
        </Link>
      )}
    </article>
  );
}
