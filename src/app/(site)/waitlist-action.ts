'use server';

import { headers } from 'next/headers';
import { recordWaitlist, type WaitlistResult } from '@/lib/waitlist';

export async function submitWaitlist(input: unknown): Promise<WaitlistResult> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  try {
    return await recordWaitlist(input, `waitlist:${ip}`);
  } catch (e) {
    console.error('[waitlist] failed', e);
    return { ok: false, error: 'Something went wrong on our side. Please try again, or email us and we’ll add you.' };
  }
}
