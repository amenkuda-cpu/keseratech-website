import Link from 'next/link';
import type { Project } from '@/lib/db';
import { divisionBySlug, type ProjectStatus } from '@/content/site';
import { Dot, Label, StatusTag } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';

// "More is coming": every published venture placed in a lane by its status. Driven by the projects CMS,
// so a new project appears here as soon as it is published in the admin. Empty lanes say so honestly.

const LANES: { id: string; title: string; statuses: ProjectStatus[]; empty: string }[] = [
  { id: 'research', title: 'In research', statuses: ['CONCEPT', 'RESEARCH'], empty: 'New ideas are researched before they are announced.' },
  { id: 'development', title: 'In development', statuses: ['PROTOTYPE', 'IN_DEVELOPMENT'], empty: 'Nothing in development right now.' },
  { id: 'pilot', title: 'Piloting', statuses: ['PILOT'], empty: 'No pilots yet. The first will be announced here.' },
  { id: 'soon', title: 'Coming soon', statuses: ['COMING_SOON'], empty: 'Launch dates are announced only when they are confirmed.' },
  { id: 'active', title: 'Active', statuses: ['ACTIVE'], empty: 'Nothing operating yet.' },
];

export function FutureBoard({ projects, index = '04' }: { projects: Project[]; index?: string }) {
  return (
    <section aria-labelledby="future-title" className="section border-t border-hair">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Innovation pipeline</Label>
            <MaskLines id="future-title" as="h2" className="t-display-l mt-10" lines={['More is', 'coming.']} />
          </div>
          <p className="t-body text-dim md:col-span-4 md:col-start-9">
            Every Kesera project, where it really stands. New work appears here as it moves from research into development and out into the world.
          </p>
        </div>

        <Reveal>
          <div
            className="relative -mx-[var(--gutter)] mt-16 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:thin] md:mx-0 md:mt-20 md:grid md:grid-cols-5 md:overflow-visible md:px-0"
            role="list"
            aria-label="Projects by stage"
          >
            {LANES.map((lane) => {
              const items = projects.filter((p) => lane.statuses.includes(p.status));
              return (
                <div key={lane.id} role="listitem" className={`${items.length === 0 ? 'hidden md:flex' : 'flex'} w-[78vw] shrink-0 snap-start flex-col rounded-[6px] border border-hair bg-deep/40 p-4 sm:w-[44vw] md:w-auto`}>
                  <div className="flex items-center justify-between border-b border-hair pb-4">
                    <p className="t-label text-white">{lane.title}</p>
                    <span className="t-label text-faint">{String(items.length).padStart(2, '0')}</span>
                  </div>
                  <ul className="mt-4 flex flex-1 flex-col gap-3">
                    {items.map((p) => {
                      const d = divisionBySlug(p.division)!;
                      return (
                        <li key={p.slug}>
                          <Link
                            href={`/projects/${p.slug}`}
                            className="group/card block rounded-[4px] border border-hair bg-void p-4 transition-colors duration-300 hover:border-white/30"
                          >
                            <p className="t-label flex items-center gap-2 text-faint">
                              <Dot color={d.accent} size={6} /> {d.name}
                            </p>
                            <p className="t-title mt-4 text-[1.2rem]">{p.name}</p>
                            <p className="mt-1.5 text-sm text-dim">{p.tagline}</p>
                            <StatusTag status={p.status} className="mt-5" />
                          </Link>
                        </li>
                      );
                    })}
                    {items.length === 0 && (
                      <li className="flex flex-1 items-center rounded-[4px] border border-dashed border-hair p-4 text-sm leading-relaxed text-faint">
                        {lane.empty}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
          {/* Phones show only lanes with projects; say plainly which stages are empty. */}
          {(() => {
            const empty = LANES.filter((l) => !projects.some((p) => l.statuses.includes(p.status))).map((l) => l.title.toLowerCase());
            return empty.length ? (
              <p className="mt-4 text-sm text-faint md:hidden">Nothing {empty.join(', ').replace(/, ([^,]*)$/, ' or $1')} yet.</p>
            ) : null;
          })()}
        </Reveal>
      </div>
    </section>
  );
}
