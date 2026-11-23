import { requireAdmin } from '@/lib/admin-auth';
import { listAdmins } from '@/lib/db';
import { removeAdminAction } from '../../actions';
import { AddAdminForm, ChangePasswordForm } from '@/components/admin/team-forms';

export const dynamic = 'force-dynamic';

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Harare', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

export default async function TeamPage() {
  const me = await requireAdmin();
  const admins = await listAdmins();
  return (
    <div className="space-y-12">
      <section>
        <h1 className="t-title">Team</h1>
        <p className="mt-2 text-sm text-dim">
          People who can sign in to this admin. You are signed in as <span className="text-white">{me.name}</span> ({me.email}).
        </p>
        <div className="mt-8 overflow-x-auto rounded-[6px] border border-hair">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-hair text-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-hair last:border-0">
                  <td className="px-4 py-3 text-white">
                    {a.name} {a.id === me.id && <span className="ml-1 rounded-sm bg-white/10 px-1.5 py-0.5 text-[11px] text-dim">you</span>}
                  </td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3 text-dim">{when(a.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {a.id !== me.id && admins.length > 1 && (
                      <form action={removeAdminAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="text-dim hover:text-destructive">Remove</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-white">Add an admin</h2>
          <p className="mt-1 text-sm text-dim">Give them a starting password yourself. They will be asked to choose their own the first time they sign in.</p>
          <AddAdminForm />
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Change your password</h2>
          <p className="mt-1 text-sm text-dim">At least 10 characters, with letters and a number.</p>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
