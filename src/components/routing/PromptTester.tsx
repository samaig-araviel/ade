'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoutingSteps, RoutingStep } from './RoutingSteps';
import { ModelCard } from './ModelCard';
import { AnalysisDisplay } from './AnalysisDisplay';
import {
  Play,
  Sparkles,
  RotateCcw,
  Type,
  Image,
  Mic,
  ImageIcon,
  AudioLines,
  Clock,
  Target,
} from 'lucide-react';

interface RouteResponse {
  decisionId: string;
  primaryModel: {
    id: string;
    name: string;
    provider: string;
    score: number;
    reasoning: {
      summary: string;
      factors: Array<{
        name: string;
        score: number;
        weight: number;
        weightedScore: number;
        detail: string;
      }>;
    };
  };
  backupModels: Array<{
    id: string;
    name: string;
    provider: string;
    score: number;
    reasoning: {
      summary: string;
      factors: Array<{
        name: string;
        score: number;
        weight: number;
        weightedScore: number;
        detail: string;
      }>;
    };
  }>;
  confidence: number;
  analysis: {
    intent: string;
    domain: string;
    complexity: string;
    tone: string;
    modality: string;
    keywords: string[];
    humanContextUsed: boolean;
  };
  timing: {
    totalMs: number;
    analysisMs: number;
    scoringMs: number;
    selectionMs: number;
  };
}

const examplePrompts = [
  { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements', icon: '🔍' },
  { label: 'Creative', prompt: 'Write a short story about a robot discovering emotions for the first time', icon: '✨' },
  { label: 'Analysis', prompt: 'Analyze this sales data and identify trends for Q4 performance', icon: '📊' },
  { label: 'Quick Q&A', prompt: 'What is the capital of France?', icon: '💬' },
];

const modalityOptions = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'voice', label: 'Voice', icon: Mic },
  { value: 'text+image', label: 'Text+Image', icon: ImageIcon },
  { value: 'text+voice', label: 'Text+Voice', icon: AudioLines },
];

export function PromptTester() {
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [currentStep, setCurrentStep] = useState<RoutingStep>('idle');
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = currentStep !== 'idle' && currentStep !== 'complete';

  const simulateSteps = useCallback(async (actualResult: RouteResponse) => {
    const steps: RoutingStep[] = ['analyzing', 'filtering', 'scoring', 'selecting', 'reasoning'];
    const delays = [300, 200, 400, 200, 200];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step) {
        setCurrentStep(step);
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }

    setCurrentStep('complete');
    setResult(actualResult);
  }, []);

  const handleRoute = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setResult(null);
    setCurrentStep('analyzing');

    try {
      const response = await fetch('/api/v1/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modality,
        }),
      });

      if (!response.ok) {
        throw new Error('Routing failed');
      }

      const data = await response.json();
      await simulateSteps(data);
    } catch {
      setError('Failed to route prompt. Please try again.');
      setCurrentStep('idle');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setCurrentStep('idle');
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleRoute();
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {/* Prompt Input Card */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            {/* Input Header */}
            <div className="px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/50">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Enter Your Prompt
              </label>
            </div>

            {/* Textarea */}
            <div className="p-4">
              <textarea
                placeholder="Describe what you want the AI to help you with..."
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-0 py-0 bg-transparent border-none text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:outline-none resize-none text-sm leading-relaxed"
              />
              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>

            {/* Quick Examples */}
            <div className="px-4 pb-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)] mb-2">Quick Examples</p>
              <div className="flex flex-wrap gap-1.5">
                {examplePrompts.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => setPrompt(example.prompt)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] transition-colors"
                  >
                    <span>{example.icon}</span>
                    <span>{example.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modality Selector */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-3 block">
              Input Modality
            </label>
            <div className="grid grid-cols-5 gap-2">
              {modalityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = modality === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setModality(option.value)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                        : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2">
            <button
              onClick={handleRoute}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Route Prompt</span>
                  <kbd className="hidden sm:inline-flex ml-1.5 px-1.5 py-0.5 text-[10px] bg-white/10 rounded">
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
            {(result || currentStep !== 'idle') && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-12 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          {currentStep !== 'idle' && (
            <RoutingSteps currentStep={currentStep} timing={result?.timing} />
          )}
        </div>

        {/* Right Column - Results */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentStep === 'idle' && !result ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-primary)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-[var(--text-quaternary)]" />
                </div>
                <p className="text-sm text-[var(--text-tertiary)] max-w-[200px]">
                  Enter a prompt and click Route to see the optimal model recommendation
                </p>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="h-24 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
                <div className="h-40 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
                <div className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
              </motion.div>
            ) : result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Confidence</span>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Latency</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">
                      {result.timing.totalMs}ms
                    </p>
                  </div>
                </div>

                {/* Analysis */}
                <AnalysisDisplay analysis={result.analysis} />

                {/* Primary Model */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <h3 className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-quaternary)]">
                      Recommended Model
                    </h3>
                  </div>
                  <ModelCard model={result.primaryModel} rank="primary" />
                </div>

                {/* Backup Models */}
                {result.backupModels.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 bg-[var(--text-quaternary)] rounded-full" />
                      <h3 className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-quaternary)]">
                        Alternatives
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {result.backupModels.map((model, index) => (
                        <ModelCard key={model.id} model={model} rank="backup" index={index + 1} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
