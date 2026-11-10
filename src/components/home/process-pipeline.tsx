import { PIPELINE } from '@/content/site';
import { Cta, Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { MediaFrame } from '@/components/visuals/media';
import { media } from '@/content/media';

// Idea → scale: a photograph of the work beside the eight stages every project moves through.
// `markers` pins live projects to the stage they are in.

export function ProcessPipeline({ markers, index = '09', more = false }: { markers: { stage: string; names: string[] }[]; index?: string; more?: boolean }) {
  return (
    <section aria-labelledby="process-title" className="section border-t border-hair">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Innovation pipeline</Label>
            <MaskLines id="process-title" as="h2" className="t-display-l mt-10" lines={['From idea', 'to scale.']} />
          </div>
          <p className="t-body text-dim md:col-span-4 md:col-start-9">
            Every Kesera product, and every client project, moves through the same stages. Nothing skips testing, and nothing is called finished before it is deployed and supported.
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28">
              <MediaFrame media={media('team-workshop')} aspect="auto" className="aspect-[16/10] lg:aspect-[4/5]" sizes="(min-width: 1024px) 38vw, 100vw" />
            </Reveal>
          </div>

          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7" aria-label="Stages">
            {PIPELINE.map((stage, i) => {
              const marker = markers.find((m) => m.stage === stage.id);
              return (
                <li key={stage.id} className="flex gap-4 border-t border-hair py-6">
                  <span className="t-label w-6 shrink-0 pt-1 text-signal-soft">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <p className="t-title text-[1.05rem]">{stage.label}</p>
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
