'use server';

import { headers } from 'next/headers';
import { recordEnquiry, type SubmitResult } from '@/lib/enquiries';

export async function submitEnquiry(input: unknown): Promise<SubmitResult> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  try {
    return await recordEnquiry(input, `enquiry:${ip}`);
  } catch (e) {
    console.error('[enquiry] failed', e);
    return { ok: false, error: 'Something went wrong on our side. Please email us and we’ll pick it up.' };
  }
}
