import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import { listEnquiries } from '@/lib/db';
import { MobileNav, Sidebar } from '@/components/admin/sidebar';
import { logout } from '../actions';
import './amey.css';

export const metadata: Metadata = { title: 'Kesera Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (admin.mustChangePassword) redirect('/admin/new-password');
  const newEnquiries = (await listEnquiries()).filter((e) => e.status === 'NEW').length;
  const initial = admin.name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <div className="amey lg:flex">
      <aside className="amey-sidebar sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 pb-2 pt-6">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/15 text-lg font-extrabold shadow-inner ring-1 ring-white/30">K</span>
          <span className="leading-tight">
            <span className="block font-bold">Kesera Admin</span>
            <span className="block text-[11.5px] text-white/60">Intelligence. Automation. Evolution.</span>
          </span>
        </Link>
        <Sidebar newEnquiries={newEnquiries} />
        <div className="m-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#22d3ee] to-[#1a86fa] font-bold">{initial}</span>
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
            <span className="font-bold">Kesera Admin</span>
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
            <input name="q" placeholder="Search enquiries, clients, emails…" aria-label="Search enquiries" className="h-11 w-full rounded-full border border-white bg-white/80 pl-11 pr-4 text-sm text-[#14213d] shadow-[0_6px_20px_-12px_rgb(26_94_200/0.35)] outline-none backdrop-blur placeholder:text-[#8a97ad] focus:border-[#1a86fa]" />
          </form>
          <main className="amey-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
