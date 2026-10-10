import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/admin-auth';
import { Logo } from '@/components/site/logo';
import { LoginForm } from '@/components/admin/login-form';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Logo className="w-[150px]" />
        <h1 className="t-title mt-10">Website admin</h1>
        <p className="mt-2 text-sm text-dim">Prices, projects and enquiries.</p>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-8 rounded-[6px] border border-hair p-4 text-sm leading-relaxed text-dim">
            Admin is switched off. Set <code className="text-white">ADMIN_PASSWORD</code> and <code className="text-white">ADMIN_SESSION_SECRET</code> in the environment and restart the site.
          </p>
        )}
      </div>
    </main>
  );
}
