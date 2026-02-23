'use client';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
