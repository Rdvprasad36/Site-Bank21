'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Users, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const leftItems = [
  { href: '/properties', label: 'Home', icon: Home },
  { href: '/leads', label: 'Leads', icon: Users },
];

const rightItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AgentBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ─── Desktop View: Full Width Bar ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 premium-glass-panel border-t border-white/10 dark:border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.3)] hidden md:block pb-safe">
        <div className="flex items-center justify-around px-2 h-16 max-w-screen-xl mx-auto relative">
          {/* Left items */}
          {leftItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-5 h-full min-w-[64px] relative transition-all duration-300 group',
                  isActive ? 'text-primary dark:text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-8 rounded-lg transition-all duration-300',
                    isActive ? '' : 'group-hover:bg-muted/60 group-hover:scale-105'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none tracking-wide transition-opacity duration-300 uppercase',
                    isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center FAB – Add Property */}
          <div className="flex flex-col items-center justify-center px-5">
            <Link
              href="/properties/new"
              className="group relative flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-primary-gradient shadow-premium-hover border-[5px] border-background hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Add Property"
            >
              <Plus className="h-6 w-6 text-white drop-shadow-md transition-transform duration-500 group-hover:rotate-90" strokeWidth={2.5} />
            </Link>
            <span className="text-[10px] font-bold leading-none tracking-wide text-muted-foreground mt-1.5 opacity-60 uppercase">
              Add
            </span>
          </div>

          {/* Right items */}
          {rightItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-5 h-full min-w-[64px] relative transition-all duration-300 group',
                  isActive ? 'text-primary dark:text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-8 rounded-lg transition-all duration-300',
                    isActive ? '' : 'group-hover:bg-muted/60 group-hover:scale-105'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none tracking-wide transition-opacity duration-300 uppercase',
                    isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile View: Floating Dock ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-2 w-[98%] max-w-sm pointer-events-none md:hidden">
        <nav className="pointer-events-auto mx-auto w-full rounded-2xl bg-card shadow-2xl border border-border py-1.5 px-2 flex items-center justify-between gap-1 transition-all duration-300">
          {/* Left items */}
          {leftItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-11 relative transition-all duration-300 group',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-300',
                    isActive ? 'bg-primary text-white shadow-sm' : 'group-hover:bg-muted group-hover:scale-105'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-all duration-300',
                      isActive ? 'scale-100' : 'group-hover:scale-110'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[8px] font-bold tracking-tight transition-opacity duration-300 uppercase',
                    isActive ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center FAB – Add Property */}
          <div className="flex items-center justify-center -mt-6 mx-1 relative z-10">
            <Link
              href="/properties/new"
              className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary shadow-lg border-4 border-background hover:scale-110 active:scale-95 transition-all duration-500"
              aria-label="Add Property"
            >
              <Plus className="h-5 w-5 text-white transition-transform duration-500 group-hover:rotate-90" strokeWidth={3} />
            </Link>
          </div>

          {/* Right items */}
          {rightItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-11 relative transition-all duration-300 group',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-300',
                    isActive ? 'bg-primary text-white shadow-sm' : 'group-hover:bg-muted group-hover:scale-105'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-all duration-300',
                      isActive ? 'scale-100' : 'group-hover:scale-110'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[8px] font-bold tracking-tight transition-opacity duration-300 uppercase',
                    isActive ? 'opacity-100' : 'opacity-60'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
