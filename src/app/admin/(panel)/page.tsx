import { requireAdmin } from '@/lib/admin-auth';
import { listEnquiries } from '@/lib/db';
import { referenceFor } from '@/lib/enquiries';
import { formatUsd } from '@/lib/pricing';
import { EnquiryStatusSelect } from '@/components/admin/enquiry-status';

export const dynamic = 'force-dynamic';

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Harare' }).format(new Date(iso));

export default async function EnquiriesPage() {
  await requireAdmin();
  const enquiries = await listEnquiries();
  const open = enquiries.filter((e) => e.status === 'NEW').length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-title">Enquiries</h1>
          <p className="mt-2 text-sm text-dim">{enquiries.length} received · {open} new. Times are Harare time.</p>
        </div>
      </div>

      {enquiries.length === 0 ? (
        <p className="mt-10 rounded-[6px] border border-dashed border-hair p-8 text-dim">No enquiries yet. Submissions from the project builder appear here.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="rounded-[6px] border border-hair bg-deep/40">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-4 md:p-5">
                  <span className="t-label text-faint">{referenceFor(e.id)}</span>
                  <span className="min-w-40 flex-1">
                    <span className="block font-medium text-white">{e.data.name}{e.data.company ? ` · ${e.data.company}` : ''}</span>
                    <span className="block text-sm text-dim">{e.data.service}{e.data.projectType ? ` / ${e.data.projectType}` : ''}{e.data.package ? ` / ${e.data.package}` : ''}</span>
                  </span>
                  <span className="text-sm tabular-nums text-white">
                    {e.data.estimateLowCents !== null ? `${formatUsd(e.data.estimateLowCents)} – ${formatUsd(e.data.estimateHighCents ?? e.data.estimateLowCents)}` : 'No estimate'}
                  </span>
                  <span className="text-sm text-faint">{when(e.createdAt)}</span>
                  <EnquiryStatusSelect id={e.id} status={e.status} />
                </summary>
                <div className="grid gap-6 border-t border-hair p-4 text-sm md:grid-cols-3 md:p-5">
                  <dl className="space-y-2">
                    <div><dt className="t-label text-faint">Email</dt><dd><a className="text-signal-soft underline" href={`mailto:${e.data.email}?subject=${encodeURIComponent(`Your project (${referenceFor(e.id)})`)}`}>{e.data.email}</a></dd></div>
                    <div><dt className="t-label text-faint">Phone</dt><dd>{e.data.phone ? <a className="underline" href={`tel:${e.data.phone.replace(/\s/g, '')}`}>{e.data.phone}</a> : '—'}</dd></div>
                    <div><dt className="t-label text-faint">Timeline</dt><dd>{e.data.timeline ?? '—'}</dd></div>
                    <div><dt className="t-label text-faint">Users</dt><dd>{e.data.users ?? '—'}</dd></div>
                  </dl>
                  <div>
                    <p className="t-label text-faint">Features</p>
                    <p className="mt-2">{e.data.features.length ? e.data.features.join(', ') : '—'}</p>
                  </div>
                  <div>
                    <p className="t-label text-faint">Description</p>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed text-white/85">{e.data.description}</p>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
