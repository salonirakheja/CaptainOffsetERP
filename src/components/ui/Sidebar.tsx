'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/jobs', label: 'Jobs', icon: '📋' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/dispatch', label: 'Dispatch', icon: '🚚' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/people', label: 'People', icon: '🏭' },
  { href: '/reports', label: 'Reports', icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-sidebar min-h-screen flex flex-col fixed left-0 top-0 z-50 no-print">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-white font-bold text-lg tracking-tight">Captain Offset</h1>
        <p className="text-slate-400 text-xs mt-0.5">Factory ERP</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'text-white bg-white/10 border-r-2 border-accent'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-slate-500 text-xs">v1.0 &middot; Captain Offset ERP</p>
      </div>
    </aside>
  );
}
