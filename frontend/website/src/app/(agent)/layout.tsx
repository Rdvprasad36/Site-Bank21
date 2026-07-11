import { AgentHeader } from '@/components/shared/agent-header';
import { AgentBottomNav } from '@/components/shared/agent-bottom-nav';
import { AuthGate } from '@/components/shared/auth-gate';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex flex-col min-h-screen bg-background">
        <AgentHeader />
        {/* pb accounts for the bottom nav height on all screen sizes */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar pb-32 md:pb-36">
          {children}
        </main>
        <AgentBottomNav />
      </div>
    </AuthGate>
  );
}
