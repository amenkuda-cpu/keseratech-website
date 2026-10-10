'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Enquiries' },
  { href: '/admin/pricing', label: 'Pricing' },
  { href: '/admin/projects', label: 'Projects' },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto">
      {ITEMS.map((i) => {
        const active = i.href === '/admin' ? path === '/admin' : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? 'page' : undefined} className={cn('rounded-sm px-3 py-2 text-sm', active ? 'bg-white/10 text-white' : 'text-dim hover:text-white')}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
