'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/components/system/reduced-motion';
import { Menu, X } from 'lucide-react';
import { Dialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';
import { COMPANY, DIVISIONS, NAV } from '@/content/site';
import { Cta, Dot } from '@/components/system/primitives';
import { Logo } from './logo';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Light ("paper") pages start under the header, so it must be solid there from the top.
  const solid = scrolled || pathname.startsWith('/start') || pathname.startsWith('/pricing');
  const isActive = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
        solid ? 'border-b border-hair bg-void/95 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-6">
        <Link href="/" aria-label="Kesera, home" className="-m-2 p-2">
          <Logo priority className="w-[104px] md:w-[118px]" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'relative rounded-sm px-3.5 py-2 text-[0.84rem] tracking-[0.01em] text-dim transition-colors hover:text-white',
                isActive(item.href) && 'text-white',
              )}
            >
              {item.label}
              {isActive(item.href) && <span aria-hidden className="absolute inset-x-3.5 -bottom-px h-px bg-signal" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Cta href="/start" className="hidden min-h-10 px-4 text-[0.72rem] sm:inline-flex">
            Start a project
          </Cta>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="grid size-11 place-items-center rounded-sm border border-hair text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Popup
                className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-void transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
                aria-label="Menu"
              >
                <div className="shell flex h-[68px] shrink-0 items-center justify-between">
                  <Logo className="w-[104px]" />
                  <Dialog.Close className="grid size-11 place-items-center rounded-sm border border-hair text-white" aria-label="Close menu">
                    <X className="size-5" strokeWidth={1.5} />
                  </Dialog.Close>
                </div>
                <nav aria-label="Mobile" className="shell flex flex-1 flex-col pt-8 pb-10">
                  <ul className="flex flex-col">
                    {[...NAV, { href: '/start', label: 'Start a project' }].map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-hair"
                      >
                        <Link href={item.href} className="t-title flex items-center justify-between py-5 text-[1.6rem]">
                          {item.label}
                          <span className="t-label text-faint">0{i + 1}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <p className="t-label mt-10 text-faint">Divisions</p>
                  <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    {DIVISIONS.map((d) => (
                      <li key={d.slug}>
                        <Link href={`/${d.slug}`} className="flex items-center gap-2.5 py-1 text-sm text-dim">
                          <Dot color={d.accent} size={6} />
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-10 text-sm text-dim">
                    <a href={`mailto:${COMPANY.email}`} className="block py-1">{COMPANY.email}</a>
                    <a href={COMPANY.phoneHref} className="block py-1">{COMPANY.phone}</a>
                  </div>
                </nav>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}

/** Phones: a Start Project bar that appears once the hero has scrolled away. */
export function MobileStartBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 520;
      setVisible(window.scrollY > window.innerHeight * 0.7 && !nearEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (pathname.startsWith('/start')) return null;
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 ease-out sm:hidden',
        visible ? 'translate-y-0' : 'translate-y-[120%]',
      )}
      aria-hidden={!visible}
    >
      <Cta href="/start" className="w-full shadow-[0_12px_40px_-8px_rgb(26_134_250/0.55)]" tabIndex={visible ? 0 : -1}>
        Start a project
      </Cta>
    </div>
  );
}
