import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { listEnquiries } from '@/lib/db';
import { MobileNav, Sidebar } from '@/components/admin/sidebar';
import { Logo } from '@/components/site/logo';
import { logout } from '../actions';
import './amey.css';

export const metadata: Metadata = { title: 'Kesera Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect('/admin/new-password');
  const fresh = (await listEnquiries()).filter((e) => e.status === 'NEW');
  const newEnquiries = fresh.length;
  const newHireRequests = fresh.filter((e) => e.data.source === 'ai-workforce').length;
  const initial = admin.name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <div className="amey lg:flex">
      <aside className="amey-sidebar sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col text-white lg:flex">
        <Link href="/admin" className="block px-6 pb-3 pt-7" aria-label="Kesera admin home">
          <Logo className="w-[150px]" priority />
          <span className="mt-2 block text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/45">Control centre</span>
        </Link>
        <Sidebar newEnquiries={newEnquiries} newHireRequests={newHireRequests} />
        <div className="m-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#3fa3ff] to-[#1c5cab] font-bold ring-2 ring-white/20">{initial}</span>
            <Link href="/admin/team" className="min-w-0 flex-1 leading-tight" title="Your account">
              <span className="block text-[11px] text-white/60">Signed in as</span>
              <span className="block truncate text-sm font-semibold">{admin.name}</span>
              <span className="block truncate text-[11px] text-white/60">{admin.email}</span>
            </Link>
            <form action={logout}>
              <button aria-label="Sign out" title="Sign out" className="grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="amey-sidebar px-4 py-3 text-white lg:hidden">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Logo className="w-[112px]" />
            <div className="flex items-center gap-2 text-right text-[11px] leading-tight text-white/70">
              <span>
                Signed in as <span className="font-semibold text-white">{admin.name}</span>
              </span>
              <form action={logout}>
                <button aria-label="Sign out" className="grid size-8 place-items-center rounded-full hover:bg-white/10">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          <MobileNav newEnquiries={newEnquiries} />
        </header>
        <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <form action="/admin/enquiries" className="relative mb-6 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[#6b7a93]" />
            <input name="q" placeholder="Search enquiries, clients, emails…" aria-label="Search enquiries" className="h-11 w-full rounded-full border border-[#e3e9f2] bg-white pl-11 pr-4 text-sm text-[#14213d] shadow-[0_8px_24px_-18px_rgb(13_54_107/0.35)] outline-none placeholder:text-[#8a97ad] focus:border-[#2a78d6] focus:ring-4 focus:ring-[#2a78d6]/10" />
          </form>
          <main className="amey-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
