'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Bot, Building2, ExternalLink, FolderKanban, Inbox, LayoutGrid, Landmark, ShieldCheck, Tag, UserPlus, Users } from 'lucide-react';

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

export function Sidebar({ newEnquiries, newHireRequests }: { newEnquiries: number; newHireRequests: number }) {
  const path = usePathname();
  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Dashboard',
      items: [
        { href: '/admin', label: 'Overview', icon: LayoutGrid },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/finance', label: 'Finance', icon: Landmark },
      ],
    },
    {
      title: 'AI Workforce',
      items: [
        { href: '/admin/workforce', label: 'AI employees', icon: Bot },
        { href: '/admin/customers', label: 'Customers', icon: Building2 },
        { href: '/admin/hire-requests', label: 'Hire requests', icon: UserPlus, badge: newHireRequests },
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
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
      {sections.map((s) => (
        <div key={s.title}>
          <div className="nav-section">{s.title}</div>
          <ul className="space-y-0.5">
            {s.items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} aria-current={active(i.href) ? 'page' : undefined} className="nav-link">
                  <i.icon className="size-[17px] shrink-0 opacity-90" />
                  <span className="flex-1">{i.label}</span>
                  {!!i.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/15 px-1.5 text-[11px] font-bold text-white ring-1 ring-white/25">{i.badge}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="nav-section">Live sites</div>
      <a href="/" target="_blank" rel="noreferrer" className="nav-link">
        <ExternalLink className="size-[17px] shrink-0 opacity-90" />
        <span className="flex-1">keseratech.com</span>
      </a>
      <a href="https://workforce.keseratech.com/admin" target="_blank" rel="noreferrer" className="nav-link">
        <ExternalLink className="size-[17px] shrink-0 opacity-90" />
        <span className="flex-1">Workforce app admin</span>
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
    ['/admin/workforce', 'AI employees'],
    ['/admin/customers', 'Customers'],
    ['/admin/hire-requests', 'Hire requests'],
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
          <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={on ? 'shrink-0 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#0a2558]' : 'shrink-0 rounded-full px-3 py-1.5 text-[13px] text-white/75'}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
