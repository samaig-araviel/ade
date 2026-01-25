'use client';

import { useState, useCallback, useEffect } from 'react';
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
  ChevronDown,
  MessageSquare,
  Image,
  Mic,
  Layers,
  Settings2,
  Zap,
  DollarSign,
  Brain,
  TrendingUp,
  RefreshCw,
  Eye,
  AudioLines,
  Heart,
  CheckCircle,
  XCircle,
  Box,
  BookOpen,
} from 'lucide-react';

// ============ TYPES ============
interface RouteResponse {
  decisionId: string;
  primaryModel: ModelResult;
  backupModels: ModelResult[];
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

interface ModelResult {
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
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricing: { inputPer1k: number; outputPer1k: number };
  capabilities: {
    maxInputTokens: number;
    maxOutputTokens: number;
    supportsVision: boolean;
    supportsAudio: boolean;
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
  };
  performance: { avgLatencyMs: number; reliabilityPercent: number };
}

interface HumanContext {
  emotionalState?: { mood?: string; energyLevel?: string };
  temporalContext?: { localTime?: string; timezone?: string; dayOfWeek?: string; isWorkingHours?: boolean };
  environmentalContext?: { weather?: string; location?: string };
  preferences?: { preferredResponseStyle?: string; preferredResponseLength?: string; preferredModels?: string[]; avoidModels?: string[] };
  historyHints?: { recentTopics?: string[]; frequentIntents?: string[] };
}

interface Constraints {
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  allowedModels?: string[];
  excludedModels?: string[];
  requireStreaming?: boolean;
  requireVision?: boolean;
  requireAudio?: boolean;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: { kv: string };
}

// ============ CONSTANTS ============
const MODALITIES = [
  { id: 'text', label: 'Text', icon: MessageSquare, desc: 'Text-only prompts' },
  { id: 'image', label: 'Vision', icon: Image, desc: 'Image analysis' },
  { id: 'voice', label: 'Voice', icon: Mic, desc: 'Audio processing' },
  { id: 'text+image', label: 'Text+Vision', icon: Eye, desc: 'Combined text and image' },
  { id: 'text+voice', label: 'Text+Voice', icon: AudioLines, desc: 'Combined text and audio' },
];

const MOODS = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
const ENERGY_LEVELS = ['low', 'moderate', 'high'];
const RESPONSE_STYLES = ['concise', 'detailed', 'conversational', 'formal', 'casual'];
const RESPONSE_LENGTHS = ['short', 'medium', 'long'];
const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'hot', 'cold'];
const LOCATION_OPTIONS = ['home', 'office', 'commute', 'travel', 'other'];

const EXAMPLE_PROMPTS = [
  { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements', category: 'coding' },
  { label: 'Data Analysis', prompt: 'Analyze quarterly sales data and identify trends, anomalies, and actionable insights', category: 'analysis' },
  { label: 'Creative Writing', prompt: 'Write a short story about an AI that discovers the meaning of friendship', category: 'creative' },
  { label: 'Simple Question', prompt: 'What is the capital of France?', category: 'factual' },
  { label: 'Complex Research', prompt: 'Explain the implications of quantum computing on current cryptographic systems and propose mitigation strategies', category: 'analysis' },
  { label: 'Translation', prompt: 'Translate this technical documentation from English to Spanish while maintaining accuracy', category: 'translation' },
];

const SCORING_FACTORS = [
  { key: 'taskFitness', label: 'Task Fitness', weight: 40, icon: Brain, color: '#8B5CF6', desc: 'How well the model handles the detected intent, domain, and complexity' },
  { key: 'modalityFitness', label: 'Modality Fit', weight: 15, icon: Layers, color: '#6366F1', desc: 'Capability match for vision/audio requirements' },
  { key: 'costEfficiency', label: 'Cost Efficiency', weight: 15, icon: DollarSign, color: '#10B981', desc: 'Normalized cost comparison (cheaper = higher score)' },
  { key: 'speed', label: 'Speed', weight: 10, icon: Zap, color: '#F59E0B', desc: 'Latency comparison (faster = higher score)' },
  { key: 'userPreference', label: 'User Preference', weight: 10, icon: Heart, color: '#EC4899', desc: 'Boost/penalty based on preferred/avoided models' },
  { key: 'conversationCoherence', label: 'Coherence', weight: 10, icon: TrendingUp, color: '#3B82F6', desc: 'Consistency with previous model in conversation' },
];

// ============ DOCS COMPONENT ============
function DocsView() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }: { code: string; language?: string; id: string }) => (
    <div style={{ position: 'relative', background: '#0D0D0D', borderRadius: 8, overflow: 'hidden', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#1A1A1A', borderBottom: '1px solid #2D2D2D' }}>
        <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, color: '#888', background: 'transparent', border: '1px solid #333', borderRadius: 4, cursor: 'pointer' }}
        >
          {copiedCode === id ? <Check style={{ width: 12, height: 12, color: '#22C55E' }} /> : <Copy style={{ width: 12, height: 12 }} />}
          {copiedCode === id ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: 16, fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace', color: '#E5E5E5', lineHeight: 1.6, overflowX: 'auto' }}>
        {code}
      </pre>
    </div>
  );

  const ParamTable = ({ params }: { params: Array<{ name: string; type: string; required: boolean; description: string }> }) => (
    <div style={{ marginTop: 16, border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Parameter</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Type</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, idx) => (
            <tr key={param.name} style={{ background: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5' }}>
                <code style={{ fontSize: 12, color: '#1F2937', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{param.name}</code>
                {param.required && <span style={{ marginLeft: 6, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>REQUIRED</span>}
              </td>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5', color: '#6B7280' }}>{param.type}</td>
              <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5', color: '#4B5563' }}>{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'route', label: 'Route Prompt' },
    { id: 'models', label: 'List Models' },
    { id: 'model-detail', label: 'Get Model' },
    { id: 'analyze', label: 'Analyze Prompt' },
    { id: 'feedback', label: 'Submit Feedback' },
    { id: 'health', label: 'Health Check' },
    { id: 'errors', label: 'Error Handling' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, maxWidth: 1100 }}>
      {/* Sidebar Navigation */}
      <nav style={{ position: 'sticky', top: 72, alignSelf: 'start' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>API Reference</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                color: activeSection === section.id ? '#000' : '#6B7280',
                background: activeSection === section.id ? '#F3F4F6' : 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeSection === section.id ? 500 : 400,
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ minWidth: 0 }}>
        {/* Introduction */}
        {activeSection === 'introduction' && (
          <section>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>ADE API Reference</h1>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.7 }}>
              The Araviel Decision Engine (ADE) API enables intelligent LLM routing by analyzing prompts and selecting the optimal model based on task requirements, cost, and performance.
            </p>

            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Base URL</h3>
              <code style={{ display: 'block', fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#059669', background: '#ECFDF5', padding: '12px 16px', borderRadius: 6 }}>
                https://your-domain.com/api/v1
              </code>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>How It Works</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {[
                  { step: '1', title: 'Analyze', desc: 'Engine detects intent, domain, complexity, and tone from your prompt' },
                  { step: '2', title: 'Score', desc: 'Each model is scored across 6 weighted factors (task fit, cost, speed, etc.)' },
                  { step: '3', title: 'Select', desc: 'Models are ranked and the optimal choice is returned with backups' },
                  { step: '4', title: 'Respond', desc: 'Get detailed reasoning, confidence scores, and timing metrics' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 28, height: 28, background: '#000', color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Authentication */}
        {activeSection === 'authentication' && (
          <section>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Authentication</h1>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.7 }}>
              ADE uses API keys to authenticate requests. Include your API key in the Authorization header.
            </p>

            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertCircle style={{ width: 18, height: 18, color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Keep your API key secure</div>
                  <div style={{ fontSize: 13, color: '#A16207', lineHeight: 1.5 }}>Never expose your API key in client-side code or public repositories. Use environment variables.</div>
                </div>
              </div>
            </div>

            <CodeBlock
              id="auth-example"
              language="bash"
              code={`curl https://your-domain.com/api/v1/route \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hello, world!"}'`}
            />

            <div style={{ marginTop: 24, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Request Headers</h3>
              <ParamTable
                params={[
                  { name: 'Authorization', type: 'string', required: true, description: 'Bearer token with your API key' },
                  { name: 'Content-Type', type: 'string', required: true, description: 'Must be application/json for POST requests' },
                ]}
              />
            </div>
          </section>
        )}

        {/* Route Prompt */}
        {activeSection === 'route' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 4 }}>POST</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Route Prompt</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/route</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Analyzes a prompt and returns the optimal model recommendation along with backup options, scoring breakdown, and confidence metrics.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Request Body</h3>
            <ParamTable
              params={[
                { name: 'prompt', type: 'string', required: true, description: 'The user prompt to analyze and route' },
                { name: 'modality', type: 'string', required: false, description: 'Input type: text, image, voice, text+image, text+voice. Defaults to text' },
                { name: 'humanContext', type: 'object', required: false, description: 'Optional context about user state (mood, time, preferences)' },
                { name: 'constraints', type: 'object', required: false, description: 'Optional constraints (max cost, latency, required capabilities)' },
                { name: 'conversationId', type: 'string', required: false, description: 'ID to maintain model coherence across conversation turns' },
              ]}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="route-request"
              language="bash"
              code={`curl -X POST https://your-domain.com/api/v1/route \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a creative short story about a robot learning to paint",
    "modality": "text",
    "humanContext": {
      "emotionalState": { "mood": "relaxed", "energyLevel": "high" },
      "preferences": { "preferredResponseStyle": "detailed" }
    },
    "constraints": {
      "maxLatencyMs": 3000
    }
  }'`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="route-response"
              language="json"
              code={`{
  "decisionId": "dec_abc123xyz",
  "primaryModel": {
    "id": "claude-sonnet-4-5",
    "name": "Claude Sonnet 4.5",
    "provider": "Anthropic",
    "score": 0.91,
    "reasoning": {
      "summary": "Claude Sonnet 4.5 excels at creative writing tasks with nuanced storytelling capabilities",
      "factors": [
        { "name": "Task Fitness", "score": 0.95, "weight": 0.50, "weightedScore": 0.475, "detail": "Excellent creative writing and storytelling ability" },
        { "name": "Modality Fit", "score": 1.0, "weight": 0.15, "weightedScore": 0.15, "detail": "Full text support" },
        { "name": "Cost Efficiency", "score": 0.75, "weight": 0.10, "weightedScore": 0.075, "detail": "Mid-range pricing at $0.003/1K tokens" },
        { "name": "Speed", "score": 0.80, "weight": 0.07, "weightedScore": 0.056, "detail": "800ms average latency" },
        { "name": "User Preference", "score": 0.90, "weight": 0.10, "weightedScore": 0.09, "detail": "Matches preferred detailed style" },
        { "name": "Coherence", "score": 0.80, "weight": 0.08, "weightedScore": 0.064, "detail": "New conversation" }
      ]
    }
  },
  "backupModels": [
    { "id": "claude-opus-4-5", "name": "Claude Opus 4.5", "provider": "Anthropic", "score": 0.88 },
    { "id": "gpt-5-2", "name": "GPT-5.2", "provider": "OpenAI", "score": 0.85 }
  ],
  "confidence": 0.87,
  "analysis": {
    "intent": "Creative",
    "domain": "Creative Arts",
    "complexity": "Standard",
    "tone": "Neutral",
    "modality": "text",
    "keywords": ["story", "creative", "robot", "painting"],
    "humanContextUsed": true
  },
  "timing": {
    "totalMs": 23.5,
    "analysisMs": 8.2,
    "scoringMs": 12.1,
    "selectionMs": 3.2
  }
}`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Human Context Object</h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.6 }}>
              Providing human context shifts scoring weights to include a 15% human context fit factor.
            </p>
            <CodeBlock
              id="human-context"
              language="json"
              code={`{
  "humanContext": {
    "emotionalState": {
      "mood": "happy | neutral | stressed | frustrated | excited | tired",
      "energyLevel": "low | moderate | high"
    },
    "temporalContext": {
      "localTime": "14:30",
      "timezone": "America/New_York",
      "dayOfWeek": "Monday",
      "isWorkingHours": true
    },
    "environmentalContext": {
      "weather": "sunny | cloudy | rainy | stormy",
      "location": "United States"
    },
    "preferences": {
      "preferredResponseStyle": "concise | detailed | conversational | formal",
      "preferredResponseLength": "short | medium | long",
      "preferredModels": ["claude-opus-4-5"],
      "avoidModels": ["gpt-4-1-mini"]
    }
  }
}`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Constraints Object</h3>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.6 }}>
              Constraints filter out models that don&apos;t meet requirements before scoring.
            </p>
            <CodeBlock
              id="constraints"
              language="json"
              code={`{
  "constraints": {
    "maxCostPer1kTokens": 0.01,
    "maxLatencyMs": 2000,
    "allowedModels": ["claude-sonnet-4-5", "gpt-5-2"],
    "excludedModels": ["gemini-2-5-flash"],
    "requireStreaming": true,
    "requireVision": false,
    "requireAudio": false
  }
}`}
            />
          </section>
        )}

        {/* List Models */}
        {activeSection === 'models' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#DBEAFE', borderRadius: 4 }}>GET</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>List Models</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/models</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Returns a list of all available models with their capabilities, pricing, and performance characteristics.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Query Parameters</h3>
            <ParamTable
              params={[
                { name: 'provider', type: 'string', required: false, description: 'Filter by provider: anthropic, openai, google' },
                { name: 'capability', type: 'string', required: false, description: 'Filter by capability: vision, audio, streaming, functions' },
                { name: 'limit', type: 'integer', required: false, description: 'Number of models to return (default: 50, max: 100)' },
                { name: 'offset', type: 'integer', required: false, description: 'Pagination offset (default: 0)' },
              ]}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="models-request"
              language="bash"
              code={`curl https://your-domain.com/api/v1/models?provider=anthropic \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="models-response"
              language="json"
              code={`{
  "models": [
    {
      "id": "claude-opus-4-5",
      "name": "Claude Opus 4.5",
      "provider": "Anthropic",
      "description": "Most capable Claude model for complex reasoning and analysis",
      "pricing": {
        "inputPer1k": 0.015,
        "outputPer1k": 0.075
      },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 32000,
        "supportsVision": true,
        "supportsAudio": false,
        "supportsStreaming": true,
        "supportsFunctionCalling": true
      },
      "performance": {
        "avgLatencyMs": 2500,
        "reliabilityPercent": 99.5
      },
      "strengths": ["complex_reasoning", "creative_writing", "analysis"]
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}`}
            />
          </section>
        )}

        {/* Get Model */}
        {activeSection === 'model-detail' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#DBEAFE', borderRadius: 4 }}>GET</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Get Model</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/models/:id</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Returns detailed information about a specific model including full capabilities, pricing tiers, and performance metrics.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Path Parameters</h3>
            <ParamTable
              params={[
                { name: 'id', type: 'string', required: true, description: 'The unique model identifier (e.g., claude-opus-4-5)' },
              ]}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="model-detail-request"
              language="bash"
              code={`curl https://your-domain.com/api/v1/models/claude-opus-4-5 \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="model-detail-response"
              language="json"
              code={`{
  "id": "claude-opus-4-5",
  "name": "Claude Opus 4.5",
  "provider": "Anthropic",
  "description": "Anthropic's most capable model, excelling at complex reasoning, creative writing, and nuanced analysis",
  "version": "4.5",
  "releaseDate": "2025-03-01",
  "pricing": {
    "inputPer1k": 0.015,
    "outputPer1k": 0.075,
    "cachedInputPer1k": 0.0075
  },
  "capabilities": {
    "maxInputTokens": 200000,
    "maxOutputTokens": 32000,
    "supportsVision": true,
    "supportsAudio": false,
    "supportsStreaming": true,
    "supportsFunctionCalling": true,
    "supportsSystemPrompts": true
  },
  "performance": {
    "avgLatencyMs": 2500,
    "p95LatencyMs": 4500,
    "reliabilityPercent": 99.5,
    "throughputTokensPerSec": 85
  },
  "strengths": ["complex_reasoning", "creative_writing", "analysis", "coding", "math"],
  "bestFor": ["Research tasks", "Long-form content", "Complex problem solving"]
}`}
            />
          </section>
        )}

        {/* Analyze Prompt */}
        {activeSection === 'analyze' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 4 }}>POST</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Analyze Prompt</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/analyze</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Analyzes a prompt without performing model selection. Useful for understanding how the engine interprets your prompts.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Request Body</h3>
            <ParamTable
              params={[
                { name: 'prompt', type: 'string', required: true, description: 'The prompt to analyze' },
                { name: 'modality', type: 'string', required: false, description: 'Input modality type (defaults to text)' },
              ]}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="analyze-request"
              language="bash"
              code={`curl -X POST https://your-domain.com/api/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Debug this Python function and optimize for performance"}'`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="analyze-response"
              language="json"
              code={`{
  "analysis": {
    "intent": "Coding",
    "domain": "Technology",
    "complexity": "Standard",
    "tone": "Neutral",
    "modality": "text",
    "keywords": ["debug", "python", "function", "optimize", "performance"],
    "estimatedTokens": 12,
    "language": "en"
  },
  "timing": {
    "analysisMs": 5.3
  }
}`}
            />
          </section>
        )}

        {/* Submit Feedback */}
        {activeSection === 'feedback' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#059669', background: '#D1FAE5', borderRadius: 4 }}>POST</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Submit Feedback</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/feedback</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Submit feedback on a routing decision to help improve the engine. Feedback is used to refine scoring weights and model rankings.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Request Body</h3>
            <ParamTable
              params={[
                { name: 'decisionId', type: 'string', required: true, description: 'The decision ID from the route response' },
                { name: 'rating', type: 'integer', required: true, description: 'Rating from 1-5 (1=poor, 5=excellent)' },
                { name: 'selectedModel', type: 'string', required: false, description: 'Model ID if user chose a different model' },
                { name: 'comment', type: 'string', required: false, description: 'Optional feedback comment' },
              ]}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="feedback-request"
              language="bash"
              code={`curl -X POST https://your-domain.com/api/v1/feedback \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "decisionId": "dec_abc123xyz",
    "rating": 5,
    "comment": "Perfect model choice for this creative task"
  }'`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="feedback-response"
              language="json"
              code={`{
  "success": true,
  "feedbackId": "fb_def456uvw",
  "message": "Feedback recorded successfully"
}`}
            />
          </section>
        )}

        {/* Health Check */}
        {activeSection === 'health' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#DBEAFE', borderRadius: 4 }}>GET</span>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Health Check</h1>
            </div>
            <code style={{ fontSize: 14, fontFamily: 'ui-monospace, monospace', color: '#6B7280' }}>/api/v1/health</code>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '16px 0 24px', lineHeight: 1.7 }}>
              Returns the current health status of the ADE engine and its dependencies.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Example Request</h3>
            <CodeBlock
              id="health-request"
              language="bash"
              code={`curl https://your-domain.com/api/v1/health`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Example Response</h3>
            <CodeBlock
              id="health-response"
              language="json"
              code={`{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-25T10:30:00Z",
  "services": {
    "kv": "connected",
    "cache": "connected"
  },
  "uptime": 86400,
  "requestsProcessed": 15420
}`}
            />

            <div style={{ marginTop: 24, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Status Values</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { status: 'healthy', color: '#22C55E', desc: 'All systems operational' },
                  { status: 'degraded', color: '#F59E0B', desc: 'Some services experiencing issues but core functionality works' },
                  { status: 'unhealthy', color: '#EF4444', desc: 'Critical services are down' },
                ].map((item) => (
                  <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <code style={{ fontSize: 12, color: '#374151' }}>{item.status}</code>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Error Handling */}
        {activeSection === 'errors' && (
          <section>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Error Handling</h1>
            <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.7 }}>
              ADE uses standard HTTP status codes and returns consistent error objects for all error responses.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 12px' }}>Error Response Format</h3>
            <CodeBlock
              id="error-format"
              language="json"
              code={`{
  "error": {
    "code": "invalid_request",
    "message": "The 'prompt' field is required",
    "param": "prompt",
    "type": "validation_error"
  }
}`}
            />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>HTTP Status Codes</h3>
            <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5', width: 100 }}>Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: '200', desc: 'Success - Request completed successfully' },
                    { code: '400', desc: 'Bad Request - Invalid request body or parameters' },
                    { code: '401', desc: 'Unauthorized - Missing or invalid API key' },
                    { code: '403', desc: 'Forbidden - API key lacks required permissions' },
                    { code: '404', desc: 'Not Found - Requested resource does not exist' },
                    { code: '429', desc: 'Too Many Requests - Rate limit exceeded' },
                    { code: '500', desc: 'Internal Server Error - Unexpected server error' },
                    { code: '503', desc: 'Service Unavailable - Engine temporarily unavailable' },
                  ].map((item, idx) => (
                    <tr key={item.code} style={{ background: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5' }}>
                        <code style={{ fontSize: 12, color: item.code.startsWith('2') ? '#059669' : item.code.startsWith('4') ? '#D97706' : '#DC2626', fontWeight: 600 }}>{item.code}</code>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5', color: '#4B5563' }}>{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '32px 0 12px' }}>Error Codes</h3>
            <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Code</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: 'invalid_request', desc: 'Request body is malformed or missing required fields' },
                    { code: 'invalid_api_key', desc: 'The provided API key is invalid or expired' },
                    { code: 'model_not_found', desc: 'The specified model ID does not exist' },
                    { code: 'no_models_available', desc: 'No models match the given constraints' },
                    { code: 'rate_limit_exceeded', desc: 'Too many requests, please slow down' },
                    { code: 'internal_error', desc: 'An unexpected error occurred on the server' },
                  ].map((item, idx) => (
                    <tr key={item.code} style={{ background: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5' }}>
                        <code style={{ fontSize: 12, color: '#374151' }}>{item.code}</code>
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E5E5', color: '#4B5563' }}>{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============ COMPONENT ============
export default function Home() {
  // Navigation
  const [activeView, setActiveView] = useState<'router' | 'models' | 'docs'>('router');
  const [showStatus, setShowStatus] = useState(false);

  // Router State
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'result' | 'factors' | 'json'>('result');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  // Human Context
  const [humanContext, setHumanContext] = useState<HumanContext>({});
  const [useHumanContext, setUseHumanContext] = useState(false);

  // Constraints
  const [constraints, setConstraints] = useState<Constraints>({});
  const [useConstraints, setUseConstraints] = useState(false);

  // Request tracking
  const [lastRequest, setLastRequest] = useState<object | null>(null);
  const [requestHistory, setRequestHistory] = useState<Array<{ id: string; prompt: string; model: string; time: string; confidence: number }>>([]);

  // Models State
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Health State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // ============ EFFECTS ============
  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (activeView === 'models' && models.length === 0) {
      fetchModels();
    }
  }, [activeView, models.length]);

  // ============ API CALLS ============
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        setHealth(await res.json());
      }
    } catch {
      // Silently fail health check
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchModels = async () => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch('/api/v1/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setModels(data.models || []);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setModelsLoading(false);
    }
  };

  const handleRoute = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    setResult(null);
    setIsLoading(true);

    const requestBody: Record<string, unknown> = { prompt: prompt.trim(), modality };

    if (useHumanContext) {
      const cleanedContext: HumanContext = {};
      if (humanContext.emotionalState?.mood || humanContext.emotionalState?.energyLevel) {
        cleanedContext.emotionalState = {};
        if (humanContext.emotionalState.mood) cleanedContext.emotionalState.mood = humanContext.emotionalState.mood;
        if (humanContext.emotionalState.energyLevel) cleanedContext.emotionalState.energyLevel = humanContext.emotionalState.energyLevel;
      }
      if (humanContext.temporalContext?.localTime || humanContext.temporalContext?.isWorkingHours !== undefined) {
        cleanedContext.temporalContext = { ...humanContext.temporalContext };
      }
      if (humanContext.environmentalContext?.weather || humanContext.environmentalContext?.location) {
        cleanedContext.environmentalContext = { ...humanContext.environmentalContext };
      }
      if (humanContext.preferences?.preferredResponseStyle || humanContext.preferences?.preferredResponseLength) {
        cleanedContext.preferences = { ...humanContext.preferences };
      }
      if (Object.keys(cleanedContext).length > 0) {
        requestBody.humanContext = cleanedContext;
      }
    }

    if (useConstraints) {
      const cleanedConstraints: Constraints = {};
      if (constraints.maxCostPer1kTokens) cleanedConstraints.maxCostPer1kTokens = constraints.maxCostPer1kTokens;
      if (constraints.maxLatencyMs) cleanedConstraints.maxLatencyMs = constraints.maxLatencyMs;
      if (constraints.requireVision) cleanedConstraints.requireVision = true;
      if (constraints.requireAudio) cleanedConstraints.requireAudio = true;
      if (constraints.requireStreaming) cleanedConstraints.requireStreaming = true;
      if (constraints.excludedModels?.length) cleanedConstraints.excludedModels = constraints.excludedModels;
      if (Object.keys(cleanedConstraints).length > 0) {
        requestBody.constraints = cleanedConstraints;
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
      const data = await response.json();
      setResult(data);
      setRequestHistory(prev => [{
        id: data.decisionId,
        prompt: prompt.trim().slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        model: data.primaryModel.name,
        time: new Date().toLocaleTimeString(),
        confidence: data.confidence,
      }, ...prev.slice(0, 9)]);
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

  // ============ HELPERS ============
  const updateHumanContext = (path: string[], value: unknown) => {
    setHumanContext(prev => {
      const newContext: Record<string, unknown> = JSON.parse(JSON.stringify(prev));
      let current: Record<string, unknown> = newContext;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key === undefined) continue;
        if (!current[key]) current[key] = {};
        current = current[key] as Record<string, unknown>;
      }
      const lastKey = path[path.length - 1];
      if (lastKey === undefined) return newContext;
      if (value === '' || value === undefined || value === null) {
        delete current[lastKey];
      } else {
        current[lastKey] = value;
      }
      return newContext as HumanContext;
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

  const formatScore = (score: number | undefined | null): string => {
    if (score === undefined || score === null || isNaN(score)) return '—';
    return Math.round(score * 100).toString();
  };

  const formatWeight = (weight: number | undefined | null): string => {
    if (weight === undefined || weight === null || isNaN(weight)) return '—';
    return `${Math.round(weight * 100)}%`;
  };

  // ============ RENDER ============
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles style={{ width: 14, height: 14, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>ADE</span>
              <span style={{ fontSize: 11, color: '#666', background: '#F5F5F5', padding: '2px 6px', borderRadius: 4 }}>v1.0</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[
                { id: 'router', label: 'Router', icon: Search },
                { id: 'models', label: 'Models', icon: Box },
                { id: 'docs', label: 'Docs', icon: BookOpen },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as typeof activeView)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 13,
                      color: isActive ? '#000' : '#666', background: isActive ? '#F5F5F5' : 'transparent',
                      border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { fetchHealth(); setShowStatus(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 13, color: '#666', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              <span style={{ width: 6, height: 6, background: health?.status === 'healthy' ? '#22C55E' : health?.status === 'degraded' ? '#F59E0B' : '#EF4444', borderRadius: '50%' }} />
              {healthLoading ? 'Checking...' : health?.status || 'Status'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* ============ ROUTER VIEW ============ */}
        {activeView === 'router' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Input Section */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8 }}>
                <div style={{ padding: 16 }}>
                  <textarea
                    placeholder="Enter a prompt to test the routing engine..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleRoute(); }}
                    style={{ width: '100%', minHeight: 100, padding: 0, fontSize: 14, color: '#000', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }}
                  />
                </div>

                {/* Example Prompts */}
                <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setPrompt(ex.prompt)}
                      style={{ padding: '4px 10px', fontSize: 11, color: '#666', background: '#F5F5F5', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                {/* Controls */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Modality Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F5', borderRadius: 6, padding: 2 }}>
                      {MODALITIES.map((m) => {
                        const Icon = m.icon;
                        const isActive = modality === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setModality(m.id)}
                            title={`${m.label}: ${m.desc}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: isActive ? '#fff' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                          >
                            <Icon style={{ width: 14, height: 14, color: isActive ? '#000' : '#999' }} />
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowOptions(!showOptions)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, color: showOptions ? '#000' : '#666', background: showOptions ? '#F5F5F5' : 'transparent', border: '1px solid #E5E5E5', borderRadius: 6, cursor: 'pointer' }}
                    >
                      <Settings2 style={{ width: 12, height: 12 }} />
                      Options
                      <ChevronDown style={{ width: 12, height: 12, transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                  <button
                    onClick={handleRoute}
                    disabled={isLoading || !prompt.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#fff', background: isLoading || !prompt.trim() ? '#999' : '#000', border: 'none', borderRadius: 6, cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer' }}
                  >
                    {isLoading ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Search style={{ width: 14, height: 14 }} />}
                    {isLoading ? 'Routing...' : 'Route Prompt'}
                  </button>
                </div>

                {/* Options Panel */}
                <AnimatePresence>
                  {showOptions && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: 16, borderTop: '1px solid #E5E5E5', background: '#FAFAFA' }}>
                        {/* Human Context Section */}
                        <div style={{ marginBottom: 20 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={useHumanContext} onChange={(e) => setUseHumanContext(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#000' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Human Context</span>
                            <span style={{ fontSize: 11, color: '#666' }}>(Adds 15% weight to scoring)</span>
                          </label>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, opacity: useHumanContext ? 1 : 0.5 }}>
                            {/* Emotional State */}
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Mood</label>
                              <select
                                value={humanContext.emotionalState?.mood || ''}
                                onChange={(e) => updateHumanContext(['emotionalState', 'mood'], e.target.value)}
                                disabled={!useHumanContext}
                                style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                              >
                                <option value="">Select mood...</option>
                                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
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
                                {ENERGY_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                              </select>
                            </div>

                            {/* Temporal Context */}
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

                            {/* Environmental Context */}
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Weather</label>
                              <select
                                value={humanContext.environmentalContext?.weather || ''}
                                onChange={(e) => updateHumanContext(['environmentalContext', 'weather'], e.target.value)}
                                disabled={!useHumanContext}
                                style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                              >
                                <option value="">Select weather...</option>
                                {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Location</label>
                              <select
                                value={humanContext.environmentalContext?.location || ''}
                                onChange={(e) => updateHumanContext(['environmentalContext', 'location'], e.target.value)}
                                disabled={!useHumanContext}
                                style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                              >
                                <option value="">Select location...</option>
                                {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>

                            {/* Preferences */}
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4 }}>Response Style</label>
                              <select
                                value={humanContext.preferences?.preferredResponseStyle || ''}
                                onChange={(e) => updateHumanContext(['preferences', 'preferredResponseStyle'], e.target.value)}
                                disabled={!useHumanContext}
                                style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                              >
                                <option value="">Select style...</option>
                                {RESPONSE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
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
                                {RESPONSE_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Constraints Section */}
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={useConstraints} onChange={(e) => setUseConstraints(e.target.checked)} style={{ width: 14, height: 14, accentColor: '#000' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Constraints</span>
                            <span style={{ fontSize: 11, color: '#666' }}>(Filter out models that don&apos;t meet requirements)</span>
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
                                onChange={(e) => setConstraints(prev => ({ ...prev, maxCostPer1kTokens: e.target.value ? parseFloat(e.target.value) : undefined }))}
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
                                onChange={(e) => setConstraints(prev => ({ ...prev, maxLatencyMs: e.target.value ? parseInt(e.target.value) : undefined }))}
                                disabled={!useConstraints}
                                style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #E5E5E5', borderRadius: 6, background: '#fff' }}
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                                <input type="checkbox" checked={constraints.requireVision || false} onChange={(e) => setConstraints(prev => ({ ...prev, requireVision: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
                                Require Vision
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                                <input type="checkbox" checked={constraints.requireAudio || false} onChange={(e) => setConstraints(prev => ({ ...prev, requireAudio: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
                                Require Audio
                              </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: useConstraints ? 'pointer' : 'not-allowed' }}>
                                <input type="checkbox" checked={constraints.requireStreaming || false} onChange={(e) => setConstraints(prev => ({ ...prev, requireStreaming: e.target.checked || undefined }))} disabled={!useConstraints} style={{ width: 14, height: 14 }} />
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

              {/* Error Display */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#DC2626' }}>
                  <AlertCircle style={{ width: 14, height: 14 }} />
                  {error}
                </div>
              )}

              {/* Results */}
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Result Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                      {/* Header */}
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>{result.primaryModel.name}</span>
                          <span style={{ padding: '2px 6px', fontSize: 11, fontWeight: 500, color: '#059669', background: '#ECFDF5', borderRadius: 4 }}>Recommended</span>
                          <span style={{ padding: '2px 6px', fontSize: 11, color: '#666', background: '#F5F5F5', borderRadius: 4 }}>
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

                      {/* Tabs */}
                      <div style={{ display: 'flex', borderBottom: '1px solid #E5E5E5' }}>
                        {[
                          { id: 'result', label: 'Result' },
                          { id: 'factors', label: 'Factors' },
                          { id: 'json', label: 'JSON' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            style={{ padding: '10px 16px', fontSize: 13, fontWeight: activeTab === tab.id ? 500 : 400, color: activeTab === tab.id ? '#000' : '#666', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent', marginBottom: -1, cursor: 'pointer' }}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div style={{ padding: 16 }}>
                        {activeTab === 'result' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                              {[
                                { label: 'Intent', value: result.analysis.intent },
                                { label: 'Domain', value: result.analysis.domain },
                                { label: 'Complexity', value: result.analysis.complexity },
                                { label: 'Total Time', value: `${result.timing.totalMs.toFixed(1)}ms` },
                                { label: 'Human Context', value: result.analysis.humanContextUsed ? 'Yes' : 'No' },
                              ].map((stat) => (
                                <div key={stat.label} style={{ padding: 10, background: '#FAFAFA', borderRadius: 6 }}>
                                  <div style={{ fontSize: 10, color: '#666', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000', textTransform: 'capitalize' }}>{stat.value}</div>
                                </div>
                              ))}
                            </div>

                            {/* Model Ranking - Clickable */}
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
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#000' }}>{model.name}</span>
                                        <span style={{ fontSize: 12, color: '#666' }}>{model.provider}</span>
                                        <div style={{ width: 60, height: 4, background: '#E5E5E5', borderRadius: 2, overflow: 'hidden' }}>
                                          <div style={{ width: `${(model.score || 0) * 100}%`, height: '100%', background: idx === 0 ? '#000' : '#999', borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#000', width: 28, textAlign: 'right' }}>{formatScore(model.score)}</span>
                                        <ChevronDown style={{ width: 14, height: 14, color: '#666', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                      </button>
                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                          >
                                            <div style={{ padding: 12, background: '#FAFAFA', border: '1px solid #E5E5E5', borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
                                              <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>{model.reasoning.summary}</div>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                                {model.reasoning.factors.map((factor) => (
                                                  <div key={factor.name} style={{ padding: 8, background: '#fff', borderRadius: 4, border: '1px solid #E5E5E5' }}>
                                                    <div style={{ fontSize: 11, fontWeight: 500, color: '#000', marginBottom: 2 }}>{factor.name}</div>
                                                    <div style={{ fontSize: 12, color: '#666' }}>
                                                      Score: {formatScore(factor.score)} | Weight: {formatWeight(factor.weight)}
                                                    </div>
                                                  </div>
                                                ))}
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

                            {/* Keywords */}
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

              {/* Empty State */}
              {!result && !isLoading && (
                <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, background: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Sparkles style={{ width: 20, height: 20, color: '#666' }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: '0 0 6px' }}>Intelligent LLM Routing</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: 0, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                    Enter a prompt and ADE will analyze intent, domain, and complexity to recommend the optimal model.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Engine Stats */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 16 }}>
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

              {/* Scoring Weights */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Scoring Weights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SCORING_FACTORS.map((factor) => {
                    const Icon = factor.icon;
                    return (
                      <div key={factor.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon style={{ width: 12, height: 12, color: factor.color }} />
                        <span style={{ flex: 1, fontSize: 12, color: '#000' }}>{factor.label}</span>
                        <span style={{ fontSize: 12, color: '#666' }}>{factor.weight}%</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, padding: 8, background: '#FEF3C7', borderRadius: 4, fontSize: 11, color: '#92400E' }}>
                  <strong>Note:</strong> With Human Context enabled, weights shift to include a 15% humanContextFit factor.
                </div>
              </div>

              {/* Request History */}
              {requestHistory.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Recent Requests</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {requestHistory.slice(0, 5).map((req) => (
                      <div key={req.id} style={{ padding: 8, background: '#FAFAFA', borderRadius: 4 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{req.time}</div>
                        <div style={{ fontSize: 12, color: '#000', marginBottom: 2 }}>{req.prompt}</div>
                        <div style={{ fontSize: 11, color: '#059669' }}>{req.model} ({Math.round(req.confidence * 100)}%)</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API Card */}
              <div style={{ background: '#18181B', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', marginBottom: 8 }}>API Endpoint</div>
                <code style={{ display: 'block', fontSize: 11, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', background: 'rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: 4, marginBottom: 8 }}>
                  POST /api/v1/route
                </code>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <a href="/api/v1/health" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A1A1AA', textDecoration: 'none' }}>
                    Health Check <ChevronRight style={{ width: 12, height: 12 }} />
                  </a>
                  <a href="/api/v1/models" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A1A1AA', textDecoration: 'none' }}>
                    List Models <ChevronRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ MODELS VIEW ============ */}
        {activeView === 'models' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#000', margin: '0 0 6px' }}>Available Models</h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                ADE supports {models.length || 10} models across 3 providers. Each model has different strengths, costs, and capabilities.
              </p>
            </div>

            {modelsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                <RefreshCw style={{ width: 20, height: 20, color: '#666', animation: 'spin 1s linear infinite' }} />
                <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>Loading models...</span>
              </div>
            )}

            {modelsError && (
              <div style={{ padding: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#DC2626' }}>
                {modelsError}
                <button onClick={fetchModels} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
                  Retry
                </button>
              </div>
            )}

            {!modelsLoading && !modelsError && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {models.map((model) => (
                  <div key={model.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getProviderColor(model.provider), marginTop: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>{model.name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{model.provider}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', lineHeight: 1.5 }}>{model.description}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 8, background: '#FAFAFA', borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>INPUT COST</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>${model.pricing.inputPer1k.toFixed(6)}/1K</div>
                      </div>
                      <div style={{ padding: 8, background: '#FAFAFA', borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>OUTPUT COST</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>${model.pricing.outputPer1k.toFixed(6)}/1K</div>
                      </div>
                      <div style={{ padding: 8, background: '#FAFAFA', borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>LATENCY</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>{model.performance.avgLatencyMs}ms</div>
                      </div>
                      <div style={{ padding: 8, background: '#FAFAFA', borderRadius: 4 }}>
                        <div style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>RELIABILITY</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>{model.performance.reliabilityPercent}%</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {model.capabilities.supportsVision && <span style={{ padding: '2px 6px', fontSize: 10, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 4 }}>Vision</span>}
                      {model.capabilities.supportsAudio && <span style={{ padding: '2px 6px', fontSize: 10, background: '#FEE2E2', color: '#DC2626', borderRadius: 4 }}>Audio</span>}
                      {model.capabilities.supportsStreaming && <span style={{ padding: '2px 6px', fontSize: 10, background: '#D1FAE5', color: '#059669', borderRadius: 4 }}>Streaming</span>}
                      {model.capabilities.supportsFunctionCalling && <span style={{ padding: '2px 6px', fontSize: 10, background: '#FEF3C7', color: '#D97706', borderRadius: 4 }}>Functions</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ DOCS VIEW ============ */}
        {activeView === 'docs' && (
          <DocsView />
        )}
      </main>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatus && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowStatus(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: 8, border: '1px solid #E5E5E5' }}>
              <div style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #E5E5E5', background: '#fff' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>System Status</span>
                <button onClick={() => setShowStatus(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: '#F5F5F5', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  <X style={{ width: 14, height: 14, color: '#666' }} />
                </button>
              </div>
              <div style={{ padding: 16 }}>
                {health && (
                  <div style={{ marginBottom: 16, padding: 12, background: health.status === 'healthy' ? '#D1FAE5' : '#FEF2F2', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {health.status === 'healthy' ? <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} /> : <XCircle style={{ width: 16, height: 16, color: '#DC2626' }} />}
                      <span style={{ fontSize: 14, fontWeight: 600, color: health.status === 'healthy' ? '#059669' : '#DC2626', textTransform: 'capitalize' }}>{health.status}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      <div>Version: {health.version}</div>
                      <div>Timestamp: {health.timestamp}</div>
                      <div>KV Store: {health.services.kv}</div>
                    </div>
                  </div>
                )}
                <StatusPage />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
