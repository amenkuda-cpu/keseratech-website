'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { DUMMY_HASH, adminConfigured, currentAdmin, endSession, hashPassword, passwordProblem, requireAdmin, startSession, verifyPassword } from '@/lib/admin-auth';
import { rateLimited } from '@/lib/enquiries';
import { adminLoginLockedUntil, clearAdminLoginFailures, recordAdminLoginFailure, ENQUIRY_STATUSES, PAYMENT_METHODS, REVENUE_CATEGORIES, addRevenue, deleteRevenue, setRevenueTarget, createAdmin, deleteAdmin, findAdminByEmail, getAdmin, listAdmins, markAdminLogin, setAdminPassword, deleteProject, getProject, projectSchema, saveEstimator, savePlans, saveProject, setEnquiryStatus } from '@/lib/db';
import { estimatorSchema, planSchema } from '@/lib/pricing';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const issues = (e: z.ZodError) => e.issues.slice(0, 4).map((i) => `${i.path.join('.') || 'value'}: ${i.message}`).join('; ');

/** Prices and projects appear across the public site, so refresh all of it. */
const refreshSite = () => revalidatePath('/', 'layout');

export async function login(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string }> {
  if (!adminConfigured()) return { error: 'Admin is not configured. Set ADMIN_SESSION_SECRET.' };
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (rateLimited(`admin-login:${ip}`, 8) || rateLimited(`admin-login:${email}`, 8)) return { error: 'Too many attempts. Wait a few minutes.' };
  if (email && (await adminLoginLockedUntil(email))) return { error: 'Too many wrong passwords. This account is locked for 15 minutes.' };
  const admin = email ? await findAdminByEmail(email) : null;
  const ok = verifyPassword(String(formData.get('password') ?? ''), admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    if (email) await recordAdminLoginFailure(email);
    return { error: 'That email and password do not match an admin account.' };
  }
  await clearAdminLoginFailures(email);
  await markAdminLogin(admin.id);
  await startSession(admin.id);
  redirect(admin.mustChangePassword ? '/admin/new-password' : '/admin');
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
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin team

const newAdminSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().max(200),
});

export async function addAdminAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newAdminSchema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  const problem = passwordProblem(parsed.data.password);
  if (problem) return { ok: false, error: problem };
  if (await findAdminByEmail(parsed.data.email)) return { ok: false, error: 'That email is already an admin.' };
  await createAdmin({ email: parsed.data.email, name: parsed.data.name, passwordHash: hashPassword(parsed.data.password) });
  revalidatePath('/admin/team');
  return { ok: true, message: `${parsed.data.name} can now sign in with ${parsed.data.email}.` };
}

export async function removeAdminAction(formData: FormData) {
  const me = await requireAdmin();
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id === me.id) return;
  if ((await listAdmins()).length <= 1) return;
  await deleteAdmin(id);
  revalidatePath('/admin/team');
}

export async function changeMyPasswordAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const full = await getAdmin(me.id);
  if (!full || !verifyPassword(String(formData.get('current') ?? ''), full.passwordHash)) return { ok: false, error: 'Your current password is not right.' };
  const next = String(formData.get('next') ?? '');
  const problem = passwordProblem(next);
  if (problem) return { ok: false, error: problem };
  await setAdminPassword(me.id, hashPassword(next));
  return { ok: true, message: 'Password changed.' };
}

// ---------------------------------------------------------------------------
// Finance

const revenueSchema = z.object({
  receivedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick the date the money came in.'),
  client: z.string().trim().min(1, 'Who paid?').max(120),
  amount: z.coerce.number().positive('Enter an amount above 0.').max(1_000_000),
  category: z.enum(REVENUE_CATEGORIES),
  method: z.enum(PAYMENT_METHODS),
  note: z.string().trim().max(300).optional(),
});

export async function addRevenueAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const parsed = revenueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  const d = parsed.data;
  await addRevenue({ receivedOn: d.receivedOn, client: d.client, amountCents: Math.round(d.amount * 100), category: d.category, method: d.method, note: d.note || null, createdBy: me.email });
  revalidatePath('/admin', 'layout');
  return { ok: true, message: `Recorded $${d.amount.toFixed(2)} from ${d.client}.` };
}

export async function deleteRevenueAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (Number.isInteger(id) && id > 0) await deleteRevenue(id);
  revalidatePath('/admin', 'layout');
}

export async function setTargetAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ amount: z.coerce.number().positive('Enter a target above 0.').max(100_000_000), deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a deadline.') })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form.' };
  await setRevenueTarget({ amountCents: Math.round(parsed.data.amount * 100), deadline: parsed.data.deadline });
  revalidatePath('/admin', 'layout');
  return { ok: true, message: 'Target saved.' };
}

/** First sign-in: replace the temporary password, then go to the dashboard. */
export async function firstPasswordAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const me = await currentAdmin();
  if (!me) redirect('/admin/login');
  const full = await getAdmin(me.id);
  if (!full || !verifyPassword(String(formData.get('current') ?? ''), full.passwordHash)) return { ok: false, error: 'The temporary password is not right.' };
  const next = String(formData.get('next') ?? '');
  if (next !== String(formData.get('confirm') ?? '')) return { ok: false, error: 'The two new passwords do not match.' };
  if (verifyPassword(next, full.passwordHash)) return { ok: false, error: 'Choose a new password, not the temporary one.' };
  const problem = passwordProblem(next);
  if (problem) return { ok: false, error: problem };
  await setAdminPassword(me.id, hashPassword(next));
  redirect('/admin');
}

/** One-click publish / unpublish from the projects list. */
export async function toggleProjectPublishedAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get('slug') ?? '');
  const p = slug ? await getProject(slug, { includeUnpublished: true }) : null;
  if (!p) return;
  await saveProject({ ...p, published: !p.published }, p.slug);
  refreshSite();
  revalidatePath('/admin/projects');
}

/** Control centre: free months, pause or resume an AI employee in the Workforce app. */
export async function workforceEmployeeActionForm(formData: FormData) {
  const me = await requireAdmin();
  const employeeId = String(formData.get('employeeId') ?? '');
  const action = String(formData.get('action') ?? '');
  if (!employeeId || !['comp', 'suspend', 'resume'].includes(action)) return;
  const { workforceEmployeeAction } = await import('@/lib/workforce-feed');
  const r = await workforceEmployeeAction(employeeId, action as 'comp' | 'suspend' | 'resume', me.email, Number(formData.get('months') ?? 1));
  revalidatePath('/admin', 'layout');
  redirect(`/admin/customers?${new URLSearchParams({ [r.ok ? 'done' : 'error']: r.message })}`);
}
