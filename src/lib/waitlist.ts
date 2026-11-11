import 'server-only';
import { z } from 'zod';
import { joinWaitlist } from './db';
import { rateLimited } from './enquiries';

export const WAITLIST_PRODUCTS = ['amey-ai'] as const;

export const waitlistSchema = z.object({
  product: z.enum(WAITLIST_PRODUCTS),
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(160),
  business: z.string().trim().max(120).optional().default(''),
  /** Honeypot: people never see or fill this. */
  website: z.string().max(0).optional().default(''),
});

export type WaitlistResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** `limitKey` counts only valid sign-ups, so fixing a typo never locks anyone out. */
export async function recordWaitlist(raw: unknown, limitKey?: string): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    if (fieldErrors.website) return { ok: true }; // bot: pretend success, store nothing
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors };
  }
  if (limitKey && rateLimited(limitKey, 5, 10 * 60_000)) {
    return { ok: false, error: 'That’s a lot of sign-ups from one place. Please try again in a few minutes.' };
  }
  const v = parsed.data;
  await joinWaitlist({ product: v.product, name: v.name, email: v.email, business: v.business || null });
  return { ok: true };
}
