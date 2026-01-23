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
  { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements' },
  { label: 'Creative Writing', prompt: 'Write a short story about a robot discovering emotions for the first time' },
  { label: 'Data Analysis', prompt: 'Analyze this sales data and identify trends for Q4 performance' },
  { label: 'Quick Question', prompt: 'What is the capital of France?' },
];

const modalityOptions = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'voice', label: 'Voice' },
  { value: 'text+image', label: 'Text + Image' },
  { value: 'text+voice', label: 'Text + Voice' },
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input Section */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6">
        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Your Prompt
          </label>
          <textarea
            placeholder="Enter any prompt to see how ADE routes it to the optimal LLM..."
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Example Prompts */}
        <div className="mb-4">
          <p className="text-xs text-[var(--text-quaternary)] mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example) => (
              <button
                key={example.label}
                onClick={() => setPrompt(example.prompt)}
                className="px-3 py-1.5 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] transition-colors"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modality Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Input Modality
          </label>
          <div className="flex flex-wrap gap-2">
            {modalityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setModality(option.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  modality === option.value
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRoute}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Route Prompt
              </>
            )}
          </button>
          {(result || currentStep !== 'idle') && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-accent)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-6">
        <RoutingSteps currentStep={currentStep} timing={result?.timing} />
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {currentStep === 'idle' && !result ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center py-12"
          >
            <Sparkles className="w-12 h-12 text-[var(--text-quaternary)] mx-auto mb-4" />
            <p className="text-[var(--text-tertiary)]">
              Enter a prompt above to see ADE in action
            </p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="h-32 bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />
            <div className="h-48 bg-[var(--bg-secondary)] rounded-2xl animate-pulse" />
          </motion.div>
        ) : result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Confidence & Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                <p className="text-sm text-[var(--text-tertiary)] mb-1">Routing Confidence</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                <p className="text-sm text-[var(--text-tertiary)] mb-1">Total Time</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {result.timing.totalMs}ms
                </p>
              </div>
            </div>

            {/* Analysis */}
            <AnalysisDisplay analysis={result.analysis} />

            {/* Primary Model */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-medium text-[var(--text-secondary)]">Recommended Model</h3>
              </div>
              <ModelCard model={result.primaryModel} rank="primary" />
            </div>

            {/* Backup Models */}
            {result.backupModels.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-[var(--text-quaternary)] rounded-full" />
                  <h3 className="text-sm font-medium text-[var(--text-secondary)]">Backup Options</h3>
                </div>
                <div className="space-y-3">
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
  );
}
