'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineTester } from '@/components/routing/EngineTester';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Github,
  Activity,
  X,
  Cpu,
  Zap,
  BarChart3,
  FlaskConical,
  BookOpen,
} from 'lucide-react';

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[var(--text-primary)]">ADE</span>
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-500 rounded-full">
                <FlaskConical className="w-3 h-3" />
                Test Console
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => setShowStatus(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Status</span>
            </button>
            <a
              href="https://github.com/samaig-araviel/ade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-[var(--text-tertiary)]">
                <span className="font-semibold text-[var(--text-primary)]">10</span> Models
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-[var(--text-tertiary)]">
                <span className="font-semibold text-[var(--text-primary)]">&lt;50ms</span> Target
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-[var(--text-tertiary)]">
                <span className="font-semibold text-[var(--text-primary)]">7</span> Factors
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-[var(--text-tertiary)]">
                <span className="font-semibold text-[var(--text-primary)]">3</span> Providers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              Engine Test Console
            </h1>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              Test the ADE routing engine with full control over prompts, human context, and constraints
            </p>
          </div>

          {/* Tester Component */}
          <EngineTester />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-quaternary)]">
            <span>Araviel Decision Engine v0.1.0</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Anthropic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                OpenAI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Google
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowStatus(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-auto bg-[var(--bg-primary)] rounded-xl border border-[var(--border-primary)] shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">System Status</h2>
                <button
                  onClick={() => setShowStatus(false)}
                  className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
