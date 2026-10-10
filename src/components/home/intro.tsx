import { Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';

const DISCIPLINES = ['Software', 'Artificial intelligence', 'Automation', 'Engineering', 'Energy', 'Agriculture', 'Smart living', 'Recycling & reuse'];

export function Intro() {
  return (
    <section aria-label="About Kesera" className="section relative">
      <div className="shell">
        <Label index="01">Kesera</Label>
        <MaskLines
          as="h2"
          className="t-display-l mt-10 max-w-[14ch] md:mt-14"
          lines={['More than', 'one technology.']}
        />

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12">
          <Reveal className="md:col-span-5 md:col-start-6 lg:col-span-4 lg:col-start-6">
            <p className="t-lead text-white">
              Kesera Technologies brings together software, artificial intelligence, engineering and innovation across multiple industries.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5 md:col-start-6 lg:col-span-3 lg:col-start-10">
            <p className="t-body text-dim">
              We build technology that solves practical problems — from smarter farming and digital platforms to intelligent business systems, future mobility and homes made from what others throw away.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ol className="mt-20 grid grid-cols-2 border-t border-hair sm:grid-cols-4 md:mt-28 lg:grid-cols-8" aria-label="Disciplines">
            {DISCIPLINES.map((d, i) => (
              <li key={d} className="border-b border-hair py-5 pr-4 lg:border-b-0 lg:border-r lg:pl-4 lg:first:pl-0 lg:last:border-r-0">
                <span className="t-label text-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-3 block text-sm text-white">{d}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
