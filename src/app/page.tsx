'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelCard } from '@/components/routing/ModelCard';
import { AnalysisDisplay } from '@/components/routing/AnalysisDisplay';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Github,
  Activity,
  X,
  Cpu,
  Zap,
  BarChart3,
  Play,
  RotateCcw,
  Type,
  Image,
  Mic,
  ImageIcon,
  AudioLines,
  ChevronDown,
  User,
  Settings2,
  Brain,
  Smile,
  Battery,
  Sun,
  Heart,
  DollarSign,
  Eye,
  Code2,
  FileJson,
  Copy,
  Check,
  AlertCircle,
  Target,
  Clock,
  Scale,
  MessageSquare,
  Layers,
  ExternalLink,
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

interface HumanContext {
  emotionalState?: {
    mood?: string;
    energyLevel?: string;
  };
  temporalContext?: {
    localTime?: string;
    isWorkingHours?: boolean;
  };
  preferences?: {
    preferredResponseStyle?: string;
    preferredResponseLength?: string;
    preferredModels?: string[];
    avoidModels?: string[];
  };
}

interface Constraints {
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  requireVision?: boolean;
  requireAudio?: boolean;
}

const examplePrompts = [
  { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements', icon: Code2 },
  { label: 'Data Analysis', prompt: 'Analyze this sales data and identify key trends for Q4 performance', icon: BarChart3 },
  { label: 'Creative Writing', prompt: 'Write a short story about a robot discovering emotions', icon: Sparkles },
  { label: 'Simple Q&A', prompt: 'What is the capital of France?', icon: Target },
];

const modalityOptions = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'voice', label: 'Voice', icon: Mic },
  { value: 'text+image', label: 'Text+Image', icon: ImageIcon },
  { value: 'text+voice', label: 'Text+Voice', icon: AudioLines },
];

const moodOptions = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
const energyOptions = ['low', 'moderate', 'high'];
const responseStyleOptions = ['concise', 'detailed', 'conversational', 'formal', 'casual'];

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Panel states
  const [showHumanContext, setShowHumanContext] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);

  // Human context state
  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);

  // Constraints state
  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);

  // Request tracking
  const [lastRequest, setLastRequest] = useState<object | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  const handleRoute = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    const requestBody: Record<string, unknown> = {
      prompt: prompt.trim(),
      modality,
    };

    if (useHumanContext && Object.keys(humanContext).length > 0) {
      requestBody.humanContext = humanContext;
    }

    if (useConstraints && Object.keys(constraints).length > 0) {
      requestBody.constraints = constraints;
    }

    setLastRequest(requestBody);

    try {
      const response = await fetch('/api/v1/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Routing failed');
      }

      const data = await response.json();
      setResult(data);
      setRequestCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to route prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, modality, humanContext, constraints, useHumanContext, useConstraints]);

  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setError(null);
    setLastRequest(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleRoute();
    }
  };

  const handleCopyJson = async () => {
    const jsonData = { request: lastRequest, response: result };
    await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const updateHumanContext = (path: string[], value: unknown) => {
    setHumanContext(prev => {
      const newContext = { ...prev };
      let current: Record<string, unknown> = newContext;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) {
          if (!current[key]) current[key] = {};
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        if (value === '' || value === undefined) {
          delete current[lastKey];
        } else {
          current[lastKey] = value;
        }
      }
      return newContext;
    });
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return 'bg-amber-500';
      case 'openai': return 'bg-emerald-500';
      case 'google': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-[var(--text-primary)]">ADE</span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setShowStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              Status
            </button>
            <a
              href="https://github.com/samaig-araviel/ade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Stats Row */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Engine Stats</h2>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-medium">
                  Online
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Models</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">10</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Target Latency</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">&lt;50<span className="text-sm font-normal text-[var(--text-tertiary)]">ms</span></p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Scoring Factors</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">7</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Session Requests</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{requestCount}</p>
                </div>
              </div>
            </div>

            {/* Test Prompt Section */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
              <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Test Prompt</h2>
                <div className="flex items-center gap-2">
                  {modalityOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = modality === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setModality(option.value)}
                        title={option.label}
                        className={`p-1.5 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-500'
                            : 'text-[var(--text-quaternary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5">
                <textarea
                  placeholder="Enter your prompt to test the routing engine..."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
                />

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}

                {/* Quick Examples */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {examplePrompts.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.label}
                        onClick={() => setPrompt(example.prompt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] transition-colors"
                      >
                        <Icon className="w-3 h-3" />
                        {example.label}
                      </button>
                    );
                  })}
                </div>

                {/* Advanced Options */}
                <div className="mt-4 flex gap-3">
                  {/* Human Context Toggle */}
                  <button
                    onClick={() => setShowHumanContext(!showHumanContext)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      useHumanContext
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                        : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Human Context
                    <motion.div animate={{ rotate: showHumanContext ? 180 : 0 }}>
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </button>

                  {/* Constraints Toggle */}
                  <button
                    onClick={() => setShowConstraints(!showConstraints)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      useConstraints
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Constraints
                    <motion.div animate={{ rotate: showConstraints ? 180 : 0 }}>
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </button>
                </div>

                {/* Human Context Panel */}
                <AnimatePresence>
                  {showHumanContext && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)]">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useHumanContext}
                            onChange={(e) => setUseHumanContext(e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)]"
                          />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">Include human context in routing</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <Smile className="w-3 h-3" /> Mood
                            </label>
                            <select
                              value={humanContext.emotionalState?.mood || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            >
                              <option value="">Select...</option>
                              {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <Battery className="w-3 h-3" /> Energy
                            </label>
                            <select
                              value={humanContext.emotionalState?.energyLevel || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            >
                              <option value="">Select...</option>
                              {energyOptions.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <Heart className="w-3 h-3" /> Style
                            </label>
                            <select
                              value={humanContext.preferences?.preferredResponseStyle || ''}
                              onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            >
                              <option value="">Select...</option>
                              {responseStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <Sun className="w-3 h-3" /> Working Hours
                            </label>
                            <select
                              value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                              onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            >
                              <option value="">Select...</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Constraints Panel */}
                <AnimatePresence>
                  {showConstraints && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)]">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useConstraints}
                            onChange={(e) => setUseConstraints(e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-primary)] text-amber-500 focus:ring-amber-500 bg-[var(--bg-secondary)]"
                          />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">Apply constraints to routing</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <DollarSign className="w-3 h-3" /> Max Cost/1K
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="0.01"
                              value={constraints.maxCostPer1kTokens || ''}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                maxCostPer1kTokens: e.target.value ? parseFloat(e.target.value) : undefined
                              }))}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-[10px] text-[var(--text-quaternary)] mb-1">
                              <Zap className="w-3 h-3" /> Max Latency
                            </label>
                            <input
                              type="number"
                              step="100"
                              min="0"
                              placeholder="1000ms"
                              value={constraints.maxLatencyMs || ''}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined
                              }))}
                              className="w-full px-2 py-1.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)]"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={constraints.requireVision || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireVision: e.target.checked || undefined
                              }))}
                              className="w-4 h-4 rounded border-[var(--border-primary)] text-amber-500 focus:ring-amber-500 bg-[var(--bg-secondary)]"
                            />
                            <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                              <Eye className="w-3 h-3" /> Vision
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={constraints.requireAudio || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireAudio: e.target.checked || undefined
                              }))}
                              className="w-4 h-4 rounded border-[var(--border-primary)] text-amber-500 focus:ring-amber-500 bg-[var(--bg-secondary)]"
                            />
                            <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                              <Mic className="w-3 h-3" /> Audio
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleRoute}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Routing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Route Prompt
                      </>
                    )}
                  </button>
                  {(result || prompt) && (
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Timing Metrics */}
                  <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Routing Results</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                          <Target className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider">Confidence</span>
                        </div>
                        <p className="text-xl font-bold text-indigo-500">{Math.round(result.confidence * 100)}%</p>
                      </div>
                      <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider">Total</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-500">{result.timing.totalMs.toFixed(1)}<span className="text-xs font-normal">ms</span></p>
                      </div>
                      <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                          <Brain className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider">Analysis</span>
                        </div>
                        <p className="text-xl font-bold text-blue-500">{result.timing.analysisMs.toFixed(1)}<span className="text-xs font-normal">ms</span></p>
                      </div>
                      <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-quaternary)] mb-1">
                          <Scale className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider">Scoring</span>
                        </div>
                        <p className="text-xl font-bold text-amber-500">{result.timing.scoringMs.toFixed(1)}<span className="text-xs font-normal">ms</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis + Models Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Analysis */}
                    <AnalysisDisplay analysis={result.analysis} />

                    {/* All Models Ranking */}
                    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">Model Ranking</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {[result.primaryModel, ...result.backupModels].map((model, idx) => {
                          const isTop = idx === 0;
                          return (
                            <div
                              key={model.id}
                              className={`flex items-center gap-3 p-2.5 rounded-lg ${
                                isTop ? 'bg-indigo-500/5 border border-indigo-500/20' : 'bg-[var(--bg-primary)] border border-transparent'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                isTop ? 'bg-indigo-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className={`w-2 h-2 rounded-full ${getProviderColor(model.provider)}`} />
                              <span className={`flex-1 text-xs font-medium truncate ${
                                isTop ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                              }`}>
                                {model.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${isTop ? 'bg-indigo-500' : 'bg-[var(--text-quaternary)]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${model.score * 100}%` }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                  />
                                </div>
                                <span className={`text-xs font-mono w-7 text-right ${
                                  isTop ? 'text-indigo-500' : 'text-[var(--text-tertiary)]'
                                }`}>
                                  {Math.round(model.score * 100)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Model Recommendations */}
                  <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
                    <div className="px-5 py-4 border-b border-[var(--border-primary)]">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recommended Model</h3>
                    </div>
                    <div className="p-5">
                      <ModelCard model={result.primaryModel} rank="primary" />

                      {result.backupModels.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                          <h4 className="text-xs font-medium text-[var(--text-tertiary)] mb-3">Alternatives</h4>
                          <div className="space-y-2">
                            {result.backupModels.map((model, index) => (
                              <ModelCard key={model.id} model={model} rank="backup" index={index + 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JSON Viewer */}
                  <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                    <button
                      onClick={() => setShowJsonView(!showJsonView)}
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Raw JSON</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showJsonView && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyJson(); }}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded"
                          >
                            {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedJson ? 'Copied' : 'Copy'}
                          </button>
                        )}
                        <motion.div animate={{ rotate: showJsonView ? 180 : 0 }}>
                          <ChevronDown className="w-4 h-4 text-[var(--text-quaternary)]" />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {showJsonView && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-[var(--border-subtle)]">
                            <pre className="mt-4 p-4 text-[11px] font-mono bg-[var(--bg-primary)] rounded-lg overflow-x-auto text-[var(--text-secondary)] max-h-80 overflow-y-auto">
                              {JSON.stringify({ request: lastRequest, response: result }, null, 2)}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* How To Use */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">How To Use</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--text-primary)]">Enter a Prompt</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Type any text prompt you want to route to the optimal LLM model.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--text-primary)]">Configure Options</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Select modality, add human context, or set constraints like cost and latency limits.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <div>
                    <h4 className="text-xs font-medium text-[var(--text-primary)]">Review Results</h4>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">See the recommended model with detailed scoring breakdown and alternatives.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Factors */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Scoring Factors</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Task Fitness</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Modality Fit</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Cost Efficiency</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Speed</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-xs text-[var(--text-secondary)]">User Preference</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-[var(--text-secondary)]">Coherence</span>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)]">10%</span>
                </div>
              </div>
            </div>

            {/* Available Models */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Available Models</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Anthropic</span>
                  </div>
                  <div className="pl-4 space-y-1 text-[11px] text-[var(--text-tertiary)]">
                    <p>Claude Opus 4.5</p>
                    <p>Claude Sonnet 4</p>
                    <p>Claude Haiku 4.5</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">OpenAI</span>
                  </div>
                  <div className="pl-4 space-y-1 text-[11px] text-[var(--text-tertiary)]">
                    <p>GPT-4.1</p>
                    <p>GPT-4.1 Mini</p>
                    <p>GPT-4o</p>
                    <p>o4-mini</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Google</span>
                  </div>
                  <div className="pl-4 space-y-1 text-[11px] text-[var(--text-tertiary)]">
                    <p>Gemini 2.5 Pro</p>
                    <p>Gemini 2.5 Flash</p>
                    <p>Gemini 2.5 Flash Lite</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">API Endpoint</h3>
              <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
                Integrate the routing engine into your application via REST API.
              </p>
              <code className="block text-[10px] font-mono bg-[var(--bg-primary)]/50 px-3 py-2 rounded-lg text-indigo-400 mb-3">
                POST /api/v1/route
              </code>
              <a
                href="/api/v1/health"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                View API Health
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </main>

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
