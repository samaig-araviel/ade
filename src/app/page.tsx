'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PromptTester } from '@/components/routing/PromptTester';
import { StatusPage } from '@/components/status/StatusPage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Zap,
  Brain,
  Shield,
  ChevronDown,
  Github,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Intelligent Analysis',
      description: 'Understands intent, domain, complexity, and tone from any prompt'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Routes decisions in under 50ms with optimized scoring'
    },
    {
      icon: Shield,
      title: 'Enterprise Ready',
      description: 'Production-grade with fallbacks, backups, and confidence scores'
    },
  ];

  const stats = [
    { label: 'Models Supported', value: '10+' },
    { label: 'Avg Response Time', value: '<20ms' },
    { label: 'Scoring Factors', value: '7' },
    { label: 'Uptime', value: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-secondary/5 via-transparent to-transparent" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-accent-secondary/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-provider-anthropic/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-text-primary">ADE</span>
                <span className="text-sm text-text-quaternary ml-1">by Araviel</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => setShowStatus(!showStatus)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Activity className="w-4 h-4" />
                Status
              </button>
              <a
                href="https://github.com/samaig-araviel/ade"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <Button variant="secondary" size="sm">
                Documentation
              </Button>
            </motion.div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="info" size="md" pulse>
                Powered by Advanced AI Routing
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="text-text-primary">The </span>
              <span className="gradient-text">Intelligent</span>
              <br />
              <span className="text-text-primary">LLM Router</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-xl text-text-secondary max-w-2xl mx-auto"
            >
              ADE automatically selects the optimal AI model for every prompt.
              Smarter routing means better results, lower costs, and faster responses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                variant="gradient"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => {
                  document.getElementById('tester')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Try It Now
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</p>
                  <p className="mt-1 text-sm text-text-quaternary">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-text-quaternary"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg-secondary border-y border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-text-primary">How It Works</h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              ADE uses a sophisticated multi-factor scoring system to match your prompt
              with the perfect model from our registry of leading LLMs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-2xl bg-bg-primary border border-border-primary card-hover"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tester Section */}
      <section id="tester" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="success" size="md">Live Demo</Badge>
            <h2 className="mt-4 text-3xl font-bold text-text-primary">
              Experience ADE in Action
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Enter any prompt and watch as ADE analyzes it in real-time,
              scoring models across 7 different factors to find your perfect match.
            </p>
          </motion.div>

          <PromptTester />
        </div>
      </section>

      {/* Model Providers */}
      <section className="py-20 bg-bg-secondary border-y border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text-primary">Supported Providers</h2>
            <p className="mt-4 text-text-secondary">
              Access the world&apos;s most advanced AI models through a single interface
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-12">
            {[
              { name: 'Anthropic', models: 'Claude Opus, Sonnet, Haiku', color: 'provider-anthropic' },
              { name: 'OpenAI', models: 'GPT-4.1, GPT-4o, o4-mini', color: 'provider-openai' },
              { name: 'Google', models: 'Gemini 2.5 Pro, Flash, Lite', color: 'provider-google' },
            ].map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-3xl font-bold text-${provider.color} mb-2`}>
                  {provider.name}
                </div>
                <p className="text-sm text-text-quaternary">{provider.models}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Section */}
      {showStatus && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="py-20 border-b border-border-primary"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary">System Status</h2>
              <p className="mt-4 text-text-secondary">
                Real-time health monitoring for all ADE services
              </p>
            </div>
            <StatusPage />
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-bg-tertiary border-t border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-text-secondary">
                ADE - Araviel Decision Engine
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-text-quaternary hover:text-text-secondary transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-text-quaternary hover:text-text-secondary transition-colors">
                API Reference
              </a>
              <a href="#" className="text-sm text-text-quaternary hover:text-text-secondary transition-colors">
                GitHub
              </a>
              <button
                onClick={() => setShowStatus(!showStatus)}
                className="text-sm text-text-quaternary hover:text-text-secondary transition-colors"
              >
                System Status
              </button>
            </div>

            <div className="text-sm text-text-quaternary">
              &copy; 2025 Araviel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
