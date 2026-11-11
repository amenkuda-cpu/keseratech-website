import { requireAdmin } from '@/lib/admin-auth';
import { listWaitlist } from '@/lib/db';

export const dynamic = 'force-dynamic';

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Harare' }).format(new Date(iso));

export default async function WaitlistPage() {
  await requireAdmin();
  const entries = await listWaitlist('amey-ai');
  const emails = entries.map((e) => e.email).join(', ');

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-title">Amey AI waitlist</h1>
          <p className="mt-2 text-sm text-dim">{entries.length} {entries.length === 1 ? 'person' : 'people'} signed up. Times are Harare time.</p>
        </div>
        {entries.length > 0 && (
          <a href={`mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent('Amey AI')}`} className="rounded-sm border border-hair px-3 py-2 text-sm text-dim hover:text-white">
            Email everyone (BCC)
          </a>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-10 rounded-[6px] border border-dashed border-hair p-8 text-dim">No sign-ups yet. People who join from the Amey AI section on the home page appear here.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[6px] border border-hair">
          <table className="w-full text-left text-sm">
            <thead className="t-label text-faint">
              <tr className="border-b border-hair">
                <th className="p-3 font-normal">Name</th>
                <th className="p-3 font-normal">Email</th>
                <th className="p-3 font-normal">Business</th>
                <th className="p-3 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-hair last:border-0">
                  <td className="p-3 text-white">{e.name}</td>
                  <td className="p-3"><a className="text-signal-soft underline" href={`mailto:${e.email}`}>{e.email}</a></td>
                  <td className="p-3 text-dim">{e.business ?? '—'}</td>
                  <td className="p-3 whitespace-nowrap text-faint">{when(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
