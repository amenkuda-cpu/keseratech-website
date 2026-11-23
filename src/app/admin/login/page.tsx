import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/admin-auth';
import { LoginForm } from '@/components/admin/login-form';
import mark from '../../../../public/brand/kesera-k-mark.png';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } };

// iPhone-style sign-in: a deep blue "wallpaper", one frosted-glass card, an app icon, a grouped field list.
export default async function AdminLogin() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main
      className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', var(--font-manrope), system-ui, sans-serif" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#030b1f_0%,#06163a_35%,#0b2b66_70%,#1557b8_100%)]" />
      <div className="absolute -left-40 top-[-10%] size-[520px] rounded-full bg-[#3fa3ff]/30 blur-[120px]" />
      <div className="absolute -right-32 bottom-[-15%] size-[480px] rounded-full bg-[#6b5cff]/25 blur-[120px]" />

      <div className="relative w-full max-w-[380px]">
        <div className="rounded-[34px] border border-white/15 bg-white/[0.09] p-7 pt-9 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)] backdrop-blur-2xl sm:p-8 sm:pt-10">
          <div className="mx-auto grid size-[76px] place-items-center rounded-[22px] bg-gradient-to-b from-white to-[#e8eef8] shadow-[0_12px_30px_-10px_rgb(0_0_0/0.55)]">
            <Image src={mark} alt="Kesera" className="h-auto w-[46px]" priority />
          </div>
          <h1 className="mt-6 text-center text-[28px] font-bold tracking-[-0.02em] text-white">Kesera Admin</h1>
          <p className="mt-1 text-center text-[15px] text-white/60">Sign in with your admin email</p>
          {adminConfigured() ? (
            <LoginForm />
          ) : (
            <p className="mt-8 rounded-2xl bg-white/10 p-4 text-center text-sm text-white/75">Admin is switched off. Set ADMIN_SESSION_SECRET and restart the site.</p>
          )}
        </div>
        <p className="mt-6 text-center text-[12px] text-white/40">Kesera Technologies · Control centre</p>
      </div>
    </main>
  );
}
