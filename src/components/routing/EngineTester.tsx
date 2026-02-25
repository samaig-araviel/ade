'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelCard } from './ModelCard';
import { AnalysisDisplay } from './AnalysisDisplay';
import {
  Play,
  RotateCcw,
  Type,
  Image,
  Mic,
  ImageIcon,
  AudioLines,
  Clock,
  Target,
  ChevronDown,
  User,
  Settings2,
  Brain,
  Smile,
  Battery,
  Sun,
  Heart,
  DollarSign,
  Zap,
  Eye,
  Code2,
  BarChart3,
  FileJson,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Building2,
  Video,
  FileText,
  Film,
  FileCode2,
  Globe,
} from 'lucide-react';

interface RouteResponse {
  decisionId: string;
  primaryModel: {
    id: string;
    name: string;
    provider: string;
    score: number;
    supportsWebSearch?: boolean;
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
    supportsWebSearch?: boolean;
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
  webSearchRequired?: boolean;
  analysis: {
    intent: string;
    domain: string;
    complexity: string;
    tone: string;
    modality: string;
    keywords: string[];
    humanContextUsed: boolean;
    webSearchRequired?: boolean;
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
  { category: 'Coding', prompts: [
    { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements', icon: Code2 },
    { label: 'Debug Error', prompt: 'Help me fix this TypeError: Cannot read property of undefined in my React component', icon: AlertCircle },
    { label: 'Write Tests', prompt: 'Write unit tests for this authentication module using Jest', icon: Check },
  ]},
  { category: 'Analysis', prompts: [
    { label: 'Data Analysis', prompt: 'Analyze this sales data and identify trends for Q4 performance', icon: BarChart3 },
    { label: 'Document Review', prompt: 'Summarize this 50-page research paper on climate change', icon: FileJson },
    { label: 'Compare Options', prompt: 'Compare PostgreSQL vs MongoDB for an e-commerce application', icon: Brain },
  ]},
  { category: 'Creative', prompts: [
    { label: 'Story Writing', prompt: 'Write a short story about a robot discovering emotions for the first time', icon: Sparkles },
    { label: 'Marketing Copy', prompt: 'Create compelling product descriptions for our new sustainable coffee line', icon: Heart },
    { label: 'Brainstorm', prompt: 'Help me brainstorm 10 innovative mobile app ideas for elderly care', icon: Brain },
  ]},
  { category: 'Quick Tasks', prompts: [
    { label: 'Simple Q&A', prompt: 'What is the capital of France?', icon: Target },
    { label: 'Translation', prompt: 'Translate "Hello, how are you today?" to Spanish, French, and German', icon: Type },
    { label: 'Format Data', prompt: 'Convert this CSV data to JSON format', icon: Code2 },
  ]},
  { category: 'Web Search', prompts: [
    { label: 'Latest News', prompt: 'What are the latest news about AI regulation today?', icon: Globe },
    { label: 'Stock Price', prompt: 'What is the current stock price of Tesla?', icon: BarChart3 },
    { label: 'Weather', prompt: 'What is the weather forecast for New York this weekend?', icon: Sun },
  ]},
];

const modalityOptions = [
  { value: 'text', label: 'Text', icon: Type, description: 'Text-only input' },
  { value: 'code', label: 'Code', icon: Code2, description: 'Code generation & analysis' },
  { value: 'image', label: 'Image', icon: Image, description: 'Image analysis' },
  { value: 'video', label: 'Video', icon: Video, description: 'Video understanding' },
  { value: 'voice', label: 'Voice', icon: Mic, description: 'Audio input' },
  { value: 'document', label: 'Document', icon: FileText, description: 'PDF & document analysis' },
  { value: 'text+image', label: 'Text + Image', icon: ImageIcon, description: 'Combined text and image' },
  { value: 'text+voice', label: 'Text + Voice', icon: AudioLines, description: 'Combined text and audio' },
  { value: 'text+code', label: 'Text + Code', icon: FileCode2, description: 'Text with code snippets' },
  { value: 'text+video', label: 'Text + Video', icon: Film, description: 'Combined text and video' },
];

const moodOptions = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
const energyOptions = ['low', 'moderate', 'high'];
const responseStyleOptions = ['concise', 'detailed', 'conversational', 'formal', 'casual'];
const responseLengthOptions = ['short', 'medium', 'long'];

const providerOptions = [
  { value: 'anthropic', label: 'Anthropic', color: 'bg-amber-500' },
  { value: 'openai', label: 'OpenAI', color: 'bg-emerald-500' },
  { value: 'google', label: 'Google', color: 'bg-blue-500' },
  { value: 'perplexity', label: 'Perplexity', color: 'bg-purple-500' },
  { value: 'xai', label: 'xAI', color: 'bg-red-500' },
  { value: 'mistral', label: 'Mistral', color: 'bg-orange-500' },
  { value: 'meta', label: 'Meta', color: 'bg-sky-500' },
  { value: 'deepseek', label: 'DeepSeek', color: 'bg-teal-500' },
];

export function EngineTester() {
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Panel states
  const [showHumanContext, setShowHumanContext] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  const [activeExampleCategory, setActiveExampleCategory] = useState('Coding');

  // Human context state
  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);

  // Constraints state
  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);

  // Available providers state
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [useAvailableProviders, setUseAvailableProviders] = useState(false);

  // Request tracking
  const [lastRequest, setLastRequest] = useState<object | null>(null);

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

    if (useAvailableProviders && availableProviders.length > 0) {
      requestBody.availableProviders = availableProviders;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to route prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, modality, humanContext, constraints, useHumanContext, useConstraints, availableProviders, useAvailableProviders]);

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
    <div className="w-full space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Prompt Input */}
        <div className="xl:col-span-2 space-y-4">
          {/* Prompt Card */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]/50 flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Test Prompt
              </label>
              <span className="text-[10px] text-[var(--text-quaternary)]">
                {prompt.length} chars
              </span>
            </div>

            <div className="p-4">
              <textarea
                placeholder="Enter your prompt to test the routing engine..."
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-0 py-0 bg-transparent border-none text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:outline-none resize-none text-sm leading-relaxed font-mono"
              />
              {error && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
            </div>

            {/* Example Prompts */}
            <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
              <div className="pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Quick Examples</span>
                  <div className="flex gap-1">
                    {examplePrompts.map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => setActiveExampleCategory(cat.category)}
                        className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                          activeExampleCategory === cat.category
                            ? 'bg-indigo-500/10 text-indigo-500'
                            : 'text-[var(--text-quaternary)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {cat.category}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {examplePrompts.find(c => c.category === activeExampleCategory)?.prompts.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.label}
                        onClick={() => setPrompt(example.prompt)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)] border border-[var(--border-primary)] transition-colors"
                      >
                        <Icon className="w-3 h-3" />
                        <span>{example.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Modality Selector */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-3 block">
              Input Modality
            </label>
            <div className="grid grid-cols-5 gap-2 grid-rows-2">
              {modalityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = modality === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setModality(option.value)}
                    title={option.description}
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
        </div>

        {/* Configuration Panels */}
        <div className="space-y-4">
          {/* Human Context Panel */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            <button
              onClick={() => setShowHumanContext(!showHumanContext)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">Human Context</span>
                {useHumanContext && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
              <motion.div animate={{ rotate: showHumanContext ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-[var(--text-quaternary)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showHumanContext && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
                    {/* Enable Toggle */}
                    <label className="flex items-center gap-2 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useHumanContext}
                        onChange={(e) => setUseHumanContext(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-primary)]"
                      />
                      <span className="text-xs text-[var(--text-secondary)]">Enable human context</span>
                    </label>

                    {useHumanContext && (
                      <>
                        {/* Mood */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Smile className="w-3 h-3" /> Mood
                          </label>
                          <select
                            value={humanContext.emotionalState?.mood || ''}
                            onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Not specified</option>
                            {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>

                        {/* Energy Level */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Battery className="w-3 h-3" /> Energy Level
                          </label>
                          <select
                            value={humanContext.emotionalState?.energyLevel || ''}
                            onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Not specified</option>
                            {energyOptions.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>

                        {/* Working Hours */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Sun className="w-3 h-3" /> Working Hours
                          </label>
                          <select
                            value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                            onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Not specified</option>
                            <option value="true">Yes (working hours)</option>
                            <option value="false">No (off hours)</option>
                          </select>
                        </div>

                        {/* Response Style */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Heart className="w-3 h-3" /> Preferred Style
                          </label>
                          <select
                            value={humanContext.preferences?.preferredResponseStyle || ''}
                            onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Not specified</option>
                            {responseStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        {/* Response Length */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Type className="w-3 h-3" /> Response Length
                          </label>
                          <select
                            value={humanContext.preferences?.preferredResponseLength || ''}
                            onChange={(e) => updateHumanContext(['preferences', 'preferredResponseLength'], e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Not specified</option>
                            {responseLengthOptions.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Constraints Panel */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            <button
              onClick={() => setShowConstraints(!showConstraints)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">Constraints</span>
                {useConstraints && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
              <motion.div animate={{ rotate: showConstraints ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-[var(--text-quaternary)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showConstraints && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
                    {/* Enable Toggle */}
                    <label className="flex items-center gap-2 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useConstraints}
                        onChange={(e) => setUseConstraints(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-primary)]"
                      />
                      <span className="text-xs text-[var(--text-secondary)]">Enable constraints</span>
                    </label>

                    {useConstraints && (
                      <>
                        {/* Max Cost */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <DollarSign className="w-3 h-3" /> Max Cost (per 1K tokens)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="e.g., 0.01"
                            value={constraints.maxCostPer1kTokens || ''}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              maxCostPer1kTokens: e.target.value ? parseFloat(e.target.value) : undefined
                            }))}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Max Latency */}
                        <div>
                          <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-quaternary)] mb-1.5">
                            <Zap className="w-3 h-3" /> Max Latency (ms)
                          </label>
                          <input
                            type="number"
                            step="100"
                            min="0"
                            placeholder="e.g., 1000"
                            value={constraints.maxLatencyMs || ''}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined
                            }))}
                            className="w-full px-2.5 py-1.5 text-xs bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Vision Required */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={constraints.requireVision || false}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              requireVision: e.target.checked || undefined
                            }))}
                            className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-primary)]"
                          />
                          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Eye className="w-3 h-3" /> Require Vision
                          </span>
                        </label>

                        {/* Audio Required */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={constraints.requireAudio || false}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              requireAudio: e.target.checked || undefined
                            }))}
                            className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-primary)]"
                          />
                          <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Mic className="w-3 h-3" /> Require Audio
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Available Providers Panel */}
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
            <button
              onClick={() => setShowProviders(!showProviders)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">Available Providers</span>
                {useAvailableProviders && availableProviders.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/10 text-blue-500 rounded-full font-medium">
                    {availableProviders.length}
                  </span>
                )}
              </div>
              <motion.div animate={{ rotate: showProviders ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-[var(--text-quaternary)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showProviders && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
                    {/* Enable Toggle */}
                    <label className="flex items-center gap-2 pt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAvailableProviders}
                        onChange={(e) => setUseAvailableProviders(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-indigo-500 focus:ring-indigo-500 bg-[var(--bg-primary)]"
                      />
                      <span className="text-xs text-[var(--text-secondary)]">Restrict to selected providers</span>
                    </label>

                    {useAvailableProviders && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {providerOptions.map((provider) => {
                          const isSelected = availableProviders.includes(provider.value);
                          return (
                            <button
                              key={provider.value}
                              onClick={() => {
                                setAvailableProviders(prev =>
                                  isSelected
                                    ? prev.filter(p => p !== provider.value)
                                    : [...prev, provider.value]
                                );
                              }}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all text-left ${
                                isSelected
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                  : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-tertiary)] hover:border-[var(--border-secondary)] hover:text-[var(--text-secondary)]'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${provider.color}`} />
                              <span className="text-xs font-medium">{provider.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
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
                  <span>Routing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Route</span>
                  <kbd className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 text-[10px] bg-white/10 rounded">
                    ⌘↵
                  </kbd>
                </>
              )}
            </button>
            {(result || isLoading) && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center w-12 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {!result && !isLoading ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-primary)]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[var(--text-quaternary)]" />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] max-w-[280px]">
              Enter a prompt and configure options to test the ADE routing engine
            </p>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
              <div className="h-48 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
              <div className="h-56 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] animate-pulse" />
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Web Search Banner */}
            {result.webSearchRequired && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-emerald-600">Web Search Recommended</p>
                  <p className="text-[10px] text-emerald-500/80 mt-0.5">
                    This prompt requires real-time or up-to-date information from the web
                    {result.primaryModel.supportsWebSearch && ' — selected model supports web search'}
                  </p>
                </div>
                {result.primaryModel.supportsWebSearch ? (
                  <span className="flex-shrink-0 text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-600 rounded-full font-medium">
                    Supported
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-[10px] px-2 py-1 bg-amber-500/20 text-amber-600 rounded-full font-medium">
                    Not Supported
                  </span>
                )}
              </motion.div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-emerald-500">
                  {result.timing.totalMs.toFixed(1)}ms
                </p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Analysis</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">
                  {result.timing.analysisMs.toFixed(1)}ms
                </p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)]">Scoring</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">
                  {result.timing.scoringMs.toFixed(1)}ms
                </p>
              </div>
            </div>

            {/* Main Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Analysis */}
                <AnalysisDisplay analysis={result.analysis} />

                {/* All Models Comparison */}
                <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[var(--border-primary)]">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-quaternary)]">
                      All Models Ranking
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {[result.primaryModel, ...result.backupModels].map((model, idx) => {
                        const isTop = idx === 0;
                        return (
                          <div
                            key={model.id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${
                              isTop ? 'bg-indigo-500/5 border border-indigo-500/20' : 'bg-[var(--bg-primary)]'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                              isTop ? 'bg-indigo-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className={`w-2 h-2 rounded-full ${getProviderColor(model.provider)}`} />
                            <span className={`flex-1 text-xs font-medium ${
                              isTop ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                            }`}>
                              {model.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {'supportsWebSearch' in model && (model as { supportsWebSearch?: boolean }).supportsWebSearch && (
                                <span className="flex-shrink-0" aria-label="Supports web search">
                                  <Globe className="w-3 h-3 text-emerald-500" />
                                </span>
                              )}
                              <div className="w-20 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${isTop ? 'bg-indigo-500' : 'bg-[var(--text-quaternary)]'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${model.score * 100}%` }}
                                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                                />
                              </div>
                              <span className={`text-xs font-mono w-8 text-right ${
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
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
              </div>
            </div>

            {/* JSON Viewer Toggle */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
              <button
                onClick={() => setShowJsonView(!showJsonView)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Raw JSON (Request & Response)</span>
                </div>
                <div className="flex items-center gap-2">
                  {showJsonView && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyJson(); }}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded transition-colors"
                    >
                      {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedJson ? 'Copied!' : 'Copy'}
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
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
                      <pre className="mt-3 p-4 text-[11px] font-mono bg-[var(--bg-primary)] rounded-lg overflow-x-auto text-[var(--text-secondary)] max-h-96 overflow-y-auto">
                        {JSON.stringify({ request: lastRequest, response: result }, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
