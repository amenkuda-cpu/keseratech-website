'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Activity, ArrowRight, Gift, HeartPulse, Languages, Lock, Loader2, MessageCircleHeart, Pill, ShieldAlert, Siren, Smartphone, UserRoundCheck, Users, WifiOff } from 'lucide-react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { MaskLines, Reveal, Stagger } from '@/components/system/motion';
import { Label } from '@/components/system/primitives';
import { media } from '@/content/media';
import { submitWaitlist } from '@/app/(site)/waitlist-action';
import { cn } from '@/lib/utils';

// Amey AI ("Always here for you"): a calm guardian on every phone, launching 25 December 2026.
// All copy follows the Amey AI pitch document; keep claims to what that document says is built.

/** Launch facts shown under the heading. */
export const AMEY_LAUNCH = '25 December 2026';

const FEATURES = [
  { icon: ShieldAlert, title: 'Scam protection', text: 'Checks messages, links and calls, and warns in plain words before money or a PIN is shared. Knows local scams: EcoCash, banks, ZIMRA, NSSA, fake prizes. Works offline.' },
  { icon: MessageCircleHeart, title: 'Ask Amey, a voice companion', text: 'Talk to Amey out loud in a warm, natural voice. She answers questions, tells stories, sets reminders and explains phone tasks one step at a time.' },
  { icon: Pill, title: 'Medicine, water and task reminders', text: 'Simple daily reminders with big buttons. A pill organiser and water glass fill up as the day goes. Amey reminds; she never gives medical advice.' },
  { icon: Siren, title: 'SOS and emergency help', text: 'One tap to call for help, the right emergency numbers for your country, and a countdown that calls a trusted person if nobody answers.' },
  { icon: Activity, title: 'Fall and crash detection', text: '“Are you OK?” after a hard fall or a crash, and a call for help if there is no answer.' },
  { icon: HeartPulse, title: 'Emergency medical info', text: 'Allergies, medicines, blood type and contacts on one clear card, readable from the lock screen by first responders.' },
  { icon: Users, title: 'Family Circle', text: 'Optional. Family see only what the person chooses to share: alerts, check-ins and one short sentence, never message contents.' },
  { icon: UserRoundCheck, title: 'Talk to someone privately', text: 'A discreet way to tell a trusted person if a carer is mistreating them. Nothing is stored and carers are never told.' },
  { icon: Gift, title: 'Rewards for healthy habits', text: 'A streak for every perfect day. Every 14 perfect days earns an Amey Voucher paid to EcoCash.' },
];

/** Why Amey is different, as short proof points. */
const PROOF = [
  { icon: Languages, text: '40 languages, including Shona and Ndebele' },
  { icon: WifiOff, text: 'Scam checks, SOS and reminders work offline' },
  { icon: Smartphone, text: 'Built to run fast on a 2 GB Android phone' },
  { icon: Lock, text: 'Messages are checked on the phone and never stored' },
];

/** The plans from the pitch. SOS, the countdown and fall alerts are free for everyone. */
const PLANS = [
  { name: 'Shield', price: '$2.99', text: 'Full protection, reminders, Ask Amey and natural voice' },
  { name: 'Family', price: '$5.99', text: 'Everything in Shield, plus a Family Circle with live alerts' },
];

/** The notifications that play over the product photo, one after another. */
const PREVIEW = [
  { tone: 'alert', title: 'This looks like a scam', text: '“Wrong transfer, please send it back” is a known EcoCash trick. Don’t share your PIN.', icon: ShieldAlert },
  { tone: 'safe', title: 'Medicine time', text: 'Your 9:00 tablets. Tap when you’ve taken them. 2 of 3 done today.', icon: Pill },
  { tone: 'urgent', title: 'Are you OK?', text: 'Hard fall detected. Calling Tendai in 30 s unless you tap “I’m fine”.', icon: Activity },
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
              <p className="t-lead mt-8 max-w-xl text-white/85">
                A calm guardian on every phone. Amey protects older people and busy families from scams, remembers medicines and tasks, calls for help when something goes wrong, and keeps loved ones close, all in the person’s own language.
              </p>
              <p className="t-body mt-4 max-w-xl text-dim">
                For older people living alone or with a carer, and for the children in another city or country who want to know they’re safe. Launching on Android and iPhone on {AMEY_LAUNCH}, published in the App Store and Google Play by Attribute AI, LLC.
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
          gap={0.08}
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:mt-28 lg:grid-cols-3"
          itemClassName="group relative"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </Stagger>

        {/* Proof points and plans */}
        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-12 lg:gap-12">
          <Stagger as="ul" gap={0.06} className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-7" itemClassName="flex items-start gap-3 text-[0.98rem] text-white/85">
            {PROOF.map((p) => (
              <Fragment key={p.text}>
                <p.icon className="mt-0.5 size-5 shrink-0 text-[#9ff0ff]" strokeWidth={1.75} aria-hidden />
                {p.text}
              </Fragment>
            ))}
          </Stagger>
          <Reveal className="lg:col-span-5">
            <p className="t-label text-white/50">Plans after a 14-day free trial</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {PLANS.map((p) => (
                <li key={p.name} className="lift rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-lg font-semibold">{p.name}</span>
                    <span className="tabular-nums"><span className="font-display text-2xl font-semibold">{p.price}</span><span className="text-sm text-white/50"> / month</span></span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-dim">{p.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#86efac]">
              <Siren className="size-4" aria-hidden /> SOS, the emergency countdown and fall alerts are always free.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Slow-drifting coloured light behind the section; still for reduced motion. */
function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(56_225_255/0.10),transparent_60%)]" />
      <div className="absolute -left-40 top-20 size-[38rem] rounded-full bg-[#1a86fa]/20 blur-[120px] motion-safe:animate-[amey-drift_18s_ease-in-out_infinite_alternate]" />
      <div className="absolute -right-32 bottom-0 size-[34rem] rounded-full bg-[#38e1ff]/15 blur-[120px] motion-safe:animate-[amey-drift_22s_ease-in-out_infinite_alternate-reverse]" />
      {/* Fine scan lines, very faint, for a screen-like texture */}
      <div className="absolute inset-0 opacity-[0.025] [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_4px)]" />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: (typeof FEATURES)[number]) {
  return (
    <div className="lift relative h-full overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors duration-500 hover:border-[#38e1ff]/40 md:p-7">
      {/* glow that follows into the card on hover */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-[#38e1ff]/0 blur-3xl transition-colors duration-700 group-hover:bg-[#38e1ff]/25" />
      <span className="relative grid size-11 place-items-center rounded-xl border border-[#38e1ff]/30 bg-[#38e1ff]/10 text-[#9ff0ff] shadow-[0_0_24px_-4px_rgb(56_225_255/0.5)]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="t-title relative mt-6 text-[1.25rem]">{title}</h3>
      <p className="relative mt-3 text-[0.95rem] leading-relaxed text-dim">{text}</p>
    </div>
  );
}

/** A real photograph with Amey's alerts arriving over it, as they would on the phone. */
function ProductPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? PREVIEW.length : 0);
  const photo = media('amey-companion');

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
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgb(56_225_255/0.45)] sm:aspect-[5/5] lg:aspect-[4/5]">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: photo.focus }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        {/* scanning line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#38e1ff]/10 to-transparent motion-safe:animate-[amey-scan_5s_linear_infinite]" />

        <div className="absolute inset-x-4 bottom-4 space-y-3 sm:inset-x-6 sm:bottom-6" aria-live="polite">
          <AnimatePresence initial={false}>
            {PREVIEW.slice(0, shown).map((n) => (
              <motion.div
                key={n.title}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className={cn('flex items-start gap-3 rounded-2xl border border-white/15 bg-gradient-to-r to-black/50 p-3.5 backdrop-blur-xl sm:p-4', TONE[n.tone])}
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
      <figcaption className="t-label mt-3 text-[0.6rem] text-white/40">Preview of Amey’s alerts. Photo: {photo.credit}, Pexels</figcaption>
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
