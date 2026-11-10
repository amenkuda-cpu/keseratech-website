import { Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { FOUNDER, SHOW_PLACEHOLDERS } from '@/content/people';
import { PersonFrame } from '@/components/site/people';

// "Who we are": a short first-person note, set against a photo and overlapping it on wide screens.

export function Intro() {
  const withPhoto = !!FOUNDER.photo || SHOW_PLACEHOLDERS;
  return (
    <section id="who-we-are" aria-labelledby="who-title" className="section relative">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-0">
        {withPhoto && (
          <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:mt-24">
            <PersonFrame photo={FOUNDER.photo} label="Photo of Amen, or of the team at work" className="aspect-[4/5] w-full" />
          </Reveal>
        )}

        <Reveal
          delay={0.1}
          className={
            withPhoto
              ? 'relative lg:col-span-7 lg:col-start-5 lg:row-start-1 lg:self-start lg:bg-void lg:p-12 lg:pr-0'
              : 'lg:col-span-7 lg:col-start-3'
          }
        >
          <Label>Who we are</Label>
          <MaskLines id="who-title" as="h2" className="t-display-l mt-8 max-w-[13ch]" lines={['A note', <em key="f">from the founder.</em>]} />
          <div className="mt-10 max-w-[36rem] space-y-5">
            {FOUNDER.note.map((p, i) => (
              <p key={i} className={i === 0 ? 't-lead text-white' : 't-body text-white/75'}>
                {p}
              </p>
            ))}
          </div>
          <p className="mt-8 text-white">
            <span className="font-display text-2xl italic">{FOUNDER.name}</span>
            <span className="t-label ml-3 text-faint">{FOUNDER.role}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
