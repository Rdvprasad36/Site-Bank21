'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMe } from '@/hooks/useAuth';
import { getAccessToken } from '@/lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = getAccessToken();
    if (!token && !isLoading) {
      router.replace('/login');
    }
    if (isError && !isLoading) {
      router.replace('/login');
    }
  }, [isError, isLoading, router]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
