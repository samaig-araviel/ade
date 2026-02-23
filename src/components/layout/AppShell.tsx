'use client';

import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="ml-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
