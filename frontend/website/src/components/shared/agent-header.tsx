'use client';
import Link from 'next/link';
import { Bell, Landmark, LogOut, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMe, useLogout } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';


export function AgentHeader() {
  const { data } = useMe();
  const logout = useLogout();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const initial = data?.name
    ? data.name.charAt(0).toUpperCase()
    : data?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="h-16 premium-glass border-b border-white/10 dark:border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-50 transition-all duration-300">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/properties" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center hover-lift shadow-md">
              <Landmark className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            <span className="text-xl font-extrabold tracking-tight hidden sm:block">
              Site<span className="gradient-text-vibrant">Bank</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        {pathname !== '/properties' && (
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search properties, leads..."
                className="w-full h-10 pl-9 pr-4 rounded-full bg-muted/40 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.06] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background dark:focus:bg-white/[0.06] focus:border-primary/20 transition-all duration-300 shadow-inner"
              />
            </div>
          </div>
        )}

        <div className={pathname !== '/properties' ? 'flex-1 sm:hidden' : 'flex-1'} />

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          </Button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-muted/50 dark:hover:bg-white/[0.04] transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-premium-hover ring-2 ring-background hover-lift">
                {initial}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold leading-tight">
                  {data?.name || data?.email?.split('@')[0] || 'Agent'}
                </p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  {data?.role?.replace(/_/g, ' ') || 'Agent'}
                </p>
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 premium-glass-card rounded-3xl p-2 animate-slide-in-down z-50 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)] border border-white/10">
                <div className="px-3 py-3 mb-1 bg-muted/30 dark:bg-white/[0.02] rounded-2xl">
                  <p className="text-sm font-bold leading-tight truncate">
                    {data?.name || data?.email?.split('@')[0] || 'Agent'}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-primary font-bold mt-0.5">
                    {data?.role?.replace(/_/g, ' ') || 'Agent'}
                  </p>
                </div>
                {data?.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-sm rounded-2xl hover:bg-accent/10 hover:text-accent transition-colors font-bold"
                  >
                    Admin Panel
                  </Link>
                )}
                {data?.role === 'AGENCY_ADMIN' && (
                  <Link
                    href="/agency"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex w-full items-center px-4 py-3 text-sm rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors font-bold"
                  >
                    Agency Management
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex w-full items-center px-4 py-3 text-sm rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors font-semibold"
                >
                  Profile Settings
                </Link>
                <div className="h-px bg-border/50 dark:bg-white/[0.06] my-1 mx-3" />
                <button
                  onClick={() => { setProfileDropdownOpen(false); logout.mutate(); }}
                  className="flex w-full items-center px-4 py-3 text-sm rounded-2xl hover:bg-destructive/10 text-destructive transition-colors font-semibold"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
