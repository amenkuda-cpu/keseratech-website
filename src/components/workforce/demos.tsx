'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Pause, Play, RotateCcw } from 'lucide-react';

/**
 * "Watch it work": one simulated job per AI employee: request, steps, finished output.
 * Every business, person and figure here is fictional sample data and is labelled as such.
 * Each scenario uses abilities the workforce app really has (documents, spreadsheets,
 * web research, knowledge-base replies, email and calendar drafts held for approval).
 */

type Demo = {
  key: string;
  name: string;
  role: string;
  request: string;
  files?: string[];
  steps: string[];
  app: string;
  file: string;
  result: string;
  body: (at: (n: number) => boolean) => ReactNode;
};

function Show({ on, children, className = '' }: { on: boolean; children: ReactNode; className?: string }) {
  return <div className={`transition-all duration-500 ${on ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'} ${className}`}>{children}</div>;
}

function Approve({ on, label = 'Approve & send' }: { on: boolean; label?: string }) {
  return (
    <Show on={on} className="mt-4 flex flex-wrap items-center gap-2">
      <span className="rounded bg-[#1a86fa] px-3 py-1.5 text-[11px] font-semibold text-white">{label}</span>
      <span className="rounded border border-black/15 px-3 py-1.5 text-[11px] font-semibold text-[#0b1220]">Edit</span>
      <span className="text-[11px] text-black/50">Waiting for your OK</span>
    </Show>
  );
}

const th = 'border-b border-black/10 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-black/45';
const td = 'border-b border-black/5 py-1.5';

const DEMOS: Demo[] = [
  {
    key: 'sarah',
    name: 'Sarah',
    role: 'Executive Assistant',
    request: 'The board meeting has moved to Thursday at 10:00. Update my calendar and let the board know.',
    steps: ['Finding the meeting in your calendar', 'Preparing the move to Thursday 10:00', 'Checking for clashes', 'Drafting the note to 5 board members', 'Holding both for your OK'],
    app: 'Calendar and email',
    file: 'Board meeting update',
    result: 'Calendar change and email ready. Nothing is sent until you approve.',
    body: (at) => (
      <div className="space-y-4 text-[12.5px] text-[#0b1220]">
        <Show on={at(2)}>
          <div className="rounded-md border border-black/10">
            <div className="border-b border-black/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-black/45">Thursday</div>
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="w-12 text-black/50">10:00</span>
              <span className="flex-1 rounded bg-[#1a86fa]/12 px-2 py-1 font-medium text-[#0a5fe0]">Board meeting (moved from Tuesday)</span>
            </div>
            <Show on={at(3)}>
              <div className="flex items-center gap-3 px-3 pb-2">
                <span className="w-12 text-black/50">10:30</span>
                <span className="flex-1 rounded bg-amber-100 px-2 py-1 text-amber-900">Supplier call: clashes. Flagged for you to decide.</span>
              </div>
            </Show>
          </div>
        </Show>
        <Show on={at(4)}>
          <div className="rounded-md border border-black/10 p-3">
            <p className="text-black/50">To: 5 board members</p>
            <p className="font-semibold">Subject: Board meeting moved to Thursday, 10:00</p>
            <p className="mt-2 leading-relaxed text-black/75">
              Good afternoon. This week&apos;s board meeting has moved from Tuesday to Thursday at 10:00, same venue. The agenda is unchanged. Please let me know if the new time
              does not suit you.
            </p>
          </div>
        </Show>
        <Approve on={at(5)} label="Approve both" />
      </div>
    ),
  },
  {
    key: 'alex',
    name: 'Alex',
    role: 'Sales Executive',
    request: 'Quote Chiedza Lodge for 20 solar floodlights with brackets and installation, from our price list.',
    files: ['price-list.xlsx'],
    steps: ['Reading your price list', 'Pricing 3 line items', 'Checking every total', 'Writing the quotation', 'Drafting the cover email'],
    app: 'Document',
    file: 'Chiedza Lodge quotation.docx',
    result: 'Quotation with checked totals, plus a cover email held for your OK.',
    body: (at) => (
      <div className="text-[12.5px] text-[#0b1220]">
        <Show on={at(1)}>
          <p className="text-[17px] font-semibold">Quotation Q-0142</p>
          <p className="text-black/55">Zuva Solar · Prepared for Chiedza Lodge</p>
        </Show>
        <table className="mt-4 w-full tabular-nums">
          <thead>
            <tr>
              <th className={th}>Item</th>
              <th className={`${th} text-right`}>Qty</th>
              <th className={`${th} text-right`}>Unit</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className={`transition-opacity duration-500 ${at(2) ? 'opacity-100' : 'opacity-0'}`}>
            <tr><td className={td}>Solar floodlight 100 W</td><td className={`${td} text-right`}>20</td><td className={`${td} text-right`}>$45.00</td><td className={`${td} text-right`}>$900.00</td></tr>
            <tr><td className={td}>Mounting brackets</td><td className={`${td} text-right`}>20</td><td className={`${td} text-right`}>$6.50</td><td className={`${td} text-right`}>$130.00</td></tr>
            <tr><td className={td}>Installation (2 days)</td><td className={`${td} text-right`}>1</td><td className={`${td} text-right`}>$240.00</td><td className={`${td} text-right`}>$240.00</td></tr>
          </tbody>
        </table>
        <Show on={at(3)} className="mt-2 flex justify-end gap-6 font-semibold tabular-nums">
          <span>Total</span>
          <span>$1,270.00</span>
        </Show>
        <Show on={at(4)}>
          <p className="mt-3 text-black/60">Valid for 14 days. Installation within 5 working days of deposit.</p>
        </Show>
        <Show on={at(5)}>
          <p className="mt-4 rounded-md border border-black/10 p-3 text-black/75">
            <span className="font-semibold text-[#0b1220]">Cover email:</span> &ldquo;Good morning. Please find attached our quotation for the floodlights at Chiedza Lodge…&rdquo;
          </p>
        </Show>
        <Approve on={at(5)} />
      </div>
    ),
  },
  {
    key: 'maya',
    name: 'Maya',
    role: 'Marketing Manager',
    request: 'Write a week of Facebook posts for our December sale: up to 30% off, ends 7 December.',
    files: ['brand-notes.docx'],
    steps: ['Reading your brand notes', 'Planning the week', 'Writing 5 posts', 'Adding calls to action', 'Saving the content calendar'],
    app: 'Document',
    file: 'December sale posts.docx',
    result: 'A five-day content calendar in your brand voice, ready for you to post.',
    body: (at) => {
      const posts = [
        ['Mon', 'Sale launch', 'Our December sale starts today! Up to 30% off dresses, shoes and bags until 7 December.'],
        ['Tue', 'Best seller', 'Our best-selling wrap dress is now 25% off. Sizes 8 to 18, in store and on WhatsApp.'],
        ['Wed', 'Behind the scenes', 'Meet the team packing your orders this week. Thank you for shopping local!'],
        ['Thu', 'Gift ideas', 'Stuck on Christmas gifts? Five picks under $30, all in the sale.'],
        ['Fri', 'Last call', 'The sale ends on 7 December. Come in this weekend before your size is gone.'],
      ];
      return (
        <div className="text-[12.5px] text-[#0b1220]">
          <Show on={at(2)}>
            <p className="text-[17px] font-semibold">Rufaro Boutique · December sale</p>
            <p className="text-black/55">Facebook, week 1</p>
          </Show>
          <ul className="mt-3 space-y-2">
            {posts.map(([day, theme, text], i) => (
              <li key={day} className={`flex gap-3 rounded-md border border-black/10 p-2.5 transition-all duration-500 ${at(3) || (at(2) && i < 2) ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-9 shrink-0 font-semibold text-[#0a5fe0]">{day}</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-black/45">{theme}</span>
                  {text}
                  {at(4) && <span className="text-[#0a5fe0]"> Shop now →</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    },
  },
  {
    key: 'james',
    name: 'James',
    role: 'Customer Support',
    request: 'Answer Tatenda’s question about delivery to Bulawayo.',
    steps: ['Reading the customer’s message', 'Searching your delivery policy', 'Found: Bulawayo, 2–3 working days', 'Writing the reply', 'Holding the reply for your OK'],
    app: 'Support inbox',
    file: 'Delivery to Bulawayo?',
    result: 'A reply taken from your own policy, never guessed, waiting for your OK.',
    body: (at) => (
      <div className="space-y-3 text-[12.5px] text-[#0b1220]">
        <Show on={at(1)}>
          <div className="max-w-[85%] rounded-md bg-black/[0.05] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/45">Tatenda M.</p>
            Hi, do you deliver to Bulawayo? How long does it take and how much is it?
          </div>
        </Show>
        <Show on={at(3)}>
          <div className="rounded-md border border-dashed border-[#1a86fa]/50 bg-[#1a86fa]/[0.06] p-3 text-[12px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0a5fe0]">From your knowledge: Delivery policy</p>
            Bulawayo: 2–3 working days. $10 flat fee, free on orders over $150.
          </div>
        </Show>
        <Show on={at(4)}>
          <div className="ml-auto max-w-[85%] rounded-md bg-[#1a86fa] p-3 text-white">
            Hi Tatenda, yes, we deliver to Bulawayo! It takes 2–3 working days and costs $10. Delivery is free on orders over $150. Would you like me to help you place an order?
          </div>
        </Show>
        <Approve on={at(5)} label="Approve & reply" />
      </div>
    ),
  },
  {
    key: 'daniel',
    name: 'Daniel',
    role: 'Research Analyst',
    request: 'Compare three fibre internet plans for our 10-person office and recommend one.',
    steps: ['Searching for business fibre plans', 'Reading 3 provider pages', 'Comparing price, speed and contract', 'Working out first-year cost', 'Writing the summary with sources'],
    app: 'Spreadsheet',
    file: 'Fibre plans comparison.xlsx',
    result: 'A side-by-side comparison with the sources kept, and a recommendation.',
    body: (at) => (
      <div className="text-[12.5px] text-[#0b1220]">
        <table className="w-full tabular-nums">
          <thead>
            <tr>
              <th className={th}>Plan</th>
              <th className={`${th} text-right`}>Monthly</th>
              <th className={`${th} text-right`}>Speed</th>
              <th className={`${th} text-right`}>Install</th>
              <th className={`${th} text-right`}>Contract</th>
              <th className={`${th} text-right`}>Year one</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Provider A', '$95', '20 Mbps', '$50', '12 mo', '$1,190'],
              ['Provider B', '$120', '30 Mbps', 'Free', '12 mo', '$1,440'],
              ['Provider C', '$89', '15 Mbps', '$80', '24 mo', '$1,148'],
            ].map((r, i) => (
              <tr key={r[0]} className={`transition-opacity duration-500 ${at(2 + (i > 1 ? 1 : 0)) ? 'opacity-100' : 'opacity-0'} ${at(5) && i === 0 ? 'bg-[#1a86fa]/10' : ''}`}>
                {r.map((c, j) => (
                  <td key={j} className={`${td} ${j ? 'text-right' : 'font-medium'} ${j === 5 && !at(4) ? 'text-transparent' : ''}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Show on={at(5)}>
          <p className="mt-4 leading-relaxed">
            <span className="font-semibold">Recommendation: Provider A.</span> C is cheapest in year one but ties you in for 24 months. B is fastest but costs $25 a month more than A.
          </p>
          <p className="mt-2 text-[11px] text-black/50">Sources: 3 provider pages, links kept in the report.</p>
        </Show>
      </div>
    ),
  },
  {
    key: 'grace',
    name: 'Grace',
    role: 'Finance Administrator',
    request: 'Total November’s expenses from these receipts and flag anything unusual.',
    files: ['12 receipt photos'],
    steps: ['Reading 12 receipts', 'Sorting them into categories', 'Adding up each category', 'Checking for duplicates', 'Saving the expense sheet'],
    app: 'Spreadsheet',
    file: 'November expenses.xlsx',
    result: 'Expenses totalled and checked, with one possible duplicate flagged.',
    body: (at) => (
      <div className="text-[12.5px] text-[#0b1220]">
        <table className="w-full tabular-nums">
          <thead>
            <tr>
              <th className={th}>Category</th>
              <th className={`${th} text-right`}>Receipts</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className={`transition-opacity duration-500 ${at(2) ? 'opacity-100' : 'opacity-0'}`}>
            {[
              ['Fuel', '4', '$241.10'],
              ['Electricity', '2', '$120.00'],
              ['Internet', '1', '$85.00'],
              ['Staff meals', '3', '$46.50'],
              ['Office supplies', '2', '$38.75'],
            ].map(([c, n, a]) => (
              <tr key={c} className={c === 'Fuel' && at(4) ? 'bg-amber-100' : ''}>
                <td className={td}>{c}</td>
                <td className={`${td} text-right`}>{n}</td>
                <td className={`${td} text-right ${at(3) ? '' : 'text-transparent'}`}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Show on={at(3)} className="mt-2 flex justify-end gap-6 font-semibold tabular-nums">
          <span>Total · 12 receipts</span>
          <span>$531.35</span>
        </Show>
        <Show on={at(4)}>
          <p className="mt-4 rounded-md bg-amber-100 p-3 text-amber-950">
            <span className="font-semibold">Flag:</span> two fuel receipts of $60.30 on 14 November. Possibly the same receipt photographed twice. Please check before claiming.
          </p>
        </Show>
      </div>
    ),
  },
];

export function WorkforceDemos() {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [reduce, setReduce] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const demo = DEMOS[idx];
  const last = demo.steps.length;
  const done = stage >= last;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduce(true);
      setPlaying(false);
      setStage(DEMOS[0].steps.length);
    }
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const t = setTimeout(
      () => {
        if (stage < last) setStage(stage + 1);
        else {
          setIdx((i) => (i + 1) % DEMOS.length);
          setStage(0);
        }
      },
      stage === 0 ? 1500 : stage < last ? 1200 : 5000,
    );
    return () => clearTimeout(t);
  }, [stage, last, playing, inView]);

  function choose(i: number) {
    setIdx(i);
    setStage(reduce ? DEMOS[i].steps.length : 0);
    if (!reduce) setPlaying(true);
  }

  const at = (n: number) => stage >= n;

  return (
    <div ref={root}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0" role="tablist" aria-label="Choose an AI employee demonstration">
        {DEMOS.map((d, i) => (
          <button
            key={d.key}
            role="tab"
            aria-selected={i === idx}
            onClick={() => choose(i)}
            className={`flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-left transition ${
              i === idx ? 'border-signal bg-signal/15 text-white' : 'border-hair text-dim hover:border-hair-strong hover:text-white'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/workforce/${d.key}.webp`} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold">{d.name}</span>
              <span className="block text-[11px] opacity-70">{d.role}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid overflow-hidden rounded-md border border-hair bg-[#0c1424] lg:grid-cols-[minmax(0,340px)_1fr]" role="tabpanel" aria-label={`${demo.name} demonstration`}>
        {/* Request and progress */}
        <div className="flex flex-col border-b border-hair p-5 lg:border-b-0 lg:border-r">
          <p className="t-label text-faint">Your request</p>
          <p className="mt-2 rounded-md bg-white/[0.06] p-3 text-[14px] leading-relaxed text-white/90">{demo.request}</p>
          {demo.files && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {demo.files.map((f) => (
                <span key={f} className="rounded border border-hair px-2 py-0.5 font-mono text-[11px] text-dim">
                  {f}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/workforce/${demo.key}.webp`} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
            <p className="text-[13px] font-semibold text-white">
              {demo.name} {done ? 'finished' : 'is working'}
              {!done && <span className="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-signal align-middle" />}
            </p>
          </div>
          <ol className="mt-3 space-y-2" aria-live="polite">
            {demo.steps.map((s, i) => {
              const state = i < stage ? 'done' : i === stage ? 'active' : 'todo';
              return (
                <li key={s} className={`flex items-start gap-2.5 text-[13px] transition-colors ${state === 'todo' ? 'text-white/30' : state === 'active' ? 'text-white' : 'text-white/70'}`}>
                  <span
                    className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                      state === 'done' ? 'bg-signal text-white' : state === 'active' ? 'border-2 border-signal border-t-transparent motion-safe:animate-spin' : 'border border-white/20'
                    }`}
                  >
                    {state === 'done' && <Check size={10} strokeWidth={3} aria-hidden />}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-signal transition-all duration-700" style={{ width: `${(stage / last) * 100}%` }} />
          </div>
          <p className={`mt-4 text-[13px] leading-relaxed transition-opacity ${done ? 'text-white/85 opacity-100' : 'opacity-0'}`}>
            <span className="font-semibold text-signal">Done.</span> {demo.result}
          </p>
          <div className="mt-auto flex items-center gap-2 pt-5">
            {!reduce && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="grid size-9 place-items-center rounded-full border border-hair text-white transition hover:border-hair-strong"
                aria-label={playing ? 'Pause demonstration' : 'Play demonstration'}
              >
                {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
              </button>
            )}
            <button
              type="button"
              onClick={() => choose(idx)}
              className="grid size-9 place-items-center rounded-full border border-hair text-white transition hover:border-hair-strong"
              aria-label="Replay demonstration"
            >
              <RotateCcw size={14} aria-hidden />
            </button>
            <span className="ml-1 font-mono text-[11px] text-faint">
              {String(idx + 1).padStart(2, '0')} / {String(DEMOS.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* The application the employee is working in */}
        <div className="flex min-w-0 flex-col p-3 md:p-5">
          <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-hair bg-white/[0.04] px-3 py-2">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
            </span>
            <span className="ml-2 truncate text-[12px] font-medium text-white/85">{demo.file}</span>
            <span className="hidden text-[11px] text-faint sm:inline">{demo.app}</span>
            <span
              className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-signal/20 text-signal-soft'}`}
            >
              {done ? 'Done' : `${demo.name} working`}
            </span>
          </div>
          <div key={demo.key} className="min-h-[340px] flex-1 overflow-x-auto rounded-b-md bg-white p-4 md:min-h-[380px] md:p-6">
            {demo.body(at)}
          </div>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-faint">Simulated demonstration · fictional sample data</p>
        </div>
      </div>
    </div>
  );
}
