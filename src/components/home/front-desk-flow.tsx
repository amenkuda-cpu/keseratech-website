import { Cta, Label } from '@/components/system/primitives';
import { MaskLines, Reveal } from '@/components/system/motion';
import { MediaFrame } from '@/components/visuals/media';
import { media } from '@/content/media';

// Sera Front Desk: a short loop of a real receptionist at work, beside what happens on every call.

const STEPS = [
  { label: 'Call', note: 'A customer rings your number.' },
  { label: 'AI answers', note: 'Instantly, in your business’s voice.' },
  { label: 'Understands request', note: 'Finds the customer and what they need.' },
  { label: 'Books / reschedules', note: 'Offers real free slots.' },
  { label: 'Updates system', note: 'Writes to your calendar or CRM.' },
  { label: 'Confirms', note: 'Tells the caller and sends an SMS.' },
  { label: 'Logs interaction', note: 'Every call recorded and searchable.' },
];

export function FrontDeskFlow({ index = '08', heading = ['Your business.', 'Always answered.'], showLink = true }: { index?: string; heading?: string[]; showLink?: boolean }) {
  return (
    <section aria-labelledby="desk-title" className="section relative overflow-hidden border-t border-hair">
      <div className="shell relative">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Sera Front Desk</Label>
            <MaskLines id="desk-title" as="h2" className="t-display-l mt-10" lines={heading} />
          </div>
          <p className="t-body text-dim md:col-span-4 md:col-start-9">
            An AI receptionist that answers every call, books, reschedules and cancels appointments, captures the caller’s details and updates your systems while you work.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12 lg:items-center lg:gap-14">
          <Reveal className="lg:col-span-7">
            <MediaFrame media={media('front-desk-call')} aspect="16/10" sizes="(min-width: 1024px) 55vw, 100vw" />
          </Reveal>

          <ol className="grid gap-x-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1" aria-label="How a call is handled">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex gap-4 border-t border-hair py-4">
                <span className="t-label w-6 shrink-0 pt-0.5 text-desk">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="t-label text-white">{s.label}</p>
                  <p className="mt-1.5 text-sm text-dim">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Cta href="/start?service=automation&type=receptionist">Build your digital front desk</Cta>
          {showLink && <Cta href="/sera-front-desk" variant="ghost">How it works</Cta>}
        </div>
      </div>
    </section>
  );
}
