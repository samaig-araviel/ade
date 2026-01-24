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
  const [_routingHistory, setRoutingHistory] = useState<Array<{ id: string; prompt: string; model: string; time: string }>>([]);

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

      setRoutingHistory(prev => [{
        id: data.decisionId,
        prompt: prompt.trim().substring(0, 50) + (prompt.length > 50 ? '...' : ''),
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
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>ADE</span>
            </div>
            <nav style={{ display: 'flex', gap: 4 }}>
              <button style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: '#000', background: '#f5f5f5', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Router</button>
              <button style={{ padding: '8px 16px', fontSize: 14, color: '#666', background: 'transparent', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Models</button>
              <button style={{ padding: '8px 16px', fontSize: 14, color: '#666', background: 'transparent', borderRadius: 8, border: 'none', cursor: 'pointer' }}>API</button>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowStatus(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 14, color: '#666', background: 'transparent', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              <Activity style={{ width: 16, height: 16 }} />
              Status
            </button>
            <a href="https://github.com/samaig-araviel/ade" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 14, color: '#666', textDecoration: 'none', borderRadius: 8 }}>
              <Github style={{ width: 16, height: 16 }} />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eaeaea', padding: '20px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#000', margin: 0 }}>Engine Test Console</h1>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Left Column - Main Content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Engine Stats Card */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>Engine Stats</h2>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: 100, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }}></span>
                  Online
                </span>
              </div>
              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Available Models</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#000' }}>10</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Target Latency</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#000' }}>&lt;50<span style={{ fontSize: 16, fontWeight: 400, color: '#999' }}>ms</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Scoring Factors</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#000' }}>7</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Session Requests</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#000' }}>{requestCount}</div>
                </div>
              </div>
            </div>

            {/* Test Prompt Card */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>Test Prompt</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 4, background: '#f5f5f5', borderRadius: 8 }}>
                  {modalityOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = modality === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setModality(option.value)}
                        title={option.label}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: isSelected ? '#fff' : 'transparent',
                          boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          color: isSelected ? '#000' : '#999',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon style={{ width: 16, height: 16 }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <textarea
                  placeholder="Enter your prompt to test the routing engine..."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 14,
                    lineHeight: 1.6,
                    border: '1px solid #eaeaea',
                    borderRadius: 8,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />

                {error && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 14 }}>
                    <AlertCircle style={{ width: 16, height: 16 }} />
                    {error}
                  </div>
                )}

                {/* Quick Examples */}
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {examplePrompts.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.label}
                        onClick={() => setPrompt(example.prompt)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          fontSize: 13,
                          color: '#666',
                          background: '#f9f9f9',
                          border: '1px solid #eaeaea',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Icon style={{ width: 14, height: 14 }} />
                        {example.label}
                      </button>
                    );
                  })}
                </div>

                {/* Advanced Options */}
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowHumanContext(!showHumanContext)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: useHumanContext ? '#6366f1' : '#666',
                      background: useHumanContext ? 'rgba(99, 102, 241, 0.1)' : '#f9f9f9',
                      border: `1px solid ${useHumanContext ? 'rgba(99, 102, 241, 0.3)' : '#eaeaea'}`,
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <User style={{ width: 16, height: 16 }} />
                    Human Context
                    <ChevronDown style={{ width: 14, height: 14, transform: showHumanContext ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  <button
                    onClick={() => setShowConstraints(!showConstraints)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: useConstraints ? '#f59e0b' : '#666',
                      background: useConstraints ? 'rgba(245, 158, 11, 0.1)' : '#f9f9f9',
                      border: `1px solid ${useConstraints ? 'rgba(245, 158, 11, 0.3)' : '#eaeaea'}`,
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <Settings2 style={{ width: 16, height: 16 }} />
                    Constraints
                    <ChevronDown style={{ width: 14, height: 14, transform: showConstraints ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {/* Human Context Panel */}
                <AnimatePresence>
                  {showHumanContext && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eaeaea' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={useHumanContext}
                            onChange={(e) => setUseHumanContext(e.target.checked)}
                            style={{ width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>Include human context in routing</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Mood</label>
                            <select
                              value={humanContext.emotionalState?.mood || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}
                            >
                              <option value="">Select...</option>
                              {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Energy</label>
                            <select
                              value={humanContext.emotionalState?.energyLevel || ''}
                              onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}
                            >
                              <option value="">Select...</option>
                              {energyOptions.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Style</label>
                            <select
                              value={humanContext.preferences?.preferredResponseStyle || ''}
                              onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}
                            >
                              <option value="">Select...</option>
                              {responseStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Working Hours</label>
                            <select
                              value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                              onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}
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
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eaeaea' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={useConstraints}
                            onChange={(e) => setUseConstraints(e.target.checked)}
                            style={{ width: 16, height: 16 }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>Apply constraints to routing</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Max Cost/1K</label>
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
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Max Latency (ms)</label>
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
                              style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #ddd', borderRadius: 6, background: '#fff', boxSizing: 'border-box' }}
                            />
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', alignSelf: 'end', paddingBottom: 6 }}>
                            <input
                              type="checkbox"
                              checked={constraints.requireVision || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireVision: e.target.checked || undefined
                              }))}
                              style={{ width: 16, height: 16 }}
                            />
                            <span style={{ fontSize: 13, color: '#333' }}>Vision</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', alignSelf: 'end', paddingBottom: 6 }}>
                            <input
                              type="checkbox"
                              checked={constraints.requireAudio || false}
                              onChange={(e) => setConstraints(prev => ({
                                ...prev,
                                requireAudio: e.target.checked || undefined
                              }))}
                              style={{ width: 16, height: 16 }}
                            />
                            <span style={{ fontSize: 13, color: '#333' }}>Audio</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleRoute}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#fff',
                      background: '#000',
                      border: 'none',
                      borderRadius: 8,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Routing...
                      </>
                    ) : (
                      <>
                        <Play style={{ width: 16, height: 16 }} />
                        Route Prompt
                      </>
                    )}
                  </button>
                  {(result || prompt) && (
                    <button
                      onClick={handleReset}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        fontSize: 14,
                        color: '#666',
                        background: '#fff',
                        border: '1px solid #eaeaea',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw style={{ width: 16, height: 16 }} />
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
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {/* Routing Results Card */}
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaeaea' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>Routing Results</h3>
                    </div>
                    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      <div style={{ textAlign: 'center', padding: 16, background: 'rgba(99, 102, 241, 0.08)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Confidence</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>{Math.round(result.confidence * 100)}%</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 16, background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Time</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#047857' }}>{result.timing.totalMs.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400 }}>ms</span></div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 16, background: 'rgba(59, 130, 246, 0.08)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Analysis</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#1d4ed8' }}>{result.timing.analysisMs.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400 }}>ms</span></div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 16, background: 'rgba(245, 158, 11, 0.08)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Scoring</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#b45309' }}>{result.timing.scoringMs.toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400 }}>ms</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis + Rankings Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <AnalysisDisplay analysis={result.analysis} />

                    {/* Model Rankings */}
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaeaea' }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Model Ranking</span>
                      </div>
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[result.primaryModel, ...result.backupModels].map((model, idx) => {
                          const isTop = idx === 0;
                          return (
                            <div
                              key={model.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: 12,
                                borderRadius: 8,
                                background: isTop ? 'rgba(99, 102, 241, 0.08)' : '#f9f9f9',
                                border: isTop ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
                              }}
                            >
                              <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 600,
                                background: isTop ? '#6366f1' : '#e5e5e5',
                                color: isTop ? '#fff' : '#666'
                              }}>
                                {idx + 1}
                              </div>
                              <div style={{ width: 8, height: 8, borderRadius: '50%' }} className={getProviderColor(model.provider)}></div>
                              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: isTop ? '#4f46e5' : '#333' }}>
                                {model.name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 60, height: 6, background: '#e5e5e5', borderRadius: 3, overflow: 'hidden' }}>
                                  <motion.div
                                    style={{ height: '100%', borderRadius: 3, background: isTop ? '#6366f1' : '#999' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${model.score * 100}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  />
                                </div>
                                <span style={{ fontSize: 12, fontFamily: 'monospace', width: 28, textAlign: 'right', color: isTop ? '#6366f1' : '#666' }}>
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
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #eaeaea' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: 0 }}>Recommended Model</h3>
                    </div>
                    <div style={{ padding: 20 }}>
                      <ModelCard model={result.primaryModel} rank="primary" />
                      {result.backupModels.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eaeaea' }}>
                          <h4 style={{ fontSize: 13, fontWeight: 500, color: '#666', marginBottom: 12 }}>Alternatives</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {result.backupModels.map((model, index) => (
                              <ModelCard key={model.id} model={model} rank="backup" index={index + 1} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JSON Viewer */}
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', overflow: 'hidden' }}>
                    <button
                      onClick={() => setShowJsonView(!showJsonView)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileJson style={{ width: 16, height: 16, color: '#666' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Raw JSON Response</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {showJsonView && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyJson(); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 12, color: '#666', background: '#f5f5f5', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                          >
                            {copiedJson ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                            {copiedJson ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                        <ChevronDown style={{ width: 16, height: 16, color: '#999', transform: showJsonView ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {showJsonView && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #eaeaea' }}>
                            <pre style={{ marginTop: 16, padding: 16, fontSize: 12, fontFamily: 'monospace', background: '#f9f9f9', borderRadius: 8, overflow: 'auto', maxHeight: 320, color: '#333' }}>
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
          <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* How To Use Card */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 16 }}>How To Use</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { num: 1, title: 'Enter a Prompt', desc: 'Type any text prompt to route to the optimal LLM model.' },
                  { num: 2, title: 'Configure Options', desc: 'Select modality and add context or constraints.' },
                  { num: 3, title: 'Review Results', desc: 'See the recommended model with scoring breakdown.' }
                ].map((step) => (
                  <div key={step.num} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#666', flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#000', marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Factors Card */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 16 }}>Scoring Factors</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Task Fitness', weight: '40%', color: '#6366f1' },
                  { name: 'Modality Fit', weight: '15%', color: '#8b5cf6' },
                  { name: 'Cost Efficiency', weight: '15%', color: '#10b981' },
                  { name: 'Speed', weight: '10%', color: '#f59e0b' },
                  { name: 'User Preference', weight: '10%', color: '#ef4444' },
                  { name: 'Coherence', weight: '10%', color: '#3b82f6' }
                ].map((factor) => (
                  <div key={factor.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: factor.color }}></div>
                      <span style={{ fontSize: 13, color: '#333' }}>{factor.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#999' }}>{factor.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Models Card */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eaeaea', padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 16 }}>Available Models</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { provider: 'Anthropic', color: '#d97706', models: ['Claude Opus 4.5', 'Claude Sonnet 4', 'Claude Haiku 4.5'] },
                  { provider: 'OpenAI', color: '#10b981', models: ['GPT-4.1', 'GPT-4.1 Mini', 'GPT-4o', 'o4-mini'] },
                  { provider: 'Google', color: '#3b82f6', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.5 Flash Lite'] }
                ].map((group) => (
                  <div key={group.provider}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }}></div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{group.provider}</span>
                    </div>
                    <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {group.models.map((model) => (
                        <div key={model} style={{ fontSize: 13, color: '#666' }}>{model}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Integration Card - Dark */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 12, padding: 20, color: '#fff' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>API Integration</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 1.5 }}>
                Integrate the routing engine into your application.
              </p>
              <code style={{ display: 'block', fontSize: 12, fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: 6, marginBottom: 12 }}>
                POST /api/v1/route
              </code>
              <a
                href="/api/v1/health"
                target="_blank"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
              >
                View API Health
                <ExternalLink style={{ width: 14, height: 14 }} />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatus && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowStatus(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{ position: 'relative', width: '100%', maxWidth: 640, maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eaeaea', background: '#fff' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>System Status</h2>
                <button
                  onClick={() => setShowStatus(false)}
                  style={{ padding: 8, color: '#999', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ padding: 20 }}>
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
