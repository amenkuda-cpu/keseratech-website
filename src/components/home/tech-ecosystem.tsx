import { Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { MediaFrame } from '@/components/visuals/media';
import { media } from '@/content/media';

// Technology that leaves the screen: six real-world problems, each shown with a photograph.

const SOLUTIONS = [
  { what: 'Farms that use water only where crops need it', who: 'AgriSera', image: 'farmer-inspecting' },
  { what: 'Food, parcels and errands moved across town', who: 'BikerDash', image: 'delivery-rider' },
  { what: 'Charging that makes electric vehicles practical', who: 'Sera Energy', image: 'ev-chargers' },
  { what: 'Phones answered and bookings made, day and night', who: 'Sera Front Desk', image: 'call-agent' },
  { what: 'Businesses run on software built around them', who: 'Sera Tech', image: 'developer-nairobi' },
  { what: 'Homes, gyms and offices made from shipping containers; furniture and handwashing stations from oil drums', who: 'Sera Home', image: 'container-home' },
];

export function TechEcosystem({ index = '06' }: { index?: string }) {
  return (
    <section aria-labelledby="eco-title" className="section relative">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Label index={index}>Technology ecosystem</Label>
            <MaskLines id="eco-title" as="h2" className="t-display-l mt-10" lines={['The problems', <em key="p">we care about.</em>]} />
          </div>
          <p className="t-body text-dim md:col-span-4">
            Technology should leave the screen. Every capability at Kesera exists to change something physical: water, roads, power, buildings, waste and the working day.
          </p>
        </div>

        <ul className="mt-16 grid gap-x-5 gap-y-10 sm:grid-cols-2 md:mt-24 lg:grid-cols-3" aria-label="Real-world solutions">
          {SOLUTIONS.map((s, i) => (
            <Reveal as="li" key={s.who} delay={(i % 3) * 0.06}>
              <MediaFrame media={media(s.image)} aspect="4/3" sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw" />
              <p className="mt-5 text-[1.02rem] leading-snug text-white">{s.what}</p>
              <p className="t-label mt-3 text-faint">{s.who}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
