import { Cta, HorizonLine } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { COMPANY } from '@/content/site';

export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative border-t border-hair py-[var(--section)]">
      <div className="shell grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MaskLines id="closing-title" as="h2" className="t-display-xl" lines={['Got something', <em key="m">in mind?</em>]} />
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9 lg:self-end">
          <p className="t-lead text-white/80">Tell us about it. We’ll be honest about whether we can help, how long it would take and what it would cost.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Cta href="/start">Start a project</Cta>
            <Cta href={COMPANY.whatsappHref} variant="ghost" external>WhatsApp us</Cta>
          </div>
        </Reveal>
      </div>
      <HorizonLine className="mt-[var(--section)]" />
    </section>
  );
}
