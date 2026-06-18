'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, FlaskConical, RefreshCw, X } from 'lucide-react';
import {
  EXAMPLE_PROMPTS,
  LONG_EXAMPLE_PROMPTS,
  MODALITIES,
} from '@/lib/dashboard/constants';
import type {
  AnalyzeHistoryEntry,
  AnalyzeResult,
} from '@/lib/dashboard/types';

export default function AnalyzePage() {
  const [analyzePrompt, setAnalyzePrompt] = useState('');
  const [analyzeModality, setAnalyzeModality] = useState('text');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeHistory, setAnalyzeHistory] = useState<AnalyzeHistoryEntry[]>([]);

  const handleAnalyze = useCallback(async () => {
    if (!analyzePrompt.trim()) return;
    setAnalyzeError(null);
    setAnalyzeResult(null);
    setAnalyzeLoading(true);
    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analyzePrompt.trim(), modality: analyzeModality }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }
      const data: AnalyzeResult = await response.json();
      setAnalyzeResult(data);
      setAnalyzeHistory((prev) => [
        {
          prompt: analyzePrompt.trim().slice(0, 60) + (analyzePrompt.length > 60 ? '...' : ''),
          intent: data.analysis.intent,
          domain: data.analysis.domain,
          complexity: data.analysis.complexity,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setAnalyzeLoading(false);
    }
  }, [analyzePrompt, analyzeModality]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Analyze a Prompt
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Test the analysis endpoint to see how ADE breaks down your prompt into intent, domain,
            complexity, tone, and keywords — without selecting a model.
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: 20 }}>
            <textarea
              placeholder='Enter a prompt to analyze... e.g. "Help me debug this React component that crashes on mount"'
              value={analyzePrompt}
              onChange={(e) => setAnalyzePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleAnalyze();
              }}
              style={{ width: '100%', minHeight: 100, padding: 0, fontSize: 15, color: '#111', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.7, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Try an example
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setAnalyzePrompt(ex.prompt)}
                  style={{ padding: '5px 12px', fontSize: 12, color: '#4B5563', background: '#F3F4F6', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontWeight: 450 }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                >
                  {ex.label}
                </button>
              ))}
              {LONG_EXAMPLE_PROMPTS.slice(0, 3).map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setAnalyzePrompt(ex.prompt)}
                  style={{ padding: '5px 12px', fontSize: 12, color: '#5B21B6', background: '#EDE9FE', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', fontWeight: 450 }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#DDD6FE'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#EDE9FE'; }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
              {MODALITIES.map((m) => {
                const Icon = m.icon;
                const active = analyzeModality === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAnalyzeModality(m.id)}
                    title={`${m.label}: ${m.desc}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: active ? '5px 10px' : '5px 8px',
                      background: active ? '#fff' : 'transparent', border: 'none', borderRadius: 6,
                      cursor: 'pointer', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      fontSize: 12, color: active ? '#111' : '#9CA3AF', fontWeight: active ? 500 : 400,
                    }}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                    {active && <span>{m.label}</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzeLoading || !analyzePrompt.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', fontSize: 13, fontWeight: 600,
                color: '#fff',
                background: analyzeLoading || !analyzePrompt.trim() ? '#D1D5DB' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                border: 'none', borderRadius: 8,
                cursor: analyzeLoading || !analyzePrompt.trim() ? 'not-allowed' : 'pointer',
                boxShadow: analyzeLoading || !analyzePrompt.trim() ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
              }}
            >
              {analyzeLoading ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <FlaskConical style={{ width: 14, height: 14 }} />}
              {analyzeLoading ? 'Analyzing...' : 'Analyze Prompt'}
            </button>
          </div>
        </div>

        {analyzeError && (
          <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle style={{ width: 16, height: 16, color: '#DC2626' }} />
            <span style={{ fontSize: 13, color: '#DC2626' }}>{analyzeError}</span>
          </div>
        )}

        <AnimatePresence>
          {analyzeResult && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FlaskConical style={{ width: 16, height: 16, color: '#7C3AED' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>Analysis Result</span>
                    <span style={{ padding: '3px 8px', fontSize: 11, fontWeight: 500, color: '#6B7280', background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                      {analyzeResult.timing.analysisMs.toFixed(1)}ms
                    </span>
                  </div>
                  <button onClick={() => setAnalyzeResult(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <X style={{ width: 14, height: 14, color: '#999' }} />
                  </button>
                </div>

                <div style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: 'Intent', value: analyzeResult.analysis.intent, color: '#7C3AED', bg: '#F5F3FF', desc: 'What the user is trying to do' },
                      { label: 'Domain', value: analyzeResult.analysis.domain, color: '#2563EB', bg: '#EFF6FF', desc: 'The subject area' },
                      { label: 'Complexity', value: analyzeResult.analysis.complexity, color: '#059669', bg: '#ECFDF5', desc: 'How demanding the task is' },
                      { label: 'Tone', value: analyzeResult.analysis.tone, color: '#D97706', bg: '#FFFBEB', desc: 'Communication style detected' },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: 14, background: item.bg, borderRadius: 10, border: `1px solid ${item.color}20` }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#111', textTransform: 'capitalize', marginBottom: 2 }}>{item.value}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Modality</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{analyzeResult.analysis.modality}</div>
                    </div>
                    <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Human Context</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{analyzeResult.analysis.humanContextUsed ? 'Used' : 'Not used'}</div>
                    </div>
                  </div>

                  {analyzeResult.analysis.keywords.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Detected Keywords</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {analyzeResult.analysis.keywords.map((kw, i) => (
                          <span key={i} style={{ padding: '4px 12px', fontSize: 12, color: '#5B21B6', background: '#EDE9FE', borderRadius: 6, fontWeight: 500 }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Raw Response</div>
                    <div style={{ background: '#18181B', borderRadius: 8, padding: 14, overflow: 'auto', maxHeight: 300 }}>
                      <pre style={{ margin: 0, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', lineHeight: 1.6 }}>
                        {JSON.stringify(analyzeResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!analyzeResult && !analyzeLoading && (
          <div style={{ background: 'linear-gradient(135deg, #fff 0%, #F5F3FF 100%)', border: '1px solid #E5E7EB', borderRadius: 12, padding: '56px 32px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)',
            }}>
              <FlaskConical style={{ width: 24, height: 24, color: '#7C3AED' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Prompt Analysis</h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              Enter a prompt to see how ADE detects its intent, domain, complexity, and tone. This is the first step of the routing pipeline — analysis without model selection.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              {[
                { label: 'Intent', desc: 'What you want to do' },
                { label: 'Domain', desc: 'Subject area detection' },
                { label: 'Complexity', desc: 'Task difficulty level' },
                { label: 'Keywords', desc: 'Key terms extracted' },
              ].map((step) => (
                <div key={step.label} style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, background: '#F5F3FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>{step.label[0]}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How Analysis Works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', title: 'Keyword Extraction', desc: 'Important terms and phrases are identified from your prompt.' },
              { step: '2', title: 'Intent Detection', desc: 'Determines what you want: coding, research, creative writing, etc.' },
              { step: '3', title: 'Domain Classification', desc: 'Identifies the subject area: technology, science, business, etc.' },
              { step: '4', title: 'Complexity Assessment', desc: 'Rates the task as quick, standard, or demanding.' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', borderRadius: 6, flexShrink: 0 }}>{item.step}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {analyzeHistory.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Analyses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analyzeHistory.slice(0, 5).map((item, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{item.time}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', textTransform: 'capitalize' }}>{item.intent}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 450 }}>{item.prompt}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ padding: '2px 6px', fontSize: 10, color: '#2563EB', background: '#EFF6FF', borderRadius: 4, textTransform: 'capitalize' }}>{item.domain}</span>
                    <span style={{ padding: '2px 6px', fontSize: 10, color: '#059669', background: '#ECFDF5', borderRadius: 4, textTransform: 'capitalize' }}>{item.complexity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #18181B, #27272A)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Endpoint</div>
          <code style={{ display: 'block', fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', background: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            POST /api/v1/analyze
          </code>
          <div style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5 }}>
            Analyzes a prompt without model selection. Returns intent, domain, complexity, tone, and keywords.
          </div>
        </div>
      </div>
    </div>
  );
}
