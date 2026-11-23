import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/admin-auth';
import { FirstPasswordForm } from '@/components/admin/first-password-form';
import { logout } from '../actions';

export const metadata: Metadata = { title: 'Choose your password', robots: { index: false } };

export default async function NewPasswordPage() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  if (!admin.mustChangePassword) redirect('/admin');
  return (
    <main className="grid min-h-dvh place-items-center bg-[linear-gradient(180deg,#0a2463_0%,#0d3a8f_45%,#1660c9_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 text-[#14213d] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)] sm:p-8">
        <p className="text-sm text-[#6b7a93]">Signed in as {admin.email}</p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-[#0a2463]">Welcome, {admin.name.split(' ')[0]}. Choose your password</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#41506b]">
          You signed in with a temporary password. Pick your own now; the temporary one stops working as soon as you save. Use at least 10 characters, with letters and a number.
        </p>
        <FirstPasswordForm />
        <form action={logout} className="mt-4 text-center">
          <button className="text-sm text-[#6b7a93] hover:text-[#14213d]">Sign out instead</button>
        </form>
      </div>
    </main>
  );
}
