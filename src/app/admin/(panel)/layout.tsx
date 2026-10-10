import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { Logo } from '@/components/site/logo';
import { AdminNav } from '@/components/admin/admin-nav';
import { logout } from '../actions';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-hair bg-void/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" aria-label="Admin home"><Logo className="w-[96px]" /></Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-dim hover:text-white">View site</Link>
            <form action={logout}><button className="text-dim hover:text-white">Sign out</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
