'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  CheckCircle,
  Copy,
  FlaskConical,
  Search,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { StatusPage } from '@/components/status/StatusPage';
import { AdeProvider, useAde } from '@/lib/dashboard/context';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/router', label: 'Router', icon: Search },
  { href: '/analyze', label: 'Analyze', icon: FlaskConical },
  { href: '/models', label: 'Models', icon: Box },
];

function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function StatusBadge() {
  const { health, healthLoading, openStatus } = useAde();
  const dotColor =
    health?.status === 'healthy'
      ? '#22C55E'
      : health?.status === 'degraded'
        ? '#F59E0B'
        : '#EF4444';
  const label = healthLoading
    ? 'Checking...'
    : health?.status === 'healthy'
      ? 'All Systems Go'
      : health?.status || 'Status';

  return (
    <button
      onClick={openStatus}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 12,
        color: '#374151',
        background: '#F9FAFB',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.15s ease',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          background: dotColor,
          borderRadius: '50%',
          boxShadow: health?.status === 'healthy' ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
        }}
      />
      {label}
    </button>
  );
}

function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link
            href="/router"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                A
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#111',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                ADE
              </div>
              <div
                style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.02em' }}
              >
                Decision Engine
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    fontSize: 13,
                    color: active ? '#111' : '#6B7280',
                    background: active ? '#F3F4F6' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon style={{ width: 15, height: 15, opacity: active ? 1 : 0.6 }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            v1.0.0
          </span>
          <StatusBadge />
        </div>
      </div>
    </header>
  );
}

function StatusModal() {
  const { statusOpen, closeStatus, health } = useAde();

  return (
    <AnimatePresence>
      {statusOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={closeStatus}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              maxHeight: '80vh',
              overflow: 'auto',
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #E5E5E5',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #E5E5E5',
                background: '#fff',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>System Status</span>
              <button
                onClick={closeStatus}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: 14, height: 14, color: '#666' }} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              {health && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 14,
                    background: health.status === 'healthy' ? '#ECFDF5' : '#FEF2F2',
                    borderRadius: 10,
                    border: `1px solid ${health.status === 'healthy' ? '#D1FAE5' : '#FECACA'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {health.status === 'healthy' ? (
                      <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />
                    ) : (
                      <XCircle style={{ width: 16, height: 16, color: '#DC2626' }} />
                    )}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: health.status === 'healthy' ? '#059669' : '#DC2626',
                        textTransform: 'capitalize',
                      }}
                    >
                      {health.status}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: '#4B5563',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div>
                      <strong>Version:</strong> {health.version}
                    </div>
                    <div>
                      <strong>Engine:</strong> {health.services.engine}
                    </div>
                    <div>
                      <strong>Store:</strong> {health.services.store}
                    </div>
                  </div>
                </div>
              )}
              <StatusPage />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function highlightJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&quot;([^&]+)&quot;:/g, (_: string, key: string) => `<span style="color:#7DD3FC">"${key}"</span>:`)
    .replace(/: &quot;([^&]+)&quot;/g, (_: string, val: string) => `: <span style="color:#FDE68A">"${val}"</span>`)
    .replace(/: (\d+\.?\d*)/g, (_: string, num: string) => `: <span style="color:#FDA4AF">${num}</span>`)
    .replace(/: (true|false)/g, (_: string, bool: string) => `: <span style="color:#A78BFA">${bool}</span>`)
    .replace(/: (null)/g, (_: string, n: string) => `: <span style="color:#6B7280">${n}</span>`)
    .split('\n')
    .map((line: string, i: number) => `<span style="color:#4B5563;user-select:none">${String(i + 1).padStart(3, ' ')} </span>${line}`)
    .join('\n');
}

function JsonModal() {
  const { jsonModal, closeJsonModal } = useAde();

  if (!jsonModal) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
          onClick={closeJsonModal}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 720,
            maxHeight: '80vh',
            overflow: 'hidden',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E5E5E5',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #E5E5E5',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{jsonModal.title}</span>
              <span
                style={{
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#059669',
                  background: '#ECFDF5',
                  borderRadius: 4,
                }}
              >
                200 OK
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(JSON.stringify(jsonModal.data, null, 2));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  fontSize: 12,
                  color: '#374151',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <Copy style={{ width: 12, height: 12 }} />
                Copy
              </button>
              <button
                onClick={closeJsonModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: 14, height: 14, color: '#666' }} />
              </button>
            </div>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <div style={{ background: '#18181B', padding: 20, minHeight: 200 }}>
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  color: '#E4E4E7',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
                dangerouslySetInnerHTML={{ __html: highlightJson(jsonModal.data) }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <TopNav />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>{children}</main>
      <StatusModal />
      <JsonModal />
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .router-grid {
          grid-template-columns: 1fr 360px;
        }
        .models-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 1024px) {
          .router-grid {
            grid-template-columns: 1fr !important;
          }
          .models-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .router-grid {
            grid-template-columns: 1fr !important;
          }
          .models-grid {
            grid-template-columns: 1fr !important;
          }
          main {
            padding: 16px !important;
          }
          header > div {
            padding: 0 16px !important;
          }
        }

        @media (max-width: 480px) {
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdeProvider>
      <DashboardShell>{children}</DashboardShell>
    </AdeProvider>
  );
}
