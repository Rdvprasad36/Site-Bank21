'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { setAccessToken, getAccessToken } from '@/lib/auth';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const qc = useQueryClient();

  const form = useForm<FormData>({ resolver: zodResolver(schema) });


  // Silent refresh on mount
  useEffect(() => {
    async function checkExistingSession() {
      const existingToken = getAccessToken();
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
      
      try {
        // If we don't have a token, try to refresh via cookie
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const payload = res.data?.data ?? res.data;
        if (payload?.accessToken) {
          setAccessToken(payload.accessToken);
          router.replace('/properties');
          return;
        }
      } catch {
        // If refresh fails, they really need to log in
      } finally {
        setInitialChecking(false);
      }
    }
    
    checkExistingSession();
  }, [router]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
      const res = await axios.post(
        `${API_URL}/auth/login`,
        data,
        { withCredentials: true },
      );
      const payload = res.data?.data ?? res.data;
      setAccessToken(payload.accessToken);
      qc.clear(); // Wipe residual cache
      router.push('/properties');
    } catch (err: unknown) {
      let msg = 'Login failed. Check your credentials.';
      if (axios.isAxiosError(err)) {
        const dataMsg = err.response?.data?.message;
        if (Array.isArray(dataMsg)) {
          msg = dataMsg.join(', ');
        } else if (typeof dataMsg === 'string') {
          msg = dataMsg;
        } else if (err.message) {
          msg = err.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      toast({ title: 'Sign in failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  if (initialChecking) {
    return (
      <div className="premium-glass-card rounded-[1.25rem] p-5 sm:p-6">
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Restoring session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-glass-card rounded-[1.25rem] p-5 sm:p-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-5 pt-2 animate-slide-in-down">

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@example.com"
              {...form.register('email')}
              className="rounded-xl h-11 bg-background"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Lock className="h-4 w-4 text-muted-foreground" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              className="rounded-xl h-11 bg-background"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              <span className="inline-flex items-center gap-2">
                {/* green dot removed */}
                <span className="inline-flex items-center gap-2">Enter Workspace</span>
              </span>
            )}
          </Button>


          <div className="flex flex-col gap-3">
            <p className="text-sm text-center">
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-primary transition-colors font-semibold"
              >
                Forgot password?
              </Link>
            </p>

            <div className="h-px bg-border w-full my-1" />

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Agent & Agency Login
            </p>

            <p className="text-sm text-muted-foreground text-center">
              No account?{' '}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

