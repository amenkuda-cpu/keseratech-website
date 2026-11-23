'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ExternalLink, FolderKanban, Inbox, LayoutGrid, ShieldCheck, Tag, Target, Users } from 'lucide-react';

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

export function Sidebar({ newEnquiries }: { newEnquiries: number }) {
  const path = usePathname();
  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Dashboard',
      items: [
        { href: '/admin', label: 'Overview', icon: LayoutGrid },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/finance', label: 'Finance & target', icon: Target },
      ],
    },
    {
      title: 'People',
      items: [
        { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: newEnquiries },
        { href: '/admin/waitlist', label: 'Waitlist', icon: Users },
        { href: '/admin/team', label: 'Admins & team', icon: ShieldCheck },
      ],
    },
    {
      title: 'Website',
      items: [
        { href: '/admin/pricing', label: 'Pricing', icon: Tag },
        { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
      ],
    },
  ];
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
      {sections.map((s) => (
        <div key={s.title}>
          <div className="nav-section">{s.title}</div>
          <ul className="space-y-1">
            {s.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} aria-current={active(i.href) ? 'page' : undefined} className="nav-link">
                  <i.icon className="size-[18px] shrink-0" />
                  <span className="flex-1">{i.label}</span>
                  {!!i.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#22d3ee] px-1.5 text-[11px] font-bold text-[#0a2463]">{i.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="nav-section">Site</div>
      <a href="/" target="_blank" rel="noreferrer" className="nav-link">
        <ExternalLink className="size-[18px] shrink-0" />
        <span className="flex-1">View keseratech.com</span>
      </a>
    </nav>
  );
}

/** Phone-width navigation: the same links as a scrolling row of pills. */
export function MobileNav({ newEnquiries }: { newEnquiries: number }) {
  const path = usePathname();
  const items = [
    ['/admin', 'Overview'],
    ['/admin/analytics', 'Analytics'],
    ['/admin/finance', 'Finance'],
    ['/admin/enquiries', `Enquiries${newEnquiries ? ` (${newEnquiries})` : ''}`],
    ['/admin/waitlist', 'Waitlist'],
    ['/admin/team', 'Team'],
    ['/admin/pricing', 'Pricing'],
    ['/admin/projects', 'Projects'],
  ] as const;
  return (
    <nav aria-label="Admin" className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      {items.map(([href, label]) => {
        const on = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={on ? 'shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0a2463]' : 'shrink-0 rounded-full px-3 py-1.5 text-[13px] text-white/80'}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
