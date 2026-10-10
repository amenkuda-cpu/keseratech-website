'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CalendarClock, PhoneIncoming } from 'lucide-react';
import { Cta, Label } from '@/components/system/primitives';
import { MaskLines } from '@/components/system/motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// One timed sequence: a call comes in and the seven steps light up as the console fills.

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
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('[data-step-row]');
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5, paused: true, defaults: { ease: 'power3.out' } });

        // reset state at the start of each loop
        tl.set('[data-reveal]', { autoAlpha: 0, y: 10 });
        tl.set(steps, { '--on': 0 });
        tl.set('[data-wave]', { scaleY: 0.15 });
        tl.set('[data-timer]', { textContent: '0:00' });

        const at = [0, 1.2, 2.9, 5.0, 7.4, 8.8, 10.6];
        steps.forEach((row, i) => {
          tl.to(row, { '--on': 1, duration: 0.4 }, at[i]);
          const reveals = scope.current!.querySelectorAll(`[data-reveal="${i}"]`);
          if (reveals.length) tl.to(reveals, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.7 }, at[i]! + 0.15);
        });
        // voice activity while the call is live
        tl.to('[data-wave]', { scaleY: () => gsap.utils.random(0.2, 1), duration: 0.18, repeat: 50, yoyo: true, stagger: { each: 0.03, from: 'random' }, ease: 'sine.inOut' }, 1.2);
        tl.to('[data-wave]', { scaleY: 0.15, duration: 0.4 }, 11.4);
        tl.to('[data-timer]', { duration: 11, ease: 'none', onUpdate() { const s = Math.floor(this.progress() * 134); const el = scope.current?.querySelector('[data-timer]'); if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; } }, 0.5);
        tl.to({}, { duration: 1 }, 12);

        ScrollTrigger.create({
          trigger: scope.current,
          start: 'top 70%',
          end: 'bottom 20%',
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section aria-labelledby="desk-title" className="section relative overflow-hidden border-t border-hair">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(60%_60%_at_70%_0%,rgb(156_155_255/0.08),transparent)]" />
      <div ref={scope} className="shell relative">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Sera Front Desk</Label>
            <MaskLines id="desk-title" as="h2" className="t-display-l mt-10" lines={heading} />
          </div>
          <p className="t-body text-dim md:col-span-4 md:col-start-9">
            An AI receptionist that answers every call, books, reschedules and cancels appointments, captures the caller’s details and updates your systems while you work.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* Step rail */}
          <ol className="lg:col-span-5" aria-label="How a call is handled">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                data-step-row
                style={{ '--on': 1 } as React.CSSProperties}
                className="relative grid grid-cols-[2.25rem_1fr] gap-x-4 pb-6 last:pb-0"
              >
                {i < STEPS.length - 1 && <span aria-hidden className="absolute left-[1.06rem] top-9 bottom-0 w-px bg-white/10" />}
                <span
                  aria-hidden
                  className="relative z-10 grid size-9 place-items-center rounded-full border font-mono text-[0.7rem] transition-none"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-desk) calc(var(--on) * 100%), rgb(255 255 255 / 0.15))',
                    background: 'color-mix(in srgb, var(--color-desk) calc(var(--on) * 100%), #05060b)',
                    color: 'color-mix(in srgb, #05060b calc(var(--on) * 100%), rgb(255 255 255 / 0.5))',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-1.5" style={{ opacity: 'calc(0.35 + var(--on) * 0.65)' as unknown as number }}>
                  <p className="t-label text-white">{s.label}</p>
                  <p className="mt-1.5 text-sm text-dim">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Call console */}
          <div className="rounded-[8px] border border-hair bg-deep/70 lg:col-span-7" aria-label="Example call">
            <div className="flex items-center justify-between gap-4 border-b border-hair px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-desk/15 text-desk">
                  <PhoneIncoming className="size-4" />
                </span>
                <div>
                  <p className="text-sm text-white">Dental clinic · incoming call</p>
                  <p className="t-label text-faint">+263 77 ••• 4521</p>
                </div>
              </div>
              <p className="t-label tabular-nums text-dim" data-timer>2:14</p>
            </div>

            <div className="flex h-12 items-center gap-[3px] border-b border-hair px-5" aria-hidden>
              {Array.from({ length: 48 }, (_, i) => (
                <span key={i} data-wave className="h-7 w-[3px] origin-center rounded-full bg-desk/70" style={{ transform: `scaleY(${[0.3, 0.6, 0.9, 0.5, 0.2, 0.7][i % 6]})` }} />
              ))}
            </div>

            <div className="space-y-3 p-5 text-[0.93rem] leading-relaxed">
              <p data-reveal="1" className="max-w-[85%] rounded-[10px] rounded-bl-[3px] border border-desk/30 bg-desk/[0.08] px-4 py-3 text-white">
                <span className="t-label mb-1 block text-desk">AI receptionist</span>
                Good morning, thank you for calling. How can I help?
              </p>
              <p data-reveal="2" className="ml-auto max-w-[85%] rounded-[10px] rounded-br-[3px] bg-white/[0.07] px-4 py-3 text-white">
                <span className="t-label mb-1 block text-faint">Caller</span>
                Hi, I need to move my check-up on Thursday to next week.
              </p>
              <p data-reveal="2" className="t-label flex flex-wrap gap-2 text-dim">
                <span className="rounded-sm border border-hair px-2 py-1">Intent · reschedule</span>
                <span className="rounded-sm border border-hair px-2 py-1">Patient found · T. Moyo</span>
              </p>
              <p data-reveal="3" className="max-w-[85%] rounded-[10px] rounded-bl-[3px] border border-desk/30 bg-desk/[0.08] px-4 py-3 text-white">
                Of course. I have Tuesday at 10:30 or Wednesday at 14:00. Which suits you?
              </p>
              <p data-reveal="3" className="ml-auto max-w-[85%] rounded-[10px] rounded-br-[3px] bg-white/[0.07] px-4 py-3 text-white">Tuesday at 10:30, please.</p>
              <div data-reveal="4" className="flex items-center gap-3 rounded-[6px] border border-desk/40 px-4 py-3">
                <CalendarClock className="size-4 shrink-0 text-desk" />
                <p className="text-sm text-white">
                  Calendar updated <span className="text-faint">·</span> <span className="text-faint line-through">Thu 09:00</span> → Tue 10:30
                </p>
              </div>
              <p data-reveal="5" className="max-w-[85%] rounded-[10px] rounded-bl-[3px] border border-desk/30 bg-desk/[0.08] px-4 py-3 text-white">
                You’re booked for Tuesday at 10:30. I’ve sent you an SMS confirmation.
              </p>
              <p data-reveal="6" className="t-label flex items-center justify-between rounded-sm bg-white/[0.04] px-3 py-2.5 text-dim">
                <span>Logged · rescheduled</span>
                <span>2 min 14 s</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Cta href="/start?service=automation&type=receptionist">Build your digital front desk</Cta>
          {showLink && <Cta href="/sera-front-desk" variant="ghost">How it works</Cta>}
        </div>
        <p className="mt-6 text-xs text-faint">Illustrative call. Sera Front Desk is set up for each business, its services and its calendar.</p>
      </div>
    </section>
  );
}
