'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { estimate, estimateBreakdown, formatUsd, isEstimable, type EstimatorConfig, type Plan, type ServiceId } from '@/lib/pricing';
import { Tween } from '@/components/system/motion';
import { cn } from '@/lib/utils';
import { COMPANY } from '@/content/site';
import { submitEnquiry } from '@/app/(site)/start/actions';

const SERVICES: { id: ServiceId; label: string; note: string }[] = [
  { id: 'website', label: 'Website', note: 'A site for your business or organisation' },
  { id: 'app', label: 'Mobile app', note: 'For Android and iPhone' },
  { id: 'software', label: 'Software', note: 'Systems your business runs on' },
  { id: 'webapp', label: 'Web app', note: 'A product or portal in the browser' },
  { id: 'automation', label: 'Automation', note: 'AI assistants, receptionists, workflows' },
  { id: 'unsure', label: 'Not sure', note: 'Tell us the problem; we’ll suggest the build' },
];

const UNSURE_TYPES = [
  { id: 'idea', label: 'I have an idea for a product' },
  { id: 'problem', label: 'I have a business problem to solve' },
  { id: 'existing', label: 'I want to improve an existing system' },
];

const STEP_TITLES = ['What do you need?', 'What type of project?', 'What features do you need?', 'What is your timeline?', 'Estimated project cost', 'Start project'];

export type BuilderPrefill = { service?: string; type?: string; package?: string; features?: string[]; users?: string };

type Form = { name: string; company: string; email: string; phone: string; description: string; website: string };

export function ProjectBuilder({ config, plans, prefill }: { config: EstimatorConfig; plans: Plan[]; prefill: BuilderPrefill }) {
  const reduce = useReducedMotion();
  const initialPlan = plans.find((p) => p.id === prefill.package);
  const initialService = (initialPlan?.group ?? SERVICES.find((s) => s.id === prefill.service)?.id ?? null) as ServiceId | null;

  const [step, setStep] = useState(initialService ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [service, setService] = useState<ServiceId | null>(initialService);
  const [type, setType] = useState<string | null>(prefill.type ?? null);
  const [pkg, setPkg] = useState<string | null>(initialPlan?.id ?? null);
  const [features, setFeatures] = useState<string[]>(prefill.features ?? []);
  const [users, setUsers] = useState<string | null>(prefill.users ?? null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ name: '', company: '', email: '', phone: '', description: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const top = useRef<HTMLDivElement>(null);

  const svc = service && isEstimable(service) ? config.services[service] : null;
  const servicePlans = plans.filter((p) => p.group === service);
  const plan = servicePlans.find((p) => p.id === pkg) ?? null;
  const types = service === 'unsure' ? UNSURE_TYPES.map((t) => ({ ...t, cents: 0 })) : svc?.types ?? [];

  const input = { service: service ?? 'unsure', type, features, users, timeline, packageCents: plan?.priceCents ?? null } as const;
  const est = service ? estimate(config, input) : null;
  const breakdown = service ? estimateBreakdown(config, input) : null;

  const canNext = [
    !!service,
    !!type || !!plan,
    true,
    !!timeline,
    true,
  ][step] ?? false;

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
  };

  const pickService = (id: ServiceId) => {
    if (id !== service) {
      setType(null);
      setPkg(null);
      setFeatures([]);
      setUsers(null);
    }
    setService(id);
  };

  const toggleFeature = (id: string) => setFeatures((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const res = await submitEnquiry({
        ...form,
        service: service ?? 'unsure',
        projectType: type ?? '',
        package: pkg ?? '',
        features,
        users: users ?? '',
        timeline: timeline ?? '',
        source: 'project-builder',
      });
      if (res.ok) {
        setDone(res.reference);
        requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start' }));
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
      }
    });
  };

  const serviceLabel = SERVICES.find((s) => s.id === service)?.label;
  const typeLabel = types.find((t) => t.id === type)?.label;
  const timelineLabel = config.timelines.find((t) => t.id === timeline)?.label;

  if (done) {
    return (
      <div ref={top} className="scroll-mt-28 rounded-[8px] bg-ink p-8 text-white md:p-14" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-signal"><Check className="size-6" /></span>
        <p className="t-label mt-10 text-white/60">Reference {done}</p>
        <h2 className="t-display-m mt-4">Thank you, {form.name.split(' ')[0]}.</h2>
        <p className="t-lead mt-6 max-w-xl text-white/75">
          We’ve received your project. We’ll reply by email{form.phone ? ' or phone' : ''} to arrange a short scoping call, and confirm the price before any work starts.
        </p>
        <div className="mt-10 flex flex-wrap gap-6">
          <Link href="/projects" className="t-label inline-flex items-center gap-2 text-white hover:text-signal-soft">See what we’re building <ArrowRight className="size-3.5" /></Link>
          <a href={COMPANY.whatsappHref} target="_blank" rel="noreferrer" className="t-label inline-flex items-center gap-2 text-white/70 hover:text-white">Message us on WhatsApp</a>
        </div>
      </div>
    );
  }

  const opt = (selected: boolean) =>
    cn(
      'group/opt relative flex min-h-14 w-full items-start gap-4 rounded-[6px] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200',
      selected ? 'border-ink bg-white shadow-[0_0_0_1px_var(--color-ink)]' : 'border-ink/15 bg-white/50 hover:border-ink/40 hover:bg-white',
    );
  const radio = (selected: boolean) =>
    cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors', selected ? 'border-ink bg-ink text-white' : 'border-ink/30');

  return (
    <div ref={top} className="scroll-mt-28 grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Steps */}
      <div className="lg:col-span-8">
        <ol className="grid grid-cols-6 gap-1.5" aria-label="Progress">
          {STEP_TITLES.map((t, i) => (
            <li key={t} aria-current={i === step ? 'step' : undefined}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => go(i)}
                className="block w-full text-left disabled:cursor-default"
                aria-label={`Step ${i + 1}: ${t}`}
              >
                <span className={cn('block h-[3px] rounded-full transition-colors duration-500', i <= step ? 'bg-ink' : 'bg-ink/12')} />
                <span className={cn('t-label mt-3 hidden text-[0.62rem] md:block', i === step ? 'text-ink' : 'text-ink/45')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="relative mt-10 min-h-[420px] md:mt-14">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="t-label text-ink/50">Step {step + 1} of 6</p>
              <h2 className="t-display-m mt-4 text-[clamp(1.8rem,3.4vw,3rem)]">{STEP_TITLES[step]}</h2>

              {step === 0 && (
                <div role="radiogroup" aria-label="What do you need?" className="mt-10 grid gap-3 sm:grid-cols-2">
                  {SERVICES.map((s) => (
                    <button key={s.id} type="button" role="radio" aria-checked={service === s.id} onClick={() => pickService(s.id)} className={opt(service === s.id)}>
                      <span className={radio(service === s.id)}>{service === s.id && <Check className="size-3" strokeWidth={3} />}</span>
                      <span>
                        <span className="block font-semibold">{s.label}</span>
                        <span className="mt-1 block text-sm text-ink/60">{s.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="mt-10 space-y-10">
                  <div role="radiogroup" aria-label="Project type" className="grid gap-3 sm:grid-cols-2">
                    {types.map((t) => (
                      <button key={t.id} type="button" role="radio" aria-checked={type === t.id} onClick={() => setType(t.id)} className={opt(type === t.id)}>
                        <span className={radio(type === t.id)}>{type === t.id && <Check className="size-3" strokeWidth={3} />}</span>
                        <span className="font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {servicePlans.length > 0 && (
                    <div>
                      <p className="t-label text-ink/55">Package (optional)</p>
                      <div role="radiogroup" aria-label="Package" className="mt-4 grid gap-3 sm:grid-cols-2">
                        {servicePlans.map((p) => (
                          <button key={p.id} type="button" role="radio" aria-checked={pkg === p.id} onClick={() => setPkg(pkg === p.id ? null : p.id)} className={opt(pkg === p.id)}>
                            <span className={radio(pkg === p.id)}>{pkg === p.id && <Check className="size-3" strokeWidth={3} />}</span>
                            <span className="flex flex-1 items-baseline justify-between gap-3">
                              <span className="font-medium">{p.name}</span>
                              <span className="t-label text-ink/60">{p.from ? 'from ' : ''}{formatUsd(p.priceCents)}{p.plus ? '+' : ''}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="mt-10 space-y-10">
                  {!svc ? (
                    <p className="t-lead max-w-xl text-ink/70">No need to pick features yet. Describe what you have in mind in the last step and we’ll suggest the right build.</p>
                  ) : (
                    <>
                      {svc.usesUserTiers && (
                        <div>
                          <p className="t-label text-ink/55">Number of users</p>
                          <div role="radiogroup" aria-label="Number of users" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {config.userTiers.map((u) => (
                              <button key={u.id} type="button" role="radio" aria-checked={users === u.id} onClick={() => setUsers(u.id)} className={cn('min-h-12 rounded-[6px] border px-3 text-sm transition-colors', users === u.id ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white/50 hover:border-ink/40')}>
                                {u.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <fieldset>
                        <legend className="t-label text-ink/55">Features</legend>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {svc.features.map((f) => {
                            const on = features.includes(f.id);
                            return (
                              <button key={f.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggleFeature(f.id)} className={opt(on)}>
                                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] border transition-colors', on ? 'border-ink bg-ink text-white' : 'border-ink/30')}>
                                  {on && <Check className="size-3" strokeWidth={3} />}
                                </span>
                                <span className="flex flex-1 items-baseline justify-between gap-3">
                                  <span>{f.label}</span>
                                  <span className="t-label shrink-0 text-ink/50">+{formatUsd(f.cents)}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div role="radiogroup" aria-label="Timeline" className="mt-10 grid gap-3 sm:grid-cols-2">
                  {config.timelines.map((t) => (
                    <button key={t.id} type="button" role="radio" aria-checked={timeline === t.id} onClick={() => setTimeline(t.id)} className={opt(timeline === t.id)}>
                      <span className={radio(timeline === t.id)}>{timeline === t.id && <Check className="size-3" strokeWidth={3} />}</span>
                      <span>
                        <span className="block font-medium">{t.label}</span>
                        {t.multiplier > 1 && <span className="mt-1 block text-sm text-ink/60">Priority scheduling adds {Math.round((t.multiplier - 1) * 100)}%</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="mt-10">
                  {est ? (
                    <div className="rounded-[8px] bg-ink p-6 text-white md:p-10">
                      <p className="t-label text-white/55">Estimated range</p>
                      <p className="t-display-m mt-5 text-[clamp(2.2rem,5vw,4rem)]">
                        <Tween value={est.lowCents} format={(n) => formatUsd(Math.round(n / 100) * 100)} />
                        <span className="text-white/40"> – </span>
                        <Tween value={est.highCents} format={(n) => formatUsd(Math.round(n / 100) * 100)} />
                      </p>
                      {breakdown && (
                        <dl className="mt-8 space-y-2.5 border-t border-white/15 pt-6 text-sm">
                          <div className="flex justify-between gap-4"><dt className="text-white/65">{plan ? plan.name : typeLabel}</dt><dd className="tabular-nums">{breakdown.base !== null ? formatUsd(breakdown.base) : '-'}</dd></div>
                          {breakdown.features.map((f) => (
                            <div key={f.id} className="flex justify-between gap-4"><dt className="text-white/65">{f.label}</dt><dd className="tabular-nums">+{formatUsd(f.cents)}</dd></div>
                          ))}
                          {breakdown.users && breakdown.users.multiplier !== 1 && (
                            <div className="flex justify-between gap-4"><dt className="text-white/65">{breakdown.users.label}</dt><dd>×{breakdown.users.multiplier}</dd></div>
                          )}
                          {breakdown.timeline && breakdown.timeline.multiplier !== 1 && (
                            <div className="flex justify-between gap-4"><dt className="text-white/65">Timeline: {breakdown.timeline.label}</dt><dd>×{breakdown.timeline.multiplier}</dd></div>
                          )}
                        </dl>
                      )}
                      <p className="mt-8 text-sm leading-relaxed text-white/60">
                        An estimate, not a quote. We confirm the price after a short scoping call, before any work starts.
                      </p>
                    </div>
                  ) : (
                    <p className="t-lead max-w-xl text-ink/70">
                      We’ll estimate this one together. Tell us about it in the next step and we’ll come back with options and prices.
                    </p>
                  )}
                </div>
              )}

              {step === 5 && (
                <form onSubmit={submit} noValidate className="mt-10 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" name="name" required value={form.name} error={errors.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
                    <Field label="Company" name="company" value={form.company} error={errors.company} onChange={(v) => setForm({ ...form, company: v })} autoComplete="organization" />
                    <Field label="Email" name="email" type="email" required value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
                    <Field label="Phone" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" placeholder="+263 …" />
                  </div>
                  <Field label="Project description" name="description" required textarea value={form.description} error={errors.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="What should it do, who is it for, and is there anything you already have?" />
                  <div aria-hidden className="absolute left-[-10000px] top-auto size-px overflow-hidden">
                    <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
                  </div>
                  {formError && <p role="alert" className="rounded-[6px] border border-[#c2410c]/30 bg-[#c2410c]/[0.06] px-4 py-3 text-sm text-[#9a3412]">{formError}</p>}
                  <p className="text-xs leading-relaxed text-ink/55">
                    We use these details only to reply about your project. See our <Link href="/legal/privacy" className="underline underline-offset-2">privacy notice</Link>.
                  </p>
                  <button type="submit" disabled={pending} className="group/cta inline-flex min-h-12 w-full items-center justify-between gap-6 rounded-[4px] bg-ink px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#16213b] disabled:opacity-70 sm:w-auto [font-variation-settings:'wdth'_112]">
                    {pending ? 'Sending…' : 'Start project'}
                    {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 5 && (
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/12 pt-6">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="t-label inline-flex min-h-11 items-center gap-2 px-1 text-ink/70 hover:text-ink disabled:invisible">
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={() => go(service === 'unsure' && step === 1 ? 3 : step + 1)}
              disabled={!canNext}
              className="group/cta inline-flex min-h-12 items-center gap-6 rounded-[4px] bg-ink px-5 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-white transition-[background-color,opacity] hover:bg-[#16213b] disabled:cursor-not-allowed disabled:opacity-35 [font-variation-settings:'wdth'_112]"
            >
              {step === 4 ? 'Continue' : 'Next'}
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <aside className="lg:col-span-4" aria-label="Your project so far">
        <div className="rounded-[8px] border border-ink/12 bg-white p-6 lg:sticky lg:top-28">
          <p className="t-label text-ink/50">Your project</p>
          <dl className="mt-6 space-y-4 text-sm">
            <Row k="Service" v={serviceLabel} />
            <Row k="Type" v={typeLabel} />
            {servicePlans.length > 0 && <Row k="Package" v={plan?.name} />}
            {svc && <Row k="Features" v={features.length ? `${features.length} selected` : undefined} />}
            {svc?.usesUserTiers && <Row k="Users" v={config.userTiers.find((u) => u.id === users)?.label} />}
            <Row k="Timeline" v={timelineLabel} />
          </dl>
          <div className="mt-6 border-t border-ink/12 pt-6" aria-live="polite">
            <p className="t-label text-ink/50">Estimate</p>
            <p className="t-title mt-3 text-[1.5rem] normal-case">
              {est ? (
                <>
                  <Tween value={est.lowCents} format={(n) => formatUsd(Math.round(n / 100) * 100)} />
                  <span className="text-ink/35"> – </span>
                  <Tween value={est.highCents} format={(n) => formatUsd(Math.round(n / 100) * 100)} />
                </>
              ) : (
                <span className="text-ink/35">{service === 'unsure' ? 'Scoped with you' : 'Choose a type'}</span>
              )}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/55">{k}</dt>
      <dd className={cn('text-right', v ? 'text-ink' : 'text-ink/30')}>{v ?? '—'}</dd>
    </div>
  );
}

function Field({ label, name, value, onChange, error, required, textarea, type = 'text', autoComplete, placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; textarea?: boolean; type?: string; autoComplete?: string; placeholder?: string;
}) {
  const id = `f-${name}`;
  const cls = cn(
    'mt-2 block w-full rounded-[6px] border bg-white px-4 text-[1rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/35 focus:border-ink focus:shadow-[0_0_0_1px_var(--color-ink)]',
    error ? 'border-[#c2410c]' : 'border-ink/20',
  );
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required ? <span className="text-ink/45">*</span> : <span className="text-ink/45">(optional)</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={5} required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(cls, 'py-3')} />
      ) : (
        <input id={id} name={name} type={type} required={required} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(cls, 'h-12')} />
      )}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-[#c2410c]">{error}</p>}
    </div>
  );
}
