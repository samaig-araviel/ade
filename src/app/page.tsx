'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Search,
  X,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Image,
  Mic,
  Layers,
  Settings2,
  Zap,
  DollarSign,
  Gauge,
  Brain,
  TrendingUp,
  RefreshCw,
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
  emotionalState?: { mood?: string; energyLevel?: string };
  temporalContext?: { localTime?: string; isWorkingHours?: boolean };
  preferences?: { preferredResponseStyle?: string };
}

interface Constraints {
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  requireVision?: boolean;
  requireAudio?: boolean;
}

const modalities = [
  { id: 'text', label: 'Text', icon: MessageSquare },
  { id: 'image', label: 'Vision', icon: Image },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'text+image', label: 'Multimodal', icon: Layers },
];

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'result' | 'factors' | 'json'>('result');

  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);
  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);
  const [lastRequest, setLastRequest] = useState<object | null>(null);

  const handleRoute = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    setResult(null);
    setIsLoading(true);

    const requestBody: Record<string, unknown> = { prompt: prompt.trim(), modality };
    if (useHumanContext && Object.keys(humanContext).length > 0) requestBody.humanContext = humanContext;
    if (useConstraints && Object.keys(constraints).length > 0) requestBody.constraints = constraints;
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
      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to route');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, modality, humanContext, constraints, useHumanContext, useConstraints]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ request: lastRequest, response: result }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        if (value === '' || value === undefined) delete current[lastKey];
        else current[lastKey] = value;
      }
      return newContext;
    });
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return '#D97706';
      case 'openai': return '#059669';
      case 'google': return '#2563EB';
      default: return '#6B7280';
    }
  };

  const factors = [
    { key: 'task', label: 'Task Fit', icon: Brain, color: '#8B5CF6' },
    { key: 'modality', label: 'Modality', icon: Layers, color: '#6366F1' },
    { key: 'cost', label: 'Cost', icon: DollarSign, color: '#10B981' },
    { key: 'speed', label: 'Speed', icon: Zap, color: '#F59E0B' },
    { key: 'preference', label: 'Preference', icon: TrendingUp, color: '#EC4899' },
    { key: 'coherence', label: 'Coherence', icon: Gauge, color: '#3B82F6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24,
                height: 24,
                background: '#000',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles style={{ width: 14, height: 14, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>ADE</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={{
                padding: '6px 12px',
                fontSize: 13,
                color: '#000',
                background: '#F5F5F5',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 500,
              }}>Router</button>
              <button style={{
                padding: '6px 12px',
                fontSize: 13,
                color: '#666',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}>Models</button>
              <button style={{
                padding: '6px 12px',
                fontSize: 13,
                color: '#666',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}>API</button>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowStatus(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                fontSize: 13,
                color: '#666',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 6, height: 6, background: '#22C55E', borderRadius: '50%' }} />
              Status
            </button>
            <a
              href="/api/v1/health"
              target="_blank"
              style={{
                padding: '6px 12px',
                fontSize: 13,
                color: '#fff',
                background: '#000',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              API Docs
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Input Section */}
            <div style={{
              background: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
            }}>
              <div style={{ padding: 16 }}>
                <textarea
                  placeholder="Enter a prompt to route..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleRoute(); }}
                  style={{
                    width: '100%',
                    minHeight: 80,
                    padding: 0,
                    fontSize: 14,
                    color: '#000',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #E5E5E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#F5F5F5',
                    borderRadius: 6,
                    padding: 2,
                  }}>
                    {modalities.map((m) => {
                      const Icon = m.icon;
                      const isActive = modality === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setModality(m.id)}
                          title={m.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            background: isActive ? '#fff' : 'transparent',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          }}
                        >
                          <Icon style={{ width: 14, height: 14, color: isActive ? '#000' : '#999' }} />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 10px',
                      fontSize: 12,
                      color: showAdvanced ? '#000' : '#666',
                      background: showAdvanced ? '#F5F5F5' : 'transparent',
                      border: '1px solid #E5E5E5',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Settings2 style={{ width: 12, height: 12 }} />
                    Options
                  </button>
                </div>
                <button
                  onClick={handleRoute}
                  disabled={isLoading || !prompt.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#fff',
                    background: isLoading || !prompt.trim() ? '#999' : '#000',
                    border: 'none',
                    borderRadius: 6,
                    cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw style={{ width: 14, height: 14 }} />
                    </motion.div>
                  ) : (
                    <Search style={{ width: 14, height: 14 }} />
                  )}
                  {isLoading ? 'Routing...' : 'Route'}
                </button>
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: 16,
                      borderTop: '1px solid #E5E5E5',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                    }}>
                      {/* Human Context */}
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12,
                          cursor: 'pointer',
                        }}>
                          <input
                            type="checkbox"
                            checked={useHumanContext}
                            onChange={(e) => setUseHumanContext(e.target.checked)}
                            style={{ width: 14, height: 14, accentColor: '#000' }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#000' }}>Human Context</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <select
                            value={humanContext.emotionalState?.mood || ''}
                            onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                            disabled={!useHumanContext}
                            style={{
                              padding: '6px 8px',
                              fontSize: 12,
                              border: '1px solid #E5E5E5',
                              borderRadius: 6,
                              background: '#fff',
                              color: useHumanContext ? '#000' : '#999',
                            }}
                          >
                            <option value="">Mood</option>
                            {['happy', 'neutral', 'stressed', 'frustrated', 'calm'].map(m =>
                              <option key={m} value={m}>{m}</option>
                            )}
                          </select>
                          <select
                            value={humanContext.emotionalState?.energyLevel || ''}
                            onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                            disabled={!useHumanContext}
                            style={{
                              padding: '6px 8px',
                              fontSize: 12,
                              border: '1px solid #E5E5E5',
                              borderRadius: 6,
                              background: '#fff',
                              color: useHumanContext ? '#000' : '#999',
                            }}
                          >
                            <option value="">Energy</option>
                            {['low', 'moderate', 'high'].map(e =>
                              <option key={e} value={e}>{e}</option>
                            )}
                          </select>
                        </div>
                      </div>
                      {/* Constraints */}
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12,
                          cursor: 'pointer',
                        }}>
                          <input
                            type="checkbox"
                            checked={useConstraints}
                            onChange={(e) => setUseConstraints(e.target.checked)}
                            style={{ width: 14, height: 14, accentColor: '#000' }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#000' }}>Constraints</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <input
                            type="number"
                            placeholder="Max cost/1k"
                            step="0.001"
                            value={constraints.maxCostPer1kTokens || ''}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              maxCostPer1kTokens: e.target.value ? parseFloat(e.target.value) : undefined
                            }))}
                            disabled={!useConstraints}
                            style={{
                              padding: '6px 8px',
                              fontSize: 12,
                              border: '1px solid #E5E5E5',
                              borderRadius: 6,
                              background: '#fff',
                              color: useConstraints ? '#000' : '#999',
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Max latency (ms)"
                            step="100"
                            value={constraints.maxLatencyMs || ''}
                            onChange={(e) => setConstraints(prev => ({
                              ...prev,
                              maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined
                            }))}
                            disabled={!useConstraints}
                            style={{
                              padding: '6px 8px',
                              fontSize: 12,
                              border: '1px solid #E5E5E5',
                              borderRadius: 6,
                              background: '#fff',
                              color: useConstraints ? '#000' : '#999',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 6,
                fontSize: 13,
                color: '#DC2626',
              }}>
                <AlertCircle style={{ width: 14, height: 14 }} />
                {error}
              </div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {/* Result Card */}
                  <div style={{
                    background: '#fff',
                    border: '1px solid #E5E5E5',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #E5E5E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>
                          {result.primaryModel.name}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          fontSize: 11,
                          fontWeight: 500,
                          color: '#059669',
                          background: '#ECFDF5',
                          borderRadius: 4,
                        }}>
                          Recommended
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={handleRoute}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            background: 'transparent',
                            border: '1px solid #E5E5E5',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                          title="Run again"
                        >
                          <RefreshCw style={{ width: 14, height: 14, color: '#666' }} />
                        </button>
                        <button
                          onClick={handleCopy}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            background: 'transparent',
                            border: '1px solid #E5E5E5',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                          title="Copy JSON"
                        >
                          {copied ?
                            <Check style={{ width: 14, height: 14, color: '#059669' }} /> :
                            <Copy style={{ width: 14, height: 14, color: '#666' }} />
                          }
                        </button>
                        <button
                          onClick={() => setResult(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            background: 'transparent',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <X style={{ width: 14, height: 14, color: '#999' }} />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div style={{
                      display: 'flex',
                      borderBottom: '1px solid #E5E5E5',
                    }}>
                      {[
                        { id: 'result', label: 'Result' },
                        { id: 'factors', label: 'Factors' },
                        { id: 'json', label: 'JSON' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as typeof activeTab)}
                          style={{
                            padding: '10px 16px',
                            fontSize: 13,
                            fontWeight: activeTab === tab.id ? 500 : 400,
                            color: activeTab === tab.id ? '#000' : '#666',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent',
                            marginBottom: -1,
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ padding: 16 }}>
                      {activeTab === 'result' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {/* Stats Row */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 12,
                          }}>
                            {[
                              { label: 'Confidence', value: `${Math.round(result.confidence * 100)}%` },
                              { label: 'Total Time', value: `${result.timing.totalMs.toFixed(1)}ms` },
                              { label: 'Intent', value: result.analysis.intent },
                              { label: 'Complexity', value: result.analysis.complexity },
                            ].map((stat) => (
                              <div key={stat.label} style={{
                                padding: 12,
                                background: '#FAFAFA',
                                borderRadius: 6,
                              }}>
                                <div style={{ fontSize: 11, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{stat.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#000', textTransform: 'capitalize' }}>{stat.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Models */}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 8 }}>Model Ranking</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {[result.primaryModel, ...result.backupModels].map((model, idx) => (
                                <div
                                  key={model.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    background: idx === 0 ? '#F5F5F5' : 'transparent',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: 6,
                                  }}
                                >
                                  <span style={{
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: idx === 0 ? '#fff' : '#666',
                                    background: idx === 0 ? '#000' : '#E5E5E5',
                                    borderRadius: 4,
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: getProviderColor(model.provider),
                                  }} />
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#000' }}>
                                    {model.name}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#666' }}>{model.provider}</span>
                                  <div style={{ width: 60, height: 4, background: '#E5E5E5', borderRadius: 2, overflow: 'hidden' }}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${model.score * 100}%` }}
                                      style={{ height: '100%', background: idx === 0 ? '#000' : '#999', borderRadius: 2 }}
                                    />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#000', width: 28, textAlign: 'right' }}>
                                    {Math.round(model.score * 100)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Summary */}
                          <div style={{
                            padding: 12,
                            background: '#FAFAFA',
                            borderRadius: 6,
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6 }}>Reasoning</div>
                            <div style={{ fontSize: 13, color: '#000', lineHeight: 1.5 }}>
                              {result.primaryModel.reasoning.summary}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'factors' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {result.primaryModel.reasoning.factors.map((factor, idx) => {
                            const factorInfo = factors[idx] ?? factors[0] ?? { key: 'default', label: 'Factor', icon: Brain, color: '#8B5CF6' };
                            const Icon = factorInfo.icon;
                            return (
                              <div
                                key={factor.name}
                                style={{
                                  padding: 12,
                                  background: '#FAFAFA',
                                  borderRadius: 6,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <Icon style={{ width: 14, height: 14, color: factorInfo.color }} />
                                  <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>{factor.name}</span>
                                  <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#000' }}>
                                    {Math.round(factor.score * 100)}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{factor.detail}</div>
                                <div style={{ marginTop: 8, fontSize: 11, color: '#999' }}>
                                  Weight: {Math.round(factor.weight * 100)}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {activeTab === 'json' && (
                        <div style={{
                          background: '#18181B',
                          borderRadius: 6,
                          padding: 12,
                          overflow: 'auto',
                          maxHeight: 400,
                        }}>
                          <pre style={{
                            margin: 0,
                            fontSize: 12,
                            fontFamily: 'ui-monospace, monospace',
                            color: '#A1A1AA',
                            lineHeight: 1.5,
                          }}>
                            {JSON.stringify({ request: lastRequest, response: result }, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!result && !isLoading && (
              <div style={{
                background: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                padding: '48px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: '#F5F5F5',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Sparkles style={{ width: 20, height: 20, color: '#666' }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: '0 0 6px' }}>
                  Intelligent LLM Routing
                </h3>
                <p style={{ fontSize: 13, color: '#666', margin: 0, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
                  Enter a prompt and ADE will recommend the optimal model based on task requirements.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats */}
            <div style={{
              background: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Engine Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Models', value: '10' },
                  { label: 'Latency', value: '<50ms' },
                  { label: 'Factors', value: '7' },
                  { label: 'Providers', value: '3' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#000' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Factors */}
            <div style={{
              background: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Scoring Weights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Task Fitness', weight: 40 },
                  { name: 'Modality Fit', weight: 15 },
                  { name: 'Cost Efficiency', weight: 15 },
                  { name: 'Speed', weight: 10 },
                  { name: 'User Preference', weight: 10 },
                  { name: 'Coherence', weight: 10 },
                ].map((factor) => (
                  <div key={factor.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#000' }}>{factor.name}</span>
                    <span style={{ fontSize: 12, color: '#666' }}>{factor.weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Models */}
            <div style={{
              background: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Available Models</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { provider: 'Anthropic', color: '#D97706', models: ['Claude Opus 4.5', 'Claude Sonnet 4', 'Claude Haiku 4.5'] },
                  { provider: 'OpenAI', color: '#059669', models: ['GPT-4.1', 'GPT-4.1 Mini', 'GPT-4o', 'o4-mini'] },
                  { provider: 'Google', color: '#2563EB', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash'] },
                ].map((group) => (
                  <div key={group.provider}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: group.color }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#000' }}>{group.provider}</span>
                    </div>
                    <div style={{ paddingLeft: 12 }}>
                      {group.models.map((model) => (
                        <div key={model} style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{model}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Card */}
            <div style={{
              background: '#18181B',
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', marginBottom: 8 }}>API Endpoint</div>
              <code style={{
                display: 'block',
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                color: '#A1A1AA',
                background: 'rgba(255,255,255,0.1)',
                padding: '8px 10px',
                borderRadius: 4,
                marginBottom: 12,
              }}>
                POST /api/v1/route
              </code>
              <a
                href="/api/v1/health"
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#A1A1AA',
                  textDecoration: 'none',
                }}
              >
                View health check
                <ChevronRight style={{ width: 12, height: 12 }} />
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
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setShowStatus(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 560,
                maxHeight: '80vh',
                overflow: 'auto',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #E5E5E5',
              }}
            >
              <div style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #E5E5E5',
                background: '#fff',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>System Status</span>
                <button
                  onClick={() => setShowStatus(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: 14, height: 14, color: '#666' }} />
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
