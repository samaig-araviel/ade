'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusPage } from '@/components/status/StatusPage';
import {
  Sparkles,
  Search,
  Settings,
  X,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Clock,
  MessageSquare,
  LayoutGrid,
  Users,
  Building2,
  Target,
  Zap,
  DollarSign,
  Gauge,
  Brain,
  Layers,
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

const modalityFilters = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'image', label: 'Vision', icon: Target },
  { value: 'voice', label: 'Voice', icon: Users },
  { value: 'multimodal', label: 'Multimodal', icon: Building2 },
];

const moodOptions = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
const energyOptions = ['low', 'moderate', 'high'];
const responseStyleOptions = ['concise', 'detailed', 'conversational', 'formal', 'casual'];

export default function Home() {
  const [showStatus, setShowStatus] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendation' | 'factors' | 'raw'>('recommendation');

  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);
  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);
  const [lastRequest, setLastRequest] = useState<object | null>(null);

  const handleRoute = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setResult(null);
    setIsLoading(true);

    const modality = activeFilter === 'all' ? 'text' :
                     activeFilter === 'multimodal' ? 'text+image' : activeFilter;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to route prompt');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, activeFilter, humanContext, constraints, useHumanContext, useConstraints]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
      case 'anthropic': return '#D97706';
      case 'openai': return '#10B981';
      case 'google': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getProviderBg = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return 'rgba(217, 119, 6, 0.1)';
      case 'openai': return 'rgba(16, 185, 129, 0.1)';
      case 'google': return 'rgba(59, 130, 246, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const scoringFactors = [
    { name: 'Task Fitness', weight: 40, icon: Brain, color: '#7C3AED' },
    { name: 'Modality Fit', weight: 15, icon: Layers, color: '#8B5CF6' },
    { name: 'Cost Efficiency', weight: 15, icon: DollarSign, color: '#10B981' },
    { name: 'Speed', weight: 10, icon: Zap, color: '#F59E0B' },
    { name: 'User Preference', weight: 10, icon: Users, color: '#EC4899' },
    { name: 'Coherence', weight: 10, icon: TrendingUp, color: '#3B82F6' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 50%, #F0FDFA 100%)',
      position: 'relative',
    }}>
      {/* Subtle geometric pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-3.486 3.485 1.415 1.415L searching34.142 0H32zm-6.657 0L16.857 8.485 18.27 9.9 28.172 0h-2.83zM.001 0l-.83.83L.586 2.244 2.828 0H.001zm0 2.828L1.414 4.242l1.414-1.414L1.414 1.414.001 2.828zm2.828 0l1.414 1.414L5.657 2.828 4.243 1.414 2.83 2.828zm2.828 0L7.07 4.242 8.485 2.828 7.07 1.414 5.657 2.828z' fill='%238B5CF6' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            }}>
              <Sparkles style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.02em' }}>ADE</span>
              <span style={{ fontSize: 20, fontWeight: 400, color: '#6B7280', marginLeft: 6 }}>Engine</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setShowStatus(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: '#6B7280',
                background: 'transparent',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              Status
            </button>
            <a
              href="/api/v1/health"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 500,
                color: '#fff',
                background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                borderRadius: 10,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              API Docs
              <ExternalLink style={{ width: 14, height: 14 }} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '32px' }}>
        {/* Search Section */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(124, 58, 237, 0.08)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#374151' }}>Ask ADE to route your prompt</span>
            <span style={{
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: '#7C3AED',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>BETA</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '4px 4px 4px 20px',
            background: '#F9FAFB',
            borderRadius: 12,
            border: '1px solid #E5E7EB',
          }}>
            <Search style={{ width: 20, height: 20, color: '#9CA3AF', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="e.g. Write a Python script to analyze sales data and generate a report"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                padding: '14px 0',
                fontSize: 15,
                color: '#1F2937',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
            <button
              onClick={handleRoute}
              disabled={isLoading || !prompt.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                background: isLoading ? '#E5E7EB' : 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                borderRadius: 10,
                border: 'none',
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw style={{ width: 20, height: 20, color: '#9CA3AF' }} />
                </motion.div>
              ) : (
                <Search style={{ width: 20, height: 20, color: '#fff' }} />
              )}
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 8,
              color: '#DC2626',
              fontSize: 14,
            }}>
              <AlertCircle style={{ width: 16, height: 16 }} />
              {error}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>Route for:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {modalityFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? '#7C3AED' : '#6B7280',
                    background: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon style={{ width: 16, height: 16 }} />
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              background: showSettings ? 'rgba(124, 58, 237, 0.1)' : '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Settings style={{ width: 18, height: 18, color: showSettings ? '#7C3AED' : '#6B7280' }} />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: 24 }}
            >
              <div style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}>
                {/* Human Context */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={useHumanContext}
                      onChange={(e) => setUseHumanContext(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#7C3AED' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Human Context</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Mood</label>
                      <select
                        value={humanContext.emotionalState?.mood || ''}
                        onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                        disabled={!useHumanContext}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          cursor: useHumanContext ? 'pointer' : 'not-allowed',
                          opacity: useHumanContext ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select...</option>
                        {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Energy</label>
                      <select
                        value={humanContext.emotionalState?.energyLevel || ''}
                        onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                        disabled={!useHumanContext}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          cursor: useHumanContext ? 'pointer' : 'not-allowed',
                          opacity: useHumanContext ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select...</option>
                        {energyOptions.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Response Style</label>
                      <select
                        value={humanContext.preferences?.preferredResponseStyle || ''}
                        onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                        disabled={!useHumanContext}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          cursor: useHumanContext ? 'pointer' : 'not-allowed',
                          opacity: useHumanContext ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select...</option>
                        {responseStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Working Hours</label>
                      <select
                        value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                        onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                        disabled={!useHumanContext}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          cursor: useHumanContext ? 'pointer' : 'not-allowed',
                          opacity: useHumanContext ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={useConstraints}
                      onChange={(e) => setUseConstraints(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#7C3AED' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Constraints</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Max Cost/1K Tokens</label>
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
                        disabled={!useConstraints}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          boxSizing: 'border-box',
                          cursor: useConstraints ? 'text' : 'not-allowed',
                          opacity: useConstraints ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Max Latency (ms)</label>
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
                        disabled={!useConstraints}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: 14,
                          border: '1px solid #E5E7EB',
                          borderRadius: 8,
                          background: '#fff',
                          color: '#374151',
                          boxSizing: 'border-box',
                          cursor: useConstraints ? 'text' : 'not-allowed',
                          opacity: useConstraints ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 0',
                      cursor: useConstraints ? 'pointer' : 'not-allowed',
                      opacity: useConstraints ? 1 : 0.5,
                    }}>
                      <input
                        type="checkbox"
                        checked={constraints.requireVision || false}
                        onChange={(e) => setConstraints(prev => ({
                          ...prev,
                          requireVision: e.target.checked || undefined
                        }))}
                        disabled={!useConstraints}
                        style={{ width: 16, height: 16, accentColor: '#7C3AED' }}
                      />
                      <span style={{ fontSize: 14, color: '#374151' }}>Require Vision</span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 0',
                      cursor: useConstraints ? 'pointer' : 'not-allowed',
                      opacity: useConstraints ? 1 : 0.5,
                    }}>
                      <input
                        type="checkbox"
                        checked={constraints.requireAudio || false}
                        onChange={(e) => setConstraints(prev => ({
                          ...prev,
                          requireAudio: e.target.checked || undefined
                        }))}
                        disabled={!useConstraints}
                        style={{ width: 16, height: 16, accentColor: '#7C3AED' }}
                      />
                      <span style={{ fontSize: 14, color: '#374151' }}>Require Audio</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Result Card Header */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(124, 58, 237, 0.08)',
                overflow: 'hidden',
              }}>
                {/* Card Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>
                      {result.primaryModel.name}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#10B981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 100,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      Recommended
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={handleRoute}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#6B7280',
                        background: 'transparent',
                        border: '1px solid #E5E7EB',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw style={{ width: 14, height: 14 }} />
                      Run again
                    </button>
                    <button
                      onClick={handleCopyJson}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#7C3AED',
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedJson ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                      {copiedJson ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: '#9CA3AF',
                      }}
                    >
                      <X style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{
                  display: 'flex',
                  gap: 4,
                  padding: '0 24px',
                  borderBottom: '1px solid #F3F4F6',
                }}>
                  {[
                    { id: 'recommendation', label: 'Recommendation', icon: Briefcase },
                    { id: 'factors', label: 'Scoring Factors', icon: Clock },
                    { id: 'raw', label: 'Raw Response', icon: MessageSquare },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '14px 16px',
                          fontSize: 14,
                          fontWeight: 500,
                          color: isActive ? '#7C3AED' : '#6B7280',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                          marginBottom: -1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon style={{ width: 16, height: 16 }} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div style={{ padding: 24 }}>
                  {/* Intent Score Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    background: '#F9FAFB',
                    borderRadius: 12,
                    marginBottom: 24,
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Gauge style={{ width: 20, height: 20, color: '#D97706' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Confidence Score</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#7C3AED' }}>{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <div style={{
                        height: 8,
                        background: '#E5E7EB',
                        borderRadius: 100,
                        overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)',
                            borderRadius: 100,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {activeTab === 'recommendation' && (
                    <>
                      {/* Model Comparison Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Primary Model */}
                        <div style={{
                          background: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: 12,
                          padding: 20,
                          position: 'relative',
                        }}>
                          <span style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#10B981',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 6,
                          }}>
                            Primary
                          </span>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: getProviderBg(result.primaryModel.provider),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 16,
                          }}>
                            <Sparkles style={{ width: 24, height: 24, color: getProviderColor(result.primaryModel.provider) }} />
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>
                            {result.primaryModel.name}
                          </h3>
                          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                            {result.primaryModel.provider}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#9CA3AF' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Users style={{ width: 14, height: 14 }} />
                              Score: {Math.round(result.primaryModel.score * 100)}
                            </span>
                          </div>
                          <p style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                            {result.primaryModel.reasoning.summary}
                          </p>
                        </div>

                        {/* Backup Model */}
                        {result.backupModels[0] && (
                          <div style={{
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: 12,
                            padding: 20,
                            position: 'relative',
                          }}>
                            <span style={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#F59E0B',
                              background: 'rgba(245, 158, 11, 0.1)',
                              borderRadius: 6,
                            }}>
                              Backup
                            </span>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: getProviderBg(result.backupModels[0].provider),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 16,
                            }}>
                              <Building2 style={{ width: 24, height: 24, color: getProviderColor(result.backupModels[0].provider) }} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>
                              {result.backupModels[0].name}
                            </h3>
                            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                              {result.backupModels[0].provider}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#9CA3AF' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Users style={{ width: 14, height: 14 }} />
                                Score: {Math.round(result.backupModels[0].score * 100)}
                              </span>
                            </div>
                            <p style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                              {result.backupModels[0].reasoning.summary}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Analysis Summary */}
                      <div style={{
                        marginTop: 24,
                        padding: 20,
                        background: '#F9FAFB',
                        borderRadius: 12,
                      }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Prompt Analysis</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Intent</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{result.analysis.intent}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Domain</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{result.analysis.domain}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Complexity</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{result.analysis.complexity}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Timing</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{result.timing.totalMs.toFixed(1)}ms</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'factors' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {result.primaryModel.reasoning.factors.map((factor, idx) => {
                        const factorInfo = scoringFactors[idx] || { icon: Brain, color: '#7C3AED' };
                        const Icon = factorInfo.icon;
                        return (
                          <div
                            key={factor.name}
                            style={{
                              padding: 20,
                              background: '#F9FAFB',
                              borderRadius: 12,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${factorInfo.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Icon style={{ width: 18, height: 18, color: factorInfo.color }} />
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{factor.name}</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Weight: {Math.round(factor.weight * 100)}%</div>
                              </div>
                              <div style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: factorInfo.color }}>
                                {Math.round(factor.score * 100)}
                              </div>
                            </div>
                            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{factor.detail}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <div style={{
                      background: '#1F2937',
                      borderRadius: 12,
                      padding: 20,
                      overflow: 'auto',
                      maxHeight: 500,
                    }}>
                      <pre style={{
                        fontSize: 13,
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        color: '#E5E7EB',
                        margin: 0,
                        lineHeight: 1.6,
                      }}>
                        {JSON.stringify({ request: lastRequest, response: result }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* All Models Ranking */}
              <div style={{
                marginTop: 24,
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 20 }}>All Models Ranking</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[result.primaryModel, ...result.backupModels].map((model, idx) => (
                    <div
                      key={model.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '14px 16px',
                        background: idx === 0 ? 'rgba(124, 58, 237, 0.05)' : '#F9FAFB',
                        borderRadius: 10,
                        border: idx === 0 ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent',
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: idx === 0 ? 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: idx === 0 ? '#fff' : '#6B7280',
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: getProviderColor(model.provider),
                      }} />
                      <span style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 500,
                        color: idx === 0 ? '#7C3AED' : '#374151',
                      }}>
                        {model.name}
                      </span>
                      <span style={{ fontSize: 13, color: '#9CA3AF', minWidth: 70 }}>{model.provider}</span>
                      <div style={{ width: 100, height: 6, background: '#E5E7EB', borderRadius: 100, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${model.score * 100}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          style={{
                            height: '100%',
                            background: idx === 0 ? 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)' : '#9CA3AF',
                            borderRadius: 100,
                          }}
                        />
                      </div>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: idx === 0 ? '#7C3AED' : '#6B7280',
                        minWidth: 36,
                        textAlign: 'right',
                      }}>
                        {Math.round(model.score * 100)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!result && !isLoading && (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Sparkles style={{ width: 40, height: 40, color: '#7C3AED' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>
              Intelligent LLM Routing
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Enter a prompt above and ADE will analyze it to recommend the optimal AI model based on task complexity, cost efficiency, and performance characteristics.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              maxWidth: 600,
              margin: '0 auto',
            }}>
              {scoringFactors.slice(0, 3).map((factor) => {
                const Icon = factor.icon;
                return (
                  <div
                    key={factor.name}
                    style={{
                      padding: 20,
                      background: '#F9FAFB',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${factor.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Icon style={{ width: 20, height: 20, color: factor.color }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{factor.name}</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{factor.weight}% weight</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatus && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setShowStatus(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 640,
                maxHeight: '80vh',
                overflow: 'auto',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #F3F4F6',
                background: '#fff',
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1F2937' }}>System Status</h2>
                <button
                  onClick={() => setShowStatus(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: 10,
                    cursor: 'pointer',
                    color: '#6B7280',
                  }}
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div style={{ padding: 24 }}>
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
