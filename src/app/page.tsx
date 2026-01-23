'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptTester } from '@/components/routing/PromptTester';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Github,
  Activity,
  X,
  Cpu,
  Zap,
  BarChart3,
} from 'lucide-react';

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold text-[var(--text-primary)]">ADE</span>
              <span className="text-[10px] text-[var(--text-quaternary)] hidden sm:inline">Araviel Decision Engine</span>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Quick Stats Bar */}
        <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
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
                  <span className="font-semibold text-[var(--text-primary)]">&lt;20ms</span> Latency
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-[var(--text-tertiary)]">
                  <span className="font-semibold text-[var(--text-primary)]">7</span> Scoring Factors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Interface */}
        <div className="flex-1 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Title Section */}
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                Intelligent LLM Router
              </h1>
              <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">
                Enter a prompt to find the optimal AI model
              </p>
            </div>

            {/* Main Tester Component */}
            <PromptTester />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-quaternary)]">
            <span>ADE by Araviel</span>
            <div className="flex items-center gap-4">
              <span>Anthropic</span>
              <span>OpenAI</span>
              <span>Google</span>
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
