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
  Code2,
  FileJson,
  Copy,
  Check,
  AlertCircle,
  Target,
  ExternalLink,
  BarChart3,
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

  const [showHumanContext, setShowHumanContext] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);

  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);

  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);

  const [lastRequest, setLastRequest] = useState<object | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [routingHistory, setRoutingHistory] = useState<Array<{ id: string; prompt: string; model: string; time: string }>>([]);

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

      // Add to history
      setRoutingHistory(prev => [{
        id: data.decisionId,
        prompt: prompt.trim().substring(0, 40) + (prompt.length > 40 ? '...' : ''),
        model: data.primaryModel.name,
        time: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
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
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-gray-900">ADE</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <button className="px-3 py-1.5 text-[13px] font-medium text-gray-900 bg-gray-100 rounded-lg">
                Router
              </button>
              <button className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Models
              </button>
              <button className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                API
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Status</span>
            </button>
            <a
              href="https://github.com/samaig-araviel/ade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Engine Test Console</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">Engine Stats</h2>
                <span className="status-online">Online</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-[12px] text-gray-500 mb-1">Available Models</div>
                    <div className="text-[28px] font-bold text-gray-900">10</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500 mb-1">Target Latency</div>
                    <div className="text-[28px] font-bold text-gray-900">&lt;50<span className="text-[14px] font-normal text-gray-400">ms</span></div>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500 mb-1">Scoring Factors</div>
                    <div className="text-[28px] font-bold text-gray-900">7</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500 mb-1">Session Requests</div>
                    <div className="text-[28px] font-bold text-gray-900">{requestCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Prompt Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-gray-900">Test Prompt</h2>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
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
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-[14px]"
                />

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-[13px] text-red-600">
                    <AlertCircle className="w-4 h-4" />
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {example.label}
                      </button>
                    );
                  })}
                </div>

                {/* Advanced Options */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowHumanContext(!showHumanContext)}
                    className={`flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg border transition-colors ${
                      useHumanContext
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Human Context
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHumanContext ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => setShowConstraints(!showConstraints)}
                    className={`flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg border transition-colors ${
                      useConstraints
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    Constraints
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showConstraints ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Human Context Panel */}
                <AnimatePresence>
                  {showHumanContext && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useHumanContext}
                            onChange={(e) => setUseHumanContext(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[13px] font-medium text-gray-700">Include human context</span>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Mood</label>
                            <select
                              value={humanContext.emotionalState?.mood || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
                            >
                              <option value="">Select...</option>
                              {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Energy</label>
                            <select
                              value={humanContext.emotionalState?.energyLevel || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
                            >
                              <option value="">Select...</option>
                              {energyOptions.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Style</label>
                            <select
                              value={humanContext.preferences?.preferredResponseStyle || ''}
                              onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
                            >
                              <option value="">Select...</option>
                              {responseStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Working Hours</label>
                            <select
                              value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                              onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
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
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useConstraints}
                            onChange={(e) => setUseConstraints(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[13px] font-medium text-gray-700">Apply constraints</span>
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Max Cost/1K</label>
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
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Max Latency (ms)</label>
                            <input
                              type="number"
                              step="100"
                              min="0"
                              placeholder="1000"
                              value={constraints.maxLatencyMs || ''}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined
                              }))}
                              className="w-full px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-900"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer self-end pb-1.5">
                            <input
                              type="checkbox"
                              checked={constraints.requireVision || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireVision: e.target.checked || undefined
                              }))}
                              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-[13px] text-gray-700">Vision</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer self-end pb-1.5">
                            <input
                              type="checkbox"
                              checked={constraints.requireAudio || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireAudio: e.target.checked || undefined
                              }))}
                              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-[13px] text-gray-700">Audio</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={handleRoute}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" />
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
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Routing History Card */}
            {routingHistory.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-gray-900">Recent Routings</h2>
                  <button
                    onClick={() => setRoutingHistory([])}
                    className="text-[12px] text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {routingHistory.map((item, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[13px] text-gray-900 truncate">{item.prompt}</div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-[12px] text-gray-500">{item.model}</span>
                        <span className="text-[11px] text-gray-400">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Timing Card */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-[15px] font-semibold text-gray-900">Routing Results</h3>
                    </div>
                    <div className="p-5 grid grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-[11px] text-indigo-600 uppercase tracking-wide mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-indigo-700">{Math.round(result.confidence * 100)}%</div>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-[11px] text-emerald-600 uppercase tracking-wide mb-1">Total Time</div>
                        <div className="text-2xl font-bold text-emerald-700">{result.timing.totalMs.toFixed(1)}<span className="text-sm font-normal">ms</span></div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-[11px] text-blue-600 uppercase tracking-wide mb-1">Analysis</div>
                        <div className="text-2xl font-bold text-blue-700">{result.timing.analysisMs.toFixed(1)}<span className="text-sm font-normal">ms</span></div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-[11px] text-amber-600 uppercase tracking-wide mb-1">Scoring</div>
                        <div className="text-2xl font-bold text-amber-700">{result.timing.scoringMs.toFixed(1)}<span className="text-sm font-normal">ms</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis + Rankings Grid */}
                  <div className="grid grid-cols-2 gap-5">
                    <AnalysisDisplay analysis={result.analysis} />

                    {/* Model Rankings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <span className="text-[15px] font-semibold text-gray-900">Model Ranking</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {[result.primaryModel, ...result.backupModels].map((model, idx) => {
                          const isTop = idx === 0;
                          return (
                            <div
                              key={model.id}
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                isTop ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                                isTop ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className={`w-2 h-2 rounded-full ${getProviderColor(model.provider)}`} />
                              <span className={`flex-1 text-[13px] font-medium truncate ${
                                isTop ? 'text-indigo-900' : 'text-gray-700'
                              }`}>
                                {model.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${isTop ? 'bg-indigo-500' : 'bg-gray-400'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${model.score * 100}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  />
                                </div>
                                <span className={`text-[12px] font-mono w-8 text-right ${
                                  isTop ? 'text-indigo-600' : 'text-gray-500'
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

                  {/* Recommended Model */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="text-[15px] font-semibold text-gray-900">Recommended Model</h3>
                    </div>
                    <div className="p-5">
                      <ModelCard model={result.primaryModel} rank="primary" />
                      {result.backupModels.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-[13px] font-medium text-gray-500 mb-3">Alternatives</h4>
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
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setShowJsonView(!showJsonView)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-gray-400" />
                        <span className="text-[13px] font-medium text-gray-700">Raw JSON Response</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showJsonView && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyJson(); }}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-gray-700 bg-gray-100 rounded"
                          >
                            {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedJson ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showJsonView ? 'rotate-180' : ''}`} />
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
                          <div className="px-5 pb-5 border-t border-gray-100">
                            <pre className="mt-4 p-4 text-[12px] font-mono bg-gray-50 rounded-lg overflow-x-auto text-gray-700 max-h-80 overflow-y-auto">
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
          <div className="hidden lg:block w-80 flex-shrink-0 space-y-5">
            {/* How To Use */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">How To Use</h3>
              <div className="space-y-4">
                <div className="guide-step">
                  <div className="guide-step-number">1</div>
                  <div>
                    <div className="guide-step-title">Enter a Prompt</div>
                    <div className="guide-step-desc">Type any text prompt to route to the optimal LLM model.</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-step-number">2</div>
                  <div>
                    <div className="guide-step-title">Configure Options</div>
                    <div className="guide-step-desc">Select modality and add context or constraints.</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-step-number">3</div>
                  <div>
                    <div className="guide-step-title">Review Results</div>
                    <div className="guide-step-desc">See the recommended model with scoring breakdown.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Factors */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Scoring Factors</h3>
              <div className="space-y-3">
                {[
                  { name: 'Task Fitness', weight: '40%', color: 'bg-indigo-500' },
                  { name: 'Modality Fit', weight: '15%', color: 'bg-purple-500' },
                  { name: 'Cost Efficiency', weight: '15%', color: 'bg-emerald-500' },
                  { name: 'Speed', weight: '10%', color: 'bg-amber-500' },
                  { name: 'User Preference', weight: '10%', color: 'bg-rose-500' },
                  { name: 'Coherence', weight: '10%', color: 'bg-blue-500' },
                ].map((factor) => (
                  <div key={factor.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${factor.color}`} />
                      <span className="text-[13px] text-gray-700">{factor.name}</span>
                    </div>
                    <span className="text-[12px] font-medium text-gray-400">{factor.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Models List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Available Models</h3>
              <div className="space-y-4">
                {[
                  { provider: 'Anthropic', color: 'bg-amber-500', models: ['Claude Opus 4.5', 'Claude Sonnet 4', 'Claude Haiku 4.5'] },
                  { provider: 'OpenAI', color: 'bg-emerald-500', models: ['GPT-4.1', 'GPT-4.1 Mini', 'GPT-4o', 'o4-mini'] },
                  { provider: 'Google', color: 'bg-blue-500', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.5 Flash Lite'] },
                ].map((group) => (
                  <div key={group.provider}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${group.color}`} />
                      <span className="text-[13px] font-medium text-gray-700">{group.provider}</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {group.models.map((model) => (
                        <div key={model} className="text-[12px] text-gray-500">{model}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Card */}
            <div className="promo-card">
              <h3>API Integration</h3>
              <p>Integrate the routing engine into your application.</p>
              <code className="block text-[11px] font-mono bg-white/10 px-3 py-2 rounded mb-3">
                POST /api/v1/route
              </code>
              <a
                href="/api/v1/health"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-[12px] text-white/80 hover:text-white"
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
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowStatus(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-auto bg-white rounded-xl shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                <h2 className="text-[15px] font-semibold text-gray-900">System Status</h2>
                <button
                  onClick={() => setShowStatus(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
