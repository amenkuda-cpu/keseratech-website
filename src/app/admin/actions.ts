'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminConfigured, endSession, passwordMatches, requireAdmin, startSession } from '@/lib/admin-auth';
import { rateLimited } from '@/lib/enquiries';
import { ENQUIRY_STATUSES, deleteProject, getProject, projectSchema, saveEstimator, savePlans, saveProject, setEnquiryStatus } from '@/lib/db';
import { estimatorSchema, planSchema } from '@/lib/pricing';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const issues = (e: z.ZodError) => e.issues.slice(0, 4).map((i) => `${i.path.join('.') || 'value'}: ${i.message}`).join('; ');

/** Prices and projects appear across the public site, so refresh all of it. */
const refreshSite = () => revalidatePath('/', 'layout');

export async function login(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  if (!adminConfigured()) return { error: 'Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.' };
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(`admin-login:${ip}`, 8)) return { error: 'Too many attempts. Wait a few minutes.' };
  if (!passwordMatches(String(formData.get('password') ?? ''))) return { error: 'That password is not right.' };
  await startSession();
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

export async function savePlansAction(plans: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.array(planSchema).min(1).safeParse(plans);
  if (!parsed.success) return { ok: false, error: issues(parsed.error) };
  const ids = new Set<string>();
  for (const p of parsed.data) {
    if (ids.has(p.id)) return { ok: false, error: `Two plans share the id "${p.id}".` };
    ids.add(p.id);
  }
  await savePlans(parsed.data);
  refreshSite();
  return { ok: true, message: 'Prices saved and published.' };
}

export async function saveEstimatorAction(config: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = estimatorSchema.safeParse(config);
  if (!parsed.success) return { ok: false, error: issues(parsed.error) };
  await saveEstimator(parsed.data);
  refreshSite();
  return { ok: true, message: 'Estimator rates saved and published.' };
}

export async function saveProjectAction(project: unknown, previousSlug: string | null): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(project);
  if (!parsed.success) return { ok: false, error: issues(parsed.error) };
  if (parsed.data.slug !== previousSlug && await getProject(parsed.data.slug, { includeUnpublished: true })) {
    return { ok: false, error: `Another project already uses the address “${parsed.data.slug}”.` };
  }
  await saveProject(parsed.data, previousSlug ?? undefined);
  refreshSite();
  return { ok: true, message: parsed.data.published ? 'Project saved and published.' : 'Project saved as a draft (not published).' };
}

export async function deleteProjectAction(slug: string): Promise<ActionResult> {
  await requireAdmin();
  await deleteProject(z.string().min(1).parse(slug));
  refreshSite();
  return { ok: true };
}

export async function setEnquiryStatusAction(id: number, status: string): Promise<ActionResult> {
  await requireAdmin();
  const s = z.enum(ENQUIRY_STATUSES).safeParse(status);
  if (!s.success || !Number.isInteger(id)) return { ok: false, error: 'Invalid status.' };
  await setEnquiryStatus(id, s.data);
  revalidatePath('/admin');
  return { ok: true };
}
