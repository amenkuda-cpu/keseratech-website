'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { Check } from 'lucide-react';
import { Cta, Label } from '@/components/system/primitives';
import { MaskLines } from '@/components/system/motion';
import { cn } from '@/lib/utils';

// Illustrative conversations showing what an assistant does behind the reply: it acts in your systems.

type Turn = { from: 'person' | 'assistant'; text: string };
type Scenario = { id: string; tab: string; context: string; turns: Turn[]; actions: string[] };

const SCENARIOS: Scenario[] = [
  {
    id: 'customers',
    tab: 'Customer questions',
    context: 'Hardware store · WhatsApp',
    turns: [
      { from: 'person', text: 'Hi, do you have 20 litre white paint? Can you deliver to Avondale?' },
      { from: 'assistant', text: 'Yes, 20 L white is in stock at our Belvedere branch for $68. We can deliver to Avondale tomorrow from 9am. Shall I reserve one for you?' },
      { from: 'person', text: 'Yes please, tomorrow morning.' },
      { from: 'assistant', text: 'Done. One tin is reserved under this number and delivery is booked for 9–11am tomorrow.' },
    ],
    actions: ['Checked stock at Belvedere branch', 'Reserved 1 × white 20 L', 'Booked delivery 09:00–11:00', 'Sent confirmation on WhatsApp'],
  },
  {
    id: 'sales',
    tab: 'Sales enquiries',
    context: 'Conference venue · website chat',
    turns: [
      { from: 'person', text: 'We need a venue for 120 people on 14 March.' },
      { from: 'assistant', text: 'The Main Hall seats 120 and is free on 14 March. Is it a conference, a wedding or something else?' },
      { from: 'person', text: 'A full-day conference, with lunch.' },
      { from: 'assistant', text: 'Thank you. Our events team will send a quote today. Which email should it go to?' },
    ],
    actions: ['Checked the calendar for 14 March', 'Qualified: conference, 120 guests, catering', 'Created a lead in the CRM', 'Assigned to the events team'],
  },
  {
    id: 'operations',
    tab: 'Internal operations',
    context: 'Distributor · staff assistant',
    turns: [
      { from: 'person', text: 'How many orders are still waiting for delivery today?' },
      { from: 'assistant', text: '14 are waiting: 9 in Harare and 5 in Bulawayo. 3 are more than a day old. Shall I flag them to dispatch?' },
      { from: 'person', text: 'Yes, flag them.' },
      { from: 'assistant', text: 'Flagged. Dispatch has the 3 orders, and those customers have been told to expect a call.' },
    ],
    actions: ['Queried the order system', 'Found 3 late orders', 'Notified dispatch', 'Messaged 3 customers'],
  },
];

function Conversation({ scenario, play }: { scenario: Scenario; play: boolean }) {
  const reduce = useReducedMotion();
  const total = scenario.turns.length;
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(total);
      return;
    }
    if (!play) return;
    setShown(0);
    const timers: number[] = [];
    let t = 300;
    scenario.turns.forEach((turn, i) => {
      if (turn.from === 'assistant') {
        timers.push(window.setTimeout(() => setTyping(true), t));
        t += 1100;
      }
      timers.push(window.setTimeout(() => { setTyping(false); setShown(i + 1); }, t));
      t += turn.from === 'assistant' ? 900 : 1000;
    });
    return () => timers.forEach(clearTimeout);
  }, [scenario, play, reduce, total]);

  const actionsDone = Math.round((Math.min(shown, total) / total) * scenario.actions.length);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="flex min-h-[440px] flex-col rounded-[6px] border border-hair bg-deep/60 lg:col-span-3">
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <p className="t-label text-dim">{scenario.context}</p>
          <p className="t-label flex items-center gap-2 text-assist">
            <span className="status-live size-1.5 rounded-full bg-assist" aria-hidden /> Assistant
          </p>
        </div>
        <ol className="flex flex-1 flex-col gap-3 p-5" aria-live="polite">
          {scenario.turns.slice(0, shown).map((turn, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                'max-w-[85%] rounded-[10px] px-4 py-3 text-[0.94rem] leading-relaxed',
                turn.from === 'person' ? 'self-end rounded-br-[3px] bg-white/[0.07] text-white' : 'self-start rounded-bl-[3px] border border-assist/30 bg-assist/[0.08] text-white',
              )}
            >
              <span className="sr-only">{turn.from === 'person' ? 'Customer: ' : 'Assistant: '}</span>
              {turn.text}
            </motion.li>
          ))}
          {typing && (
            <li aria-hidden className="flex gap-1 self-start rounded-[10px] border border-assist/30 bg-assist/[0.08] px-4 py-4">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-assist" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </li>
          )}
        </ol>
      </div>

      <div className="rounded-[6px] border border-hair p-5 lg:col-span-2">
        <p className="t-label text-faint">Done behind the reply</p>
        <ul className="mt-5 space-y-3">
          {scenario.actions.map((a, i) => {
            const done = i < actionsDone;
            return (
              <li key={a} className={cn('flex items-start gap-3 text-sm transition-colors duration-500', done ? 'text-white' : 'text-white/30')}>
                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500', done ? 'border-assist bg-assist text-void' : 'border-hair')}>
                  {done && <Check className="size-3" strokeWidth={3} />}
                </span>
                {a}
              </li>
            );
          })}
        </ul>
        <p className="mt-8 border-t border-hair pt-5 text-xs leading-relaxed text-faint">
          Illustrative example. Assistants are connected to the systems you already use, and hand over to a person whenever they should.
        </p>
      </div>
    </div>
  );
}

export function AssistantsDemo({ index = '07', heading = ['Intelligence', 'that works.'], showLink = true }: { index?: string; heading?: string[]; showLink?: boolean }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const scenario = SCENARIOS[active]!;

  return (
    <section aria-labelledby="assist-title" className="section border-t border-hair">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Label index={index}>Sera Assistants</Label>
            <MaskLines id="assist-title" as="h2" className="t-display-l mt-10" lines={heading} />
          </div>
          <div className="md:col-span-5">
            <p className="t-body text-dim">
              AI assistants that answer customers, qualify enquiries and take routine work off people’s desks, on WhatsApp, on your website and inside your business systems.
            </p>
            {showLink && <Cta href="/sera-assistants" variant="text" className="mt-6">Explore Sera Assistants</Cta>}
          </div>
        </div>

        <div ref={ref} className="mt-14 md:mt-20">
          <div role="tablist" aria-label="Example conversations" className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {SCENARIOS.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={i === active}
                aria-controls={`panel-${s.id}`}
                onClick={() => setActive(i)}
                className={cn(
                  't-label min-h-11 shrink-0 rounded-full border px-4 transition-colors',
                  i === active ? 'border-white/40 bg-white text-void' : 'border-hair text-dim hover:text-white',
                )}
              >
                {s.tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scenario.id} role="tabpanel" id={`panel-${scenario.id}`} aria-labelledby={`tab-${scenario.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <Conversation scenario={scenario} play={inView} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
