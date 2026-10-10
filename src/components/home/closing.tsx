import { Cta, HorizonLine } from '@/components/system/primitives';
import { Magnetic, MaskLines, Reveal } from '@/components/system/motion';

export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative overflow-hidden border-t border-hair pt-[var(--section)]">
      <div className="shell text-center">
        <p className="t-label text-dim">Kesera</p>
        <MaskLines
          id="closing-title"
          as="h2"
          className="t-display-xl mx-auto mt-10 text-[clamp(2.6rem,9vw,9rem)]"
          lines={['Build.', 'Develop.', 'Scale.']}
        />
        <Reveal>
          <p className="t-lead mx-auto mt-10 max-w-md text-dim">Technology for what comes next.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <Cta href="/start">Start a project</Cta>
            </Magnetic>
            <Cta href="/projects" variant="ghost">Explore our technology</Cta>
          </div>
        </Reveal>
      </div>
      <div aria-hidden className="pointer-events-none mx-auto mt-[calc(var(--section)*0.8)] h-40 w-full max-w-5xl bg-[radial-gradient(50%_100%_at_50%_100%,rgb(26_134_250/0.22),transparent)]" />
      <HorizonLine />
    </section>
  );
}
