import 'server-only';
import { z } from 'zod';
import { createEnquiry, getEstimator, getPlans, type EnquiryData } from './db';
import { SERVICE_IDS, estimate, formatUsd } from './pricing';
import { COMPANY } from '@/content/site';

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  company: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(160),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, 'Use digits, spaces and + only')
    .optional()
    .default(''),
  description: z.string().trim().min(10, 'A sentence or two about the project, please').max(4000),
  service: z.enum(SERVICE_IDS),
  projectType: z.string().max(40).optional().default(''),
  package: z.string().max(40).optional().default(''),
  features: z.array(z.string().max(40)).max(30).default([]),
  users: z.string().max(20).optional().default(''),
  timeline: z.string().max(20).optional().default(''),
  source: z.string().max(40).default('project-builder'),
  /** Honeypot: people never see or fill this. */
  website: z.string().max(0).optional().default(''),
});
export type EnquiryInput = z.input<typeof enquirySchema>;

export type SubmitResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// Small in-process limiter: 5 enquiries per address per 10 minutes.
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}

export const referenceFor = (id: number) => `SO-${String(id).padStart(5, '0')}`;

/** `limitKey` counts only valid submissions, so fixing form errors never locks anyone out. */
export async function recordEnquiry(raw: unknown, limitKey?: string): Promise<SubmitResult> {
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      fieldErrors[key] ??= issue.message;
    }
    if (fieldErrors.website) return { ok: true, reference: 'SO-00000' }; // bot: pretend success, store nothing
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors };
  }
  const v = parsed.data;
  if (limitKey && rateLimited(limitKey)) {
    return { ok: false, error: 'Too many enquiries from this connection. Please try again in a few minutes, or email us.' };
  }

  // Never trust a price from the browser: recompute from the stored configuration.
  const plan = v.package ? (await getPlans()).find((p) => p.id === v.package) ?? null : null;
  const est = estimate(await getEstimator(), {
    service: v.service,
    type: v.projectType || null,
    features: v.features,
    users: v.users || null,
    timeline: v.timeline || null,
    packageCents: plan?.priceCents ?? null,
  });

  const data: EnquiryData = {
    name: v.name,
    company: v.company || null,
    email: v.email,
    phone: v.phone || null,
    description: v.description,
    service: v.service,
    projectType: v.projectType || null,
    package: plan?.name ?? null,
    features: v.features,
    users: v.users || null,
    timeline: v.timeline || null,
    estimateLowCents: est?.lowCents ?? null,
    estimateHighCents: est?.highCents ?? null,
    source: v.source,
  };
  const id = await createEnquiry(data);
  const reference = referenceFor(id);
  await notify(reference, data).catch((e) => console.error('[enquiry] notification failed', e));
  return { ok: true, reference };
}

/** Optional email to the team through Resend's HTTPS API (RESEND_API_KEY + LEADS_NOTIFY_EMAIL). */
async function notify(reference: string, d: EnquiryData) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!key || !to) {
    console.info(`[enquiry] ${reference} from ${d.email} (${d.service}); set RESEND_API_KEY and LEADS_NOTIFY_EMAIL to be emailed`);
    return;
  }
  const estimateText = d.estimateLowCents !== null ? `${formatUsd(d.estimateLowCents)} – ${formatUsd(d.estimateHighCents ?? d.estimateLowCents)}` : 'not estimated';
  const lines = [
    `Reference: ${reference}`,
    `Name: ${d.name}${d.company ? ` (${d.company})` : ''}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone ?? '-'}`,
    `Service: ${d.service}${d.projectType ? ` / ${d.projectType}` : ''}${d.package ? ` / ${d.package}` : ''}`,
    `Features: ${d.features.join(', ') || '-'}`,
    `Users: ${d.users ?? '-'}  Timeline: ${d.timeline ?? '-'}`,
    `Estimate: ${estimateText}`,
    '',
    d.description,
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.LEADS_FROM_EMAIL ?? `Kesera website <website@${COMPANY.website}>`,
      to: [to],
      reply_to: d.email,
      subject: `New project enquiry ${reference}: ${d.service} from ${d.name}`,
      text: lines.join('\n'),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
