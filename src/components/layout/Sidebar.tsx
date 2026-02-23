'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const NAV_ITEMS = [
  {
    label: 'Playground',
    href: '/playground',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4l6-2 6 2v8l-6 2-6-2V4z" />
        <path d="M2 4l6 2 6-2" />
        <path d="M8 6v8" />
      </svg>
    ),
  },
  {
    label: 'Models',
    href: '/models',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Docs',
    href: '/docs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M6 5h4M6 8h4M6 11h2" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] border-r flex flex-col"
      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
            style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)' }}>
            A
          </div>
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              ADE
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              Decision Engine
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3">
        <div className="text-[10px] font-medium uppercase tracking-wider px-2 mb-2"
          style={{ color: 'var(--text-quaternary)' }}>
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium no-underline transition-colors mb-0.5"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between"
        style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-success)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Online</span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
