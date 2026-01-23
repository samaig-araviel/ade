'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { TextArea, Select } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { RoutingSteps, RoutingStep } from './RoutingSteps';
import { ModelCard } from './ModelCard';
import { AnalysisDisplay } from './AnalysisDisplay';
import {
  Play,
  Sparkles,
  Settings2,
  ChevronDown,
  RotateCcw,
  Wand2
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
  { label: 'Technical Docs', prompt: 'Explain how async/await works in JavaScript with examples' },
];

const modalityOptions = [
  { value: 'text', label: 'Text Only' },
  { value: 'image', label: 'Image Only' },
  { value: 'voice', label: 'Voice Only' },
  { value: 'text+image', label: 'Text + Image' },
  { value: 'text+voice', label: 'Text + Voice' },
];

export function PromptTester() {
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStep, setCurrentStep] = useState<RoutingStep>('idle');
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateSteps = useCallback(async (actualResult: RouteResponse) => {
    const steps: RoutingStep[] = ['analyzing', 'filtering', 'scoring', 'selecting', 'reasoning'];
    const delays = [300, 200, 400, 200, 200]; // Simulated delays to show animation

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

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-accent-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Test the Router</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt Input */}
              <TextArea
                label="Your Prompt"
                placeholder="Enter any prompt to see how ADE routes it to the optimal LLM..."
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                error={error || undefined}
              />

              {/* Example Prompts */}
              <div>
                <p className="text-xs text-text-quaternary mb-2">Try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example.label}
                      onClick={() => handleExampleClick(example.prompt)}
                      className="px-3 py-1.5 text-xs bg-bg-tertiary text-text-secondary rounded-full hover:bg-bg-accent hover:text-text-primary transition-colors"
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modality Select */}
              <Select
                label="Input Modality"
                options={modalityOptions}
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              />

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                Advanced Options
                <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Advanced Options Panel */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle space-y-4">
                      <p className="text-xs text-text-quaternary">
                        Additional context and constraints can be configured here in future versions.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-bg-secondary rounded-lg">
                          <p className="text-xs text-text-quaternary mb-1">Max Cost</p>
                          <p className="text-sm text-text-tertiary">No limit</p>
                        </div>
                        <div className="p-3 bg-bg-secondary rounded-lg">
                          <p className="text-xs text-text-quaternary mb-1">Max Latency</p>
                          <p className="text-sm text-text-tertiary">No limit</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  onClick={handleRoute}
                  loading={currentStep !== 'idle' && currentStep !== 'complete'}
                  icon={<Play className="w-4 h-4" />}
                >
                  Route Prompt
                </Button>
                {(result || currentStep !== 'idle') && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleReset}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Routing Steps */}
          <Card variant="bordered">
            <CardContent>
              <RoutingSteps
                currentStep={currentStep}
                timing={result?.timing}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 'idle' ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    <Sparkles className="w-16 h-16 text-text-quaternary mx-auto" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-text-secondary mb-2">
                    Ready to Route
                  </h3>
                  <p className="text-sm text-text-quaternary max-w-xs mx-auto">
                    Enter a prompt and click "Route Prompt" to see ADE analyze and select the optimal LLM.
                  </p>
                </div>
              </motion.div>
            ) : currentStep !== 'complete' ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Loading Skeleton */}
                <Card variant="bordered">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-6 w-32 shimmer rounded" />
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-20 shimmer rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="h-48 shimmer rounded-xl" />
              </motion.div>
            ) : result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Analysis */}
                <AnalysisDisplay analysis={result.analysis} />

                {/* Confidence */}
                <Card variant="glass">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Routing Confidence</p>
                        <p className="text-2xl font-bold gradient-text">
                          {Math.round(result.confidence * 100)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">Total Time</p>
                        <p className="text-2xl font-mono text-accent-success">
                          {result.timing.totalMs}ms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Model */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent-success rounded-full" />
                    Recommended Model
                  </h3>
                  <ModelCard model={result.primaryModel} rank="primary" />
                </div>

                {/* Backup Models */}
                {result.backupModels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-text-quaternary rounded-full" />
                      Backup Options
                    </h3>
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
      </div>
    </div>
  );
}
