'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Activity, ArrowRight, Loader2, MessageCircleHeart, Pill, ShieldAlert, Siren, Users } from 'lucide-react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { MaskLines, Reveal, Stagger } from '@/components/system/motion';
import { Label } from '@/components/system/primitives';
import { media } from '@/content/media';
import { MediaFrame } from '@/components/visuals/media';
import { submitWaitlist } from '@/app/(site)/waitlist-action';
import { cn } from '@/lib/utils';

// Amey AI ("Always here for you"): a calm guardian on every phone, launching 25 December 2026.
// All copy follows the Amey AI pitch document; keep claims to what that document says is built.

/** Launch facts shown under the heading. */
export const AMEY_LAUNCH = '25 December 2026';

/** Six things Amey does, one short line each. */
const FEATURES = [
  { icon: ShieldAlert, title: 'Stops scams', text: 'Warns before money or a PIN is shared.' },
  { icon: Pill, title: 'Reminds', text: 'Medicine, water and daily tasks.' },
  { icon: Activity, title: 'Spots falls', text: 'Asks “Are you OK?” and calls for help.' },
  { icon: Siren, title: 'SOS in one tap', text: 'Always free, on every plan.' },
  { icon: MessageCircleHeart, title: 'Talks with you', text: 'A warm voice, in Shona, Ndebele and 38 more languages.' },
  { icon: Users, title: 'Keeps family close', text: 'They see only what you choose to share.' },
];

/** The notifications that play over the video, one after another. */
const PREVIEW = [
  { tone: 'alert', title: 'Scam warning', text: 'Don’t send it. This “wrong transfer” is a known trick.', icon: ShieldAlert },
  { tone: 'safe', title: 'Medicine time', text: 'Your 9:00 tablets. 2 of 3 done today.', icon: Pill },
  { tone: 'urgent', title: 'Are you OK?', text: 'Fall detected. Calling Tendai in 30 s.', icon: Activity },
] as const;

const TONE = {
  safe: 'from-[#38e1ff]/25 text-[#9ff0ff]',
  alert: 'from-[#ffb547]/25 text-[#ffd18a]',
  urgent: 'from-[#ff6b5e]/25 text-[#ffb0a8]',
};

export function AmeyAi() {
  return (
    <section id="amey-ai" aria-labelledby="amey-title" className="relative isolate scroll-mt-16 overflow-hidden border-t border-hair">
      <AmbientGlow />
      <div className="shell section">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-4">
              <span className="relative block size-14 shrink-0 overflow-hidden rounded-[16px] bg-white shadow-[0_0_40px_-6px_rgb(56_170_255/0.8)] ring-1 ring-white/40">
                <Image src="/brand/amey-icon.webp" alt="Amey AI logo" fill sizes="56px" className="object-contain" />
              </span>
              <div>
                <p className="t-label flex flex-wrap items-center gap-2 text-[#9ff0ff]/90">
                  Amey AI
                  <span className="rounded-full border border-[#38e1ff]/40 bg-[#38e1ff]/10 px-2 py-0.5 text-[0.6rem] text-[#9ff0ff]">Coming {AMEY_LAUNCH}</span>
                </p>
                <p className="mt-1.5 text-sm text-white/60">Always here for you.</p>
              </div>
            </div>
            <MaskLines id="amey-title" as="h2" className="t-display-l mt-10" lines={['Join the waitlist', <em key="a">for Amey AI.</em>]} />
            <Reveal>
              <p className="t-lead mt-8 max-w-lg text-white/85">
                An AI guardian for older people. Amey stops scams, reminds them about their medicine and calls for help if they fall.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
                Android and iPhone, {AMEY_LAUNCH}. From $2.99 a month after a 14-day free trial. Published by Attribute AI, LLC.
              </p>
            </Reveal>
            <WaitlistForm />
          </div>

          <div className="lg:col-span-6">
            <ProductPreview />
          </div>
        </div>

        <Stagger
          as="ul"
          gap={0.07}
          className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-20 lg:grid-cols-3"
          itemClassName="group relative"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/** Slow-drifting coloured light behind the section; still for reduced motion. */
function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(56_225_255/0.10),transparent_60%)]" />
      {/* Soft light from radial gradients: no blur filter and no running animation, so scrolling stays smooth */}
      <div className="absolute inset-0 bg-[radial-gradient(42rem_34rem_at_0%_20%,rgb(26_134_250/0.16),transparent_70%),radial-gradient(40rem_30rem_at_100%_100%,rgb(56_225_255/0.12),transparent_70%)]" />
      {/* Fine scan lines, very faint, for a screen-like texture */}
      <div className="absolute inset-0 opacity-[0.025] [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_4px)]" />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: (typeof FEATURES)[number]) {
  return (
    <div className="lift relative h-full overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] p-4 transition-colors duration-500 hover:border-[#38e1ff]/40 sm:p-6">
      {/* glow that follows into the card on hover */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(56_225_255/0.3),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="relative grid size-10 place-items-center rounded-xl border border-[#38e1ff]/30 bg-[#38e1ff]/10 text-[#9ff0ff] shadow-[0_0_24px_-4px_rgb(56_225_255/0.5)]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="t-title relative mt-4 text-[1.1rem] sm:mt-5 sm:text-[1.25rem]">{title}</h3>
      <p className="relative mt-1.5 text-sm leading-snug text-dim sm:text-[0.95rem]">{text}</p>
    </div>
  );
}

/** Real footage of a grandfather on his phone, with Amey's alerts arriving over it. */
function ProductPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? PREVIEW.length : 0);
  const clip = media('amey-grandfather');

  useEffect(() => {
    if (reduce) {
      setShown(PREVIEW.length);
      return;
    }
    if (!inView) return;
    setShown(0);
    const timers = PREVIEW.map((_, i) => window.setTimeout(() => setShown(i + 1), 600 + i * 1400));
    const loop = window.setInterval(() => {
      setShown(0);
      PREVIEW.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 600 + i * 1400)));
    }, 600 + PREVIEW.length * 1400 + 4000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [inView, reduce]);

  return (
    <figure ref={ref} className="relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgb(56_225_255/0.45)] sm:aspect-square">
        {/* Muted loop that plays only on screen; a still for reduced motion */}
        <MediaFrame media={clip} aspect="auto" rounded={false} className="absolute inset-0" sizes="(min-width: 1024px) 45vw, 100vw" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />

        <div className="absolute inset-x-4 bottom-4 space-y-3 sm:inset-x-6 sm:bottom-6" aria-live="polite">
          <AnimatePresence initial={false}>
            {PREVIEW.slice(0, shown).map((n) => (
              <motion.div
                key={n.title}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className={cn('flex items-start gap-3 rounded-2xl border border-white/15 bg-gradient-to-r to-black/80 bg-black/55 p-3.5 sm:p-4', TONE[n.tone])}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                  <n.icon className="size-4" strokeWidth={2} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    {n.title}
                    <span className="t-label text-[0.55rem] text-white/45">Amey · now</span>
                  </span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-white/75">{n.text}</span>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <figcaption className="t-label mt-3 text-[0.6rem] text-white/40">Preview of Amey’s alerts. Video: {clip.credit}, Pexels</figcaption>
    </figure>
  );
}

type Fields = { name: string; email: string; business: string; website: string };

function WaitlistForm() {
  const [f, setF] = useState<Fields>({ name: '', email: '', business: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const reduce = useReducedMotion();

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((x) => ({ ...x, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    start(async () => {
      const res = await submitWaitlist({ product: 'amey-ai', ...f });
      if (res.ok) setDone(true);
      else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
      }
    });
  };

  const field = 'peer h-13 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 pt-4 text-[0.98rem] text-white outline-none transition-[border-color,box-shadow,background-color] placeholder:text-transparent focus:border-[#38e1ff]/70 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgb(56_225_255/0.12)] aria-[invalid=true]:border-[#ff6b5e]';
  const floating = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[0.95rem] text-white/50 transition-all duration-200 peer-focus:top-3.5 peer-focus:text-[0.68rem] peer-focus:text-[#9ff0ff] peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[0.68rem]';

  return (
    <div className="relative mt-10 max-w-xl">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            role="status"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative overflow-hidden rounded-2xl border border-[#38e1ff]/40 bg-[#38e1ff]/[0.07] p-7 shadow-[0_0_60px_-20px_rgb(56_225_255/0.6)]"
          >
            <div className="flex items-center gap-5">
              <SuccessMark />
              <div>
                <p className="t-title text-[1.35rem]">You’re on the list.</p>
                <p className="mt-1.5 text-sm text-white/70">Thank you, {f.name.split(' ')[0]}. We’ll email {f.email} when Amey launches on {AMEY_LAUNCH}.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate exit={reduce ? undefined : { opacity: 0, y: -8 }} className="space-y-3" aria-describedby={formError ? 'amey-form-error' : undefined}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <input id="amey-name" name="name" autoComplete="name" required placeholder="Name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'amey-name-err' : undefined} className={field} />
                <label htmlFor="amey-name" className={floating}>Your name</label>
                {errors.name && <p id="amey-name-err" className="mt-1.5 text-xs text-[#ffb0a8]">{errors.name}</p>}
              </div>
              <div className="relative">
                <input id="amey-email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="Email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'amey-email-err' : undefined} className={field} />
                <label htmlFor="amey-email" className={floating}>Email address</label>
                {errors.email && <p id="amey-email-err" className="mt-1.5 text-xs text-[#ffb0a8]">{errors.email}</p>}
              </div>
            </div>
            <div className="relative">
              <input id="amey-business" name="business" autoComplete="organization" placeholder="Business" value={f.business} onChange={set('business')} className={field} />
              <label htmlFor="amey-business" className={floating}>Business name (optional)</label>
            </div>
            {/* Honeypot, hidden from people and screen readers */}
            <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
              <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>
            </div>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={pending}
                className="group/cta relative inline-flex min-h-13 shrink-0 items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-[#1a86fa] to-[#38c8ff] px-7 font-semibold text-white shadow-[0_12px_40px_-12px_rgb(56_200_255/0.9)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgb(56_200_255/1)] active:scale-[0.98] disabled:opacity-70"
              >
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                <span className="relative">{pending ? 'Joining…' : 'Join the waitlist'}</span>
                {!pending && <ArrowRight className="relative size-4 transition-transform group-hover/cta:translate-x-1" aria-hidden />}
              </button>
              <p className="text-xs text-white/45">No spam. We’ll email you at launch, and you can leave any time.</p>
            </div>
            {formError && <p id="amey-form-error" role="alert" className="text-sm text-[#ffb0a8]">{formError}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A tick that draws itself inside a glowing ring. */
function SuccessMark() {
  const reduce = useReducedMotion();
  return (
    <span className="relative grid size-16 shrink-0 place-items-center">
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#38e1ff]/60"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.4, repeat: 2, ease: 'easeOut' }}
        />
      )}
      <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
        <motion.circle cx="32" cy="32" r="29" fill="rgb(56 225 255 / 0.12)" stroke="#38e1ff" strokeWidth="2.5"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        <motion.path d="M20 33 l8 8 l16 -18" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.5, ease: 'easeOut' }} />
      </svg>
    </span>
  );
}
