'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Copy,
  Globe,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  RefreshCw,
  Settings2,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { AccessTier } from '@/types';
import { useAde } from '@/lib/dashboard/context';
import type {
  Constraints,
  DecisionHistoryEntry,
  HumanContext,
  RouteResponse,
} from '@/lib/dashboard/types';
import {
  COUNTRIES,
  ENERGY_LEVELS,
  EXAMPLE_PROMPTS,
  FRIENDLY_REASON_MAP,
  LONG_EXAMPLE_PROMPTS,
  MODALITIES,
  MOODS,
  RESPONSE_LENGTHS,
  RESPONSE_STYLES,
  SCORING_FACTORS,
  WEATHER_OPTIONS,
} from '@/lib/dashboard/constants';
import {
  formatScore,
  formatWeight,
  getProviderColor,
} from '@/lib/dashboard/helpers';

interface AttachedImage {
  file: File;
  preview: string;
}

type ResultTab = 'result' | 'factors' | 'json';

export default function RouterPage() {
  const { models, refetchModels, refetchHealth, fetchEndpointJson } = useAde();

  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [userTier, setUserTier] = useState<AccessTier>(AccessTier.Free);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('result');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);

  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);

  const [lastRequest, setLastRequest] = useState<object | null>(null);
  const [requestHistory, setRequestHistory] = useState<DecisionHistoryEntry[]>([]);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const modelsByTier = useMemo(
    () => ({
      [AccessTier.Free]: models.filter((m) => m.accessTier === AccessTier.Free).length,
      [AccessTier.Lite]: models.filter((m) => m.accessTier === AccessTier.Lite).length,
      [AccessTier.Pro]: models.filter((m) => m.accessTier === AccessTier.Pro).length,
    }),
    [models]
  );

  const updateHumanContext = useCallback((path: string[], value: unknown) => {
    setHumanContext((prev) => {
      const next: Record<string, unknown> = JSON.parse(JSON.stringify(prev));
      let current: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key === undefined) continue;
        if (!current[key]) current[key] = {};
        current = current[key] as Record<string, unknown>;
      }
      const lastKey = path[path.length - 1];
      if (lastKey === undefined) return next as HumanContext;
      if (value === '' || value === undefined || value === null) {
        delete current[lastKey];
      } else {
        current[lastKey] = value;
      }
      return next as HumanContext;
    });
  }, []);

  const autoDetectWeatherAndLocation = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      if (!geoRes.ok) return;
      const geoData = await geoRes.json();
      const country = geoData.country_name || null;
      setDetectedLocation(country);

      if (country) {
        setHumanContext((prev) => ({
          ...prev,
          environmentalContext: { ...prev.environmentalContext, location: country },
        }));
      }

      if (geoData.latitude && geoData.longitude) {
        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current_weather=true`
          );
          if (!weatherRes.ok) return;
          const weatherData = await weatherRes.json();
          const weatherCode = weatherData.current_weather?.weathercode;
          const temp = weatherData.current_weather?.temperature;

          let weather = 'sunny';
          if (weatherCode >= 0 && weatherCode <= 3) weather = temp > 30 ? 'hot' : temp < 5 ? 'cold' : 'sunny';
          else if (weatherCode >= 45 && weatherCode <= 48) weather = 'cloudy';
          else if (weatherCode >= 51 && weatherCode <= 67) weather = 'rainy';
          else if (weatherCode >= 71 && weatherCode <= 77) weather = 'snowy';
          else if (weatherCode >= 80 && weatherCode <= 99) weather = 'stormy';

          setHumanContext((prev) => ({
            ...prev,
            environmentalContext: { ...prev.environmentalContext, weather },
          }));
        } catch {
          // Silent fail — weather is best-effort.
        }
      }
    } catch {
      // Silent fail — geo is best-effort.
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    void autoDetectWeatherAndLocation();
  }, [autoDetectWeatherAndLocation]);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      setPrompt((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  }, [speechSupported]);

  const handleImageAttach = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setAttachedImage({ file, preview });
        if (modality === 'text') {
          setModality('text+image');
        }
      }
    },
    [modality]
  );

  const removeAttachedImage = useCallback(() => {
    if (attachedImage) {
      URL.revokeObjectURL(attachedImage.preview);
      setAttachedImage(null);
      if (modality === 'text+image') {
        setModality('text');
      }
    }
  }, [attachedImage, modality]);

  const handleRoute = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    setResult(null);
    setIsLoading(true);

    const requestBody: Record<string, unknown> = { prompt: prompt.trim(), modality, userTier };

    if (useHumanContext) {
      const cleaned: HumanContext = {};
      if (humanContext.emotionalState?.mood || humanContext.emotionalState?.energyLevel) {
        cleaned.emotionalState = {};
        if (humanContext.emotionalState.mood) cleaned.emotionalState.mood = humanContext.emotionalState.mood;
        if (humanContext.emotionalState.energyLevel) cleaned.emotionalState.energyLevel = humanContext.emotionalState.energyLevel;
      }
      if (
        humanContext.temporalContext?.localTime ||
        humanContext.temporalContext?.isWorkingHours !== undefined
      ) {
        cleaned.temporalContext = { ...humanContext.temporalContext };
      }
      if (
        humanContext.environmentalContext?.weather ||
        humanContext.environmentalContext?.location
      ) {
        cleaned.environmentalContext = { ...humanContext.environmentalContext };
      }
      if (
        humanContext.preferences?.preferredResponseStyle ||
        humanContext.preferences?.preferredResponseLength
      ) {
        cleaned.preferences = { ...humanContext.preferences };
      }
      if (Object.keys(cleaned).length > 0) {
        requestBody.humanContext = cleaned;
      }
    }

    if (useConstraints) {
      const cleaned: Constraints = {};
      if (constraints.maxCostPer1kTokens) cleaned.maxCostPer1kTokens = constraints.maxCostPer1kTokens;
      if (constraints.maxLatencyMs) cleaned.maxLatencyMs = constraints.maxLatencyMs;
      if (constraints.requireVision) cleaned.requireVision = true;
      if (constraints.requireAudio) cleaned.requireAudio = true;
      if (constraints.requireStreaming) cleaned.requireStreaming = true;
      if (constraints.excludedModels?.length) cleaned.excludedModels = constraints.excludedModels;
      if (Object.keys(cleaned).length > 0) {
        requestBody.constraints = cleaned;
      }
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
        throw new Error(errorData.error || `Routing failed: ${response.status}`);
      }
      const data: RouteResponse = await response.json();
      setResult(data);
      setRequestHistory((prev) => [
        {
          id: data.decisionId,
          prompt: prompt.trim().slice(0, 50) + (prompt.length > 50 ? '...' : ''),
          model: data.primaryModel.name,
          time: new Date().toLocaleTimeString(),
          confidence: data.confidence,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to route');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, modality, userTier, humanContext, constraints, useHumanContext, useConstraints]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(
      JSON.stringify({ request: lastRequest, response: result }, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [lastRequest, result]);

  return (
    <div className="router-grid" style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Route a Prompt
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Enter a prompt to analyze and find the optimal AI model. Configure modality, context, and constraints below.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: 20 }}>
            <div style={{ position: 'relative' }}>
              <textarea
                placeholder='Describe your task... e.g. "Write a Python function to parse JSON"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) handleRoute();
                }}
                style={{ width: '100%', minHeight: 100, padding: 0, paddingRight: 80, fontSize: 15, color: '#111', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.7, fontFamily: 'inherit' }}
              />
              <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: 4 }}>
                {speechSupported && (
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    title={isListening ? 'Listening...' : 'Voice input'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, background: isListening ? '#FEE2E2' : '#F5F5F5',
                      border: isListening ? '1px solid #FCA5A5' : '1px solid #E5E5E5',
                      borderRadius: 6, cursor: isListening ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isListening ? (
                      <MicOff style={{ width: 16, height: 16, color: '#DC2626' }} />
                    ) : (
                      <Mic style={{ width: 16, height: 16, color: '#666' }} />
                    )}
                  </button>
                )}
                <label
                  title="Attach image (max 1)"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, background: attachedImage ? '#DBEAFE' : '#F5F5F5',
                    border: attachedImage ? '1px solid #93C5FD' : '1px solid #E5E5E5',
                    borderRadius: 6, cursor: 'pointer',
                  }}
                >
                  <Paperclip style={{ width: 16, height: 16, color: attachedImage ? '#2563EB' : '#666' }} />
                  <input type="file" accept="image/*" onChange={handleImageAttach} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {attachedImage && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: '#F5F5F5', borderRadius: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachedImage.preview} alt="Attached" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#000' }}>{attachedImage.file.name}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{(attachedImage.file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  onClick={removeAttachedImage}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 4, cursor: 'pointer' }}
                >
                  <X style={{ width: 12, height: 12, color: '#666' }} />
                </button>
              </div>
            )}

            {isListening && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6 }}>
                <span style={{ width: 8, height: 8, background: '#DC2626', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: 12, color: '#DC2626' }}>Listening... Speak now</span>
              </div>
            )}
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick examples</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setPrompt(ex.prompt)}
                  style={{
                    padding: '5px 12px', fontSize: 12, color: '#4B5563', background: '#F3F4F6',
                    border: '1px solid transparent', borderRadius: 6, cursor: 'pointer',
                    transition: 'all 0.15s', fontWeight: 450,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detailed prompts (stress test)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LONG_EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setPrompt(ex.prompt)}
                  style={{
                    padding: '5px 12px', fontSize: 12, color: '#5B21B6', background: '#EDE9FE',
                    border: '1px solid transparent', borderRadius: 6, cursor: 'pointer',
                    transition: 'all 0.15s', fontWeight: 450,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#DDD6FE'; e.currentTarget.style.borderColor = '#C4B5FD'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#EDE9FE'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
                {MODALITIES.map((m) => {
                  const Icon = m.icon;
                  const active = modality === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setModality(m.id)}
                      title={`${m.label}: ${m.desc}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: active ? '5px 10px' : '5px 8px',
                        background: active ? '#fff' : 'transparent', border: 'none', borderRadius: 6,
                        cursor: 'pointer', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontSize: 12, color: active ? '#111' : '#9CA3AF', fontWeight: active ? 500 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Icon style={{ width: 14, height: 14 }} />
                      {active && <span>{m.label}</span>}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
                {([
                  { tier: AccessTier.Free, label: 'Free', mode: 'Basic' },
                  { tier: AccessTier.Lite, label: 'Lite', mode: 'Full (cost-optimised)' },
                  { tier: AccessTier.Pro, label: 'Pro', mode: 'Full (quality-optimised)' },
                ] as const).map(({ tier, label, mode }) => {
                  const active = userTier === tier;
                  const isPro = tier === AccessTier.Pro;
                  const count = modelsByTier[tier];
                  return (
                    <button
                      key={tier}
                      onClick={() => setUserTier(tier)}
                      title={`${label} tier: ${mode} · ${count} models`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                        background: active ? (isPro ? '#111' : '#fff') : 'transparent',
                        border: 'none', borderRadius: 6,
                        cursor: 'pointer', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        fontSize: 12, color: active ? (isPro ? '#fff' : '#111') : '#9CA3AF',
                        fontWeight: active ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isPro && <span style={{ fontSize: 10 }}>⚡</span>}
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowOptions(!showOptions)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12,
                  color: showOptions ? '#4F46E5' : '#6B7280',
                  background: showOptions ? '#EEF2FF' : 'transparent',
                  border: showOptions ? '1px solid #C7D2FE' : '1px solid #E5E7EB',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                <Settings2 style={{ width: 13, height: 13 }} />
                Routing Options
                <ChevronDown style={{ width: 12, height: 12, transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>
            <button
              onClick={handleRoute}
              disabled={isLoading || !prompt.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', fontSize: 13, fontWeight: 600,
                color: '#fff',
                background: isLoading || !prompt.trim() ? '#D1D5DB' : 'linear-gradient(135deg, #111 0%, #374151 100%)',
                border: 'none', borderRadius: 8,
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                boxShadow: isLoading || !prompt.trim() ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
              {isLoading ? 'Analyzing...' : 'Route Prompt'}
            </button>
          </div>

          <AnimatePresence>
            {showOptions && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ padding: 20, borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                      <input type="checkbox" checked={useHumanContext} onChange={(e) => setUseHumanContext(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#4F46E5' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Human Context</span>
                      <span style={{ fontSize: 11, color: '#6B7280', background: '#EEF2FF', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>+15% scoring weight</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, opacity: useHumanContext ? 1 : 0.5 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Mood</label>
                        <select
                          value={humanContext.emotionalState?.mood || ''}
                          onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select mood...</option>
                          {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Energy Level</label>
                        <select
                          value={humanContext.emotionalState?.energyLevel || ''}
                          onChange={(e) => updateHumanContext(['emotionalState', 'energyLevel'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select energy...</option>
                          {ENERGY_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Local Time</label>
                        <input
                          type="time"
                          value={humanContext.temporalContext?.localTime || ''}
                          onChange={(e) => updateHumanContext(['temporalContext', 'localTime'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Working Hours?</label>
                        <select
                          value={humanContext.temporalContext?.isWorkingHours === undefined ? '' : String(humanContext.temporalContext.isWorkingHours)}
                          onChange={(e) => updateHumanContext(['temporalContext', 'isWorkingHours'], e.target.value === '' ? undefined : e.target.value === 'true')}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Not specified</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>
                          <Cloud style={{ width: 12, height: 12 }} />
                          Weather
                          {weatherLoading && <Loader2 style={{ width: 10, height: 10, animation: 'spin 1s linear infinite' }} />}
                          {humanContext.environmentalContext?.weather && !weatherLoading && (
                            <span style={{ fontSize: 9, color: '#059669', background: '#D1FAE5', padding: '1px 4px', borderRadius: 3 }}>Auto</span>
                          )}
                        </label>
                        <select
                          value={humanContext.environmentalContext?.weather || ''}
                          onChange={(e) => updateHumanContext(['environmentalContext', 'weather'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select weather...</option>
                          {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>
                          <MapPin style={{ width: 12, height: 12 }} />
                          Country
                          {detectedLocation && (
                            <span style={{ fontSize: 9, color: '#059669', background: '#D1FAE5', padding: '1px 4px', borderRadius: 3 }}>Auto</span>
                          )}
                        </label>
                        <select
                          value={humanContext.environmentalContext?.location || ''}
                          onChange={(e) => updateHumanContext(['environmentalContext', 'location'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select country...</option>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Response Style</label>
                        <select
                          value={humanContext.preferences?.preferredResponseStyle || ''}
                          onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select style...</option>
                          {RESPONSE_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Response Length</label>
                        <select
                          value={humanContext.preferences?.preferredResponseLength || ''}
                          onChange={(e) => updateHumanContext(['preferences', 'preferredResponseLength'], e.target.value)}
                          disabled={!useHumanContext}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        >
                          <option value="">Select length...</option>
                          {RESPONSE_LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                      <input type="checkbox" checked={useConstraints} onChange={(e) => setUseConstraints(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#4F46E5' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Constraints</span>
                      <span style={{ fontSize: 11, color: '#6B7280', background: '#FEF3C7', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>Filter models</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, opacity: useConstraints ? 1 : 0.5 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Max Cost/1K Tokens ($)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="e.g., 0.01"
                          value={constraints.maxCostPer1kTokens || ''}
                          onChange={(e) => setConstraints((prev) => ({ ...prev, maxCostPer1kTokens: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          disabled={!useConstraints}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Max Latency (ms)</label>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          placeholder="e.g., 1000"
                          value={constraints.maxLatencyMs || ''}
                          onChange={(e) => setConstraints((prev) => ({ ...prev, maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined }))}
                          disabled={!useConstraints}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                          <input type="checkbox" checked={constraints.requireVision || false} onChange={(e) => setConstraints((prev) => ({ ...prev, requireVision: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
                          Require Vision
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                          <input type="checkbox" checked={constraints.requireAudio || false} onChange={(e) => setConstraints((prev) => ({ ...prev, requireAudio: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
                          Require Audio
                        </label>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                          <input type="checkbox" checked={constraints.requireStreaming || false} onChange={(e) => setConstraints((prev) => ({ ...prev, requireStreaming: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
                          Require Streaming
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#DC2626' }}>
            <AlertCircle style={{ width: 14, height: 14 }} />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: getProviderColor(result.primaryModel.provider) }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>{result.primaryModel.name}</span>
                    <span style={{ padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#059669', background: '#ECFDF5', borderRadius: 6, border: '1px solid #D1FAE5' }}>Recommended</span>
                    <span style={{ padding: '3px 8px', fontSize: 11, fontWeight: 500, color: '#6B7280', background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={handleRoute} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: '1px solid #E5E5E5', borderRadius: 6, cursor: 'pointer' }} title="Run again">
                      <RefreshCw style={{ width: 14, height: 14, color: '#666' }} />
                    </button>
                    <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: '1px solid #E5E5E5', borderRadius: 6, cursor: 'pointer' }} title="Copy JSON">
                      {copied ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Copy style={{ width: 14, height: 14, color: '#666' }} />}
                    </button>
                    <button onClick={() => setResult(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                      <X style={{ width: 14, height: 14, color: '#999' }} />
                    </button>
                  </div>
                </div>

                {result.upgradeHint && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)',
                    borderBottom: '1px solid #FED7AA',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>⚡</span>
                      <span style={{ fontSize: 12, color: '#92400E' }}>
                        <strong>{result.upgradeHint.recommendedModel.name}</strong> scores {Math.round(result.upgradeHint.scoreDifference * 100)}% higher — {result.upgradeHint.reason}
                      </span>
                    </div>
                    <button
                      onClick={() => setUserTier(AccessTier.Pro)}
                      style={{
                        padding: '4px 12px', fontSize: 11, fontWeight: 600,
                        color: '#fff', background: '#F59E0B', border: 'none',
                        borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      Try Pro
                    </button>
                  </div>
                )}

                {result.webSearchRequired && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px', background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                    borderBottom: '1px solid #BBF7D0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Globe style={{ width: 14, height: 14, color: '#059669' }} />
                      <span style={{ fontSize: 12, color: '#065F46' }}>
                        <strong>Web Search Recommended</strong> — This prompt needs real-time information
                      </span>
                    </div>
                    {result.primaryModel.supportsWebSearch ? (
                      <span style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 600,
                        color: '#059669', background: '#D1FAE5', border: '1px solid #A7F3D0',
                        borderRadius: 6, whiteSpace: 'nowrap',
                      }}>
                        Model Supports Web Search
                      </span>
                    ) : (
                      <span style={{
                        padding: '3px 10px', fontSize: 11, fontWeight: 600,
                        color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A',
                        borderRadius: 6, whiteSpace: 'nowrap',
                      }}>
                        Model Lacks Web Search
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', borderBottom: '1px solid #E5E5E5' }}>
                  {([
                    { id: 'result', label: 'Result' },
                    { id: 'factors', label: 'Factors' },
                    { id: 'json', label: 'JSON' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{ padding: '10px 16px', fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400, color: activeTab === tab.id ? '#000' : '#666', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent', marginBottom: -1, cursor: 'pointer' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 16 }}>
                  {activeTab === 'result' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                        {[
                          { label: 'Intent', value: result.analysis.intent },
                          { label: 'Domain', value: result.analysis.domain },
                          { label: 'Complexity', value: result.analysis.complexity },
                          { label: 'Total Time', value: `${result.timing.totalMs.toFixed(1)}ms` },
                          { label: 'Human Context', value: result.analysis.humanContextUsed ? 'Yes' : 'No' },
                          { label: 'Web Search', value: result.webSearchRequired ? 'Required' : 'Not Needed', isWebSearch: true },
                        ].map((stat) => (
                          <div key={stat.label} style={{
                            padding: 10,
                            background: ('isWebSearch' in stat && stat.isWebSearch && result.webSearchRequired) ? '#ECFDF5' : '#FAFAFA',
                            borderRadius: 6,
                            border: ('isWebSearch' in stat && stat.isWebSearch && result.webSearchRequired) ? '1px solid #BBF7D0' : '1px solid transparent',
                          }}>
                            <div style={{ fontSize: 10, color: '#666', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</div>
                            <div style={{
                              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                              color: ('isWebSearch' in stat && stat.isWebSearch && result.webSearchRequired) ? '#059669' : '#000',
                            }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 8 }}>Model Ranking (click to expand)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[result.primaryModel, ...result.backupModels].map((model, idx) => {
                            const isExpanded = expandedModel === model.id;
                            return (
                              <div key={model.id}>
                                <button
                                  onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: idx === 0 ? '#F5F5F5' : 'transparent', border: '1px solid #E5E5E5', borderRadius: isExpanded ? '6px 6px 0 0' : 6, cursor: 'pointer', textAlign: 'left' }}
                                >
                                  <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: idx === 0 ? '#fff' : '#666', background: idx === 0 ? '#000' : '#E5E5E5', borderRadius: 4 }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: getProviderColor(model.provider) }} />
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {model.name}
                                    {model.supportsWebSearch && (
                                      <Globe style={{ width: 12, height: 12, color: '#059669', flexShrink: 0 }} />
                                    )}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#666' }}>{model.provider}</span>
                                  <div style={{ width: 60, height: 4, background: '#E5E5E5', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ width: `${(model.score || 0) * 100}%`, height: '100%', background: idx === 0 ? '#000' : '#999', borderRadius: 2 }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#000', width: 28, textAlign: 'right' }}>{formatScore(model.score)}</span>
                                  <ChevronDown style={{ width: 14, height: 14, color: '#666', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                </button>
                                <div style={{ padding: '6px 12px 6px 44px', fontSize: 12, color: '#666', lineHeight: 1.5, fontStyle: 'italic', borderLeft: isExpanded ? 'none' : '1px solid #E5E5E5', borderRight: isExpanded ? 'none' : '1px solid #E5E5E5', borderBottom: isExpanded ? 'none' : '1px solid #E5E5E5', borderRadius: isExpanded ? 0 : '0 0 6px 6px', marginTop: -1 }}>
                                  {model.reasoning.summary}
                                </div>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      style={{ overflow: 'hidden' }}
                                    >
                                      <div style={{ padding: 12, background: '#FAFAFA', border: '1px solid #E5E5E5', borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Why this model was chosen:</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                          {model.reasoning.factors
                                            .slice()
                                            .sort((a, b) => (b.weight ?? 0) * (b.score ?? 0) - (a.weight ?? 0) * (a.score ?? 0))
                                            .map((factor, fIdx) => {
                                              const friendlyDesc = FRIENDLY_REASON_MAP[factor.name] || factor.name;
                                              const scoreNum = typeof factor.score === 'number' ? factor.score : 0;
                                              const barColor = scoreNum >= 0.7 ? '#059669' : scoreNum >= 0.4 ? '#D97706' : '#DC2626';
                                              return (
                                                <div key={factor.name} style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                      <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', background: barColor, borderRadius: 4 }}>
                                                        {fIdx + 1}
                                                      </span>
                                                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{factor.name}</span>
                                                    </div>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{formatScore(factor.score)}</span>
                                                  </div>
                                                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, lineHeight: 1.5 }}>{friendlyDesc}</div>
                                                  <div style={{ width: '100%', height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ width: `${scoreNum * 100}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                                                  </div>
                                                  {factor.detail && (
                                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, lineHeight: 1.4 }}>{factor.detail}</div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {result.analysis.keywords.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6 }}>Detected Keywords</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {result.analysis.keywords.map((kw, i) => (
                              <span key={i} style={{ padding: '2px 8px', fontSize: 11, color: '#666', background: '#F5F5F5', borderRadius: 4 }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'factors' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {result.primaryModel.reasoning.factors.map((factor, idx) => {
                        const factorInfo = SCORING_FACTORS[idx] ?? SCORING_FACTORS[0];
                        const Icon = factorInfo?.icon ?? Brain;
                        return (
                          <div key={factor.name} style={{ padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <Icon style={{ width: 14, height: 14, color: factorInfo?.color ?? '#8B5CF6' }} />
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>{factor.name}</span>
                              <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#000' }}>{formatScore(factor.score)}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>{factor.detail || 'No details available'}</div>
                            <div style={{ fontSize: 11, color: '#999' }}>Weight: {formatWeight(factor.weight)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === 'json' && (
                    <div style={{ background: '#18181B', borderRadius: 6, padding: 12, overflow: 'auto', maxHeight: 400 }}>
                      <pre style={{ margin: 0, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', lineHeight: 1.5 }}>
                        {JSON.stringify({ request: lastRequest, response: result }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !isLoading && (
          <div style={{ background: 'linear-gradient(135deg, #fff 0%, #F9FAFB 100%)', border: '1px solid #E5E7EB', borderRadius: 12, padding: '56px 32px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.12)',
            }}>
              <Sparkles style={{ width: 24, height: 24, color: '#6366F1' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Intelligent LLM Routing</h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              Enter a prompt above and ADE will analyze its intent, domain, and complexity to recommend the optimal AI model from 10+ providers.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              {[
                { label: 'Analyze', desc: 'Intent & domain detection', icon: Brain },
                { label: 'Score', desc: '7-factor model scoring', icon: TrendingUp },
                { label: 'Select', desc: 'Optimal model selection', icon: Zap },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.label} style={{ textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, background: '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <StepIcon style={{ width: 16, height: 16, color: '#6B7280' }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine Stats</div>
            <button
              onClick={() => {
                void refetchModels();
                void refetchHealth();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', fontSize: 10, color: '#6B7280', background: '#F3F4F6', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              title="Refresh stats"
            >
              <RefreshCw style={{ width: 10, height: 10 }} />
              Refresh
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Models', value: models.length > 0 ? String(models.length) : '...', color: '#6366F1' },
              { label: 'Latency', value: result ? `${result.timing.totalMs.toFixed(1)}ms` : '<50ms', color: '#10B981' },
              { label: 'Factors', value: result ? String(result.primaryModel.reasoning.factors.length) : '7', color: '#F59E0B' },
              { label: 'Providers', value: models.length > 0 ? String(new Set(models.map((m) => m.provider)).size) : '...', color: '#3B82F6' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {requestHistory.length > 0 && (
            <div style={{ marginTop: 12, padding: '8px 10px', background: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 500 }}>
                {requestHistory.length} request{requestHistory.length !== 1 ? 's' : ''} this session
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scoring Weights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SCORING_FACTORS.map((factor) => {
              const Icon = factor.icon;
              return (
                <div key={factor.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: `${factor.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 13, height: 13, color: factor.color }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: '#374151', fontWeight: 450 }}>{factor.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${factor.weight * 2.5}%`, height: '100%', background: factor.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, width: 28, textAlign: 'right' }}>{factor.weight}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', background: '#FEF3C7', borderRadius: 8, fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
            With <strong>Human Context</strong> enabled, weights shift to include a 15% humanContextFit factor.
          </div>
        </div>

        {requestHistory.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Requests</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requestHistory.slice(0, 5).map((req) => (
                <div key={req.id} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{req.time}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>{Math.round(req.confidence * 100)}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 450 }}>{req.prompt}</div>
                  <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 500 }}>{req.model}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #18181B, #27272A)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Endpoint</div>
          <code style={{ display: 'block', fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', background: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            POST /api/v1/route
          </code>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => void fetchEndpointJson('/api/v1/health', 'Health Check')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              Health Check <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
            <button onClick={() => void fetchEndpointJson('/api/v1/models', 'List Models')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A1A1AA', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              List Models <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
