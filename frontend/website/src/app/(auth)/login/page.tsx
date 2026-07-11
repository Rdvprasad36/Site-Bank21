import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Building2 } from 'lucide-react';

const DOTLOTTIE_SCRIPT =
  'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js';

export const metadata: Metadata = { title: 'Sign In | SiteBank' };

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* ambient mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="mesh-bg-blob"
          style={{ left: '-10%', top: '-12%', width: 560, height: 560 }}
        />
        <div
          className="mesh-bg-blob"
          style={{ right: '-16%', top: '8%', width: 560, height: 560 }}
        />
        <div
          className="mesh-bg-blob"
          style={{ left: '10%', bottom: '-26%', width: 560, height: 560 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[1020px] animate-slide-up-fade">
          {/* Header: logo + SiteBank side-by-side, and tagline below */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center premium-glass">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xl font-extrabold tracking-tight text-foreground">
                Site<span className="text-primary">Bank</span>
              </div>
            </div>
          </div>


          {/* Main box: side-by-side login & animation */}
          <div className="premium-glass-card rounded-[1.25rem] p-6 sm:p-7 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
              {/* Left: Welcome + Login */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-center lg:text-left">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground text-center lg:text-left mt-1">
                  Sign in to your agent or agency workspace.
                </p>

                <div className="mt-6">
                  <LoginForm />
                </div>
              </div>

              {/* Right: Animation */}
              <div className="relative overflow-hidden rounded-[1.25rem]">
                <div
                  className="mesh-bg-blob"
                  style={{ left: '-20%', top: '-30%', width: 420, height: 420 }}
                />

                <div className="relative z-10 flex items-center justify-center h-full p-2">
                  {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                  <script src={DOTLOTTIE_SCRIPT} type="module" />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `
                        <dotlottie-wc
                          src="https://lottie.host/aca9a8d9-6e57-471f-baff-0204ab1d0549/wJMvjwWCIa.lottie"
                          style="width: 420px; height: 420px;"
                          autoplay
                        ></dotlottie-wc>

                      `,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

