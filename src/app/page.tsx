'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PromptTester } from '@/components/routing/PromptTester';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Zap,
  Brain,
  Shield,
  Github,
  ArrowRight,
  Activity,
  X
} from 'lucide-react';

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[var(--text-primary)]">ADE</span>
              <span className="text-xs text-[var(--text-quaternary)]">by Araviel</span>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setShowStatus(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Status</span>
            </button>
            <a
              href="https://github.com/samaig-araviel/ade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="#tester"
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Now
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                Intelligent AI Routing
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              The{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Intelligent
              </span>
              <br />
              LLM Router
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed"
            >
              ADE automatically selects the optimal AI model for every prompt.
              <br className="hidden sm:block" />
              Smarter routing means better results, lower costs, and faster responses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <a
                href="#tester"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
              >
                Try It Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-accent)] transition-colors"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: '10+', label: 'Models' },
              { value: '<20ms', label: 'Avg Latency' },
              { value: '7', label: 'Scoring Factors' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[var(--text-quaternary)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              How It Works
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
              ADE uses a sophisticated multi-factor scoring system to match your prompt with the perfect model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Intelligent Analysis',
                description: 'Understands intent, domain, complexity, and tone from any prompt'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Routes decisions in under 50ms with optimized scoring algorithms'
              },
              {
                icon: Shield,
                title: 'Enterprise Ready',
                description: 'Production-grade with fallbacks, backups, and confidence scores'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tester Section */}
      <section id="tester" className="border-t border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Live Demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Experience ADE in Action
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
              Enter any prompt and watch as ADE analyzes it in real-time, scoring models across 7 different factors.
            </p>
          </div>

          <PromptTester />
        </div>
      </section>

      {/* Providers Section */}
      <section className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Supported Providers
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12">
            {[
              { name: 'Anthropic', color: 'text-amber-500' },
              { name: 'OpenAI', color: 'text-emerald-500' },
              { name: 'Google', color: 'text-blue-500' },
            ].map((provider) => (
              <div key={provider.name} className="text-center">
                <div className={`text-2xl font-bold ${provider.color}`}>
                  {provider.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-[var(--text-secondary)]">
                ADE - Araviel Decision Engine
              </span>
            </div>
            <div className="text-sm text-[var(--text-quaternary)]">
              © 2025 Araviel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Status Modal */}
      {showStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStatus(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-auto bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">System Status</h2>
              <button
                onClick={() => setShowStatus(false)}
                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <StatusPage />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
