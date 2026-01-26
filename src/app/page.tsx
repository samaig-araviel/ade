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
  Image as ImageIcon,
  Mic,
  MicOff,
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
  Paperclip,
  MapPin,
  Cloud,
  Filter,
  ChevronLeft,
  Loader2,
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
  { id: 'image', label: 'Vision', icon: ImageIcon, desc: 'Image analysis' },
  { id: 'voice', label: 'Voice', icon: Mic, desc: 'Audio processing' },
  { id: 'text+image', label: 'Text+Vision', icon: Eye, desc: 'Combined text and image' },
  { id: 'text+voice', label: 'Text+Voice', icon: AudioLines, desc: 'Combined text and audio' },
];

const MOODS = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
const ENERGY_LEVELS = ['low', 'moderate', 'high'];
const RESPONSE_STYLES = ['concise', 'detailed', 'conversational', 'formal', 'casual'];
const RESPONSE_LENGTHS = ['short', 'medium', 'long'];
const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'hot', 'cold'];

// Countries list for location selection
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'South Korea',
  'China', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Finland', 'Switzerland', 'Austria', 'Belgium', 'Poland', 'Portugal', 'Ireland', 'New Zealand',
  'Singapore', 'Hong Kong', 'Taiwan', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines',
  'Russia', 'Ukraine', 'Turkey', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'South Africa',
  'Egypt', 'Nigeria', 'Kenya', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Czech Republic', 'Romania',
  'Hungary', 'Greece', 'Other',
].sort();

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
  const [activeCodeLang, setActiveCodeLang] = useState('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'getting-started': true,
    'endpoints': true,
  });

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const codeLangs = [
    { id: 'curl', label: 'cURL' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
  ];

  const navSections = [
    {
      id: 'getting-started',
      label: 'Getting Started',
      items: [
        { id: 'introduction', label: 'Introduction' },
        { id: 'authentication', label: 'Authentication' },
      ],
    },
    {
      id: 'endpoints',
      label: 'Endpoints',
      items: [
        { id: 'route', label: 'Route Prompt', method: 'POST' },
        { id: 'models', label: 'List Models', method: 'GET' },
        { id: 'model-detail', label: 'Get Model', method: 'GET' },
        { id: 'analyze', label: 'Analyze Prompt', method: 'POST' },
        { id: 'feedback', label: 'Submit Feedback', method: 'POST' },
        { id: 'health', label: 'Health Check', method: 'GET' },
      ],
    },
    {
      id: 'reference',
      label: 'Reference',
      items: [
        { id: 'errors', label: 'Error Handling' },
        { id: 'objects', label: 'Objects' },
      ],
    },
  ];

  const getMethodColor = (method?: string) => {
    switch (method) {
      case 'GET': return { bg: '#DBEAFE', color: '#1D4ED8' };
      case 'POST': return { bg: '#D1FAE5', color: '#059669' };
      case 'DELETE': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  // Code examples for each endpoint
  const codeExamples: Record<string, Record<string, string>> = {
    route: {
      curl: `curl -X POST https://api.ade.dev/v1/route \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a creative short story about a robot",
    "modality": "text"
  }'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/route', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Write a creative short story about a robot',
    modality: 'text',
  }),
});

const data = await response.json();
console.log(data.primaryModel);`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/route',
    headers={
        'Authorization': f'Bearer {ADE_API_KEY}',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'Write a creative short story about a robot',
        'modality': 'text',
    }
)

data = response.json()
print(data['primaryModel'])`,
    },
    models: {
      curl: `curl https://api.ade.dev/v1/models \\
  -H "Authorization: Bearer $ADE_API_KEY"`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/models', {
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
  },
});

const data = await response.json();
console.log(data.models);`,
      python: `import requests

response = requests.get(
    'https://api.ade.dev/v1/models',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'}
)

data = response.json()
print(data['models'])`,
    },
    'model-detail': {
      curl: `curl https://api.ade.dev/v1/models/claude-sonnet-4-5 \\
  -H "Authorization: Bearer $ADE_API_KEY"`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/models/claude-sonnet-4-5', {
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
  },
});

const model = await response.json();
console.log(model);`,
      python: `import requests

response = requests.get(
    'https://api.ade.dev/v1/models/claude-sonnet-4-5',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'}
)

model = response.json()
print(model)`,
    },
    analyze: {
      curl: `curl -X POST https://api.ade.dev/v1/analyze \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Debug this Python function"}'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Debug this Python function',
  }),
});

const analysis = await response.json();`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/analyze',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'},
    json={'prompt': 'Debug this Python function'}
)

analysis = response.json()`,
    },
    feedback: {
      curl: `curl -X POST https://api.ade.dev/v1/feedback \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "decisionId": "dec_abc123",
    "rating": 5,
    "comment": "Perfect recommendation"
  }'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/feedback', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    decisionId: 'dec_abc123',
    rating: 5,
    comment: 'Perfect recommendation',
  }),
});`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/feedback',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'},
    json={
        'decisionId': 'dec_abc123',
        'rating': 5,
        'comment': 'Perfect recommendation'
    }
)`,
    },
    health: {
      curl: `curl https://api.ade.dev/v1/health`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/health');
const health = await response.json();
console.log(health.status);`,
      python: `import requests

response = requests.get('https://api.ade.dev/v1/health')
health = response.json()
print(health['status'])`,
    },
  };

  const responseExamples: Record<string, string> = {
    route: `{
  "decisionId": "dec_abc123xyz",
  "primaryModel": {
    "id": "claude-sonnet-4-5",
    "name": "Claude Sonnet 4.5",
    "provider": "Anthropic",
    "score": 0.91,
    "reasoning": {
      "summary": "Excellent for creative writing",
      "factors": [...]
    }
  },
  "backupModels": [...],
  "confidence": 0.87,
  "analysis": {
    "intent": "Creative",
    "domain": "Creative Arts",
    "complexity": "Standard"
  }
}`,
    models: `{
  "models": [
    {
      "id": "claude-opus-4-5",
      "name": "Claude Opus 4.5",
      "provider": "Anthropic",
      "pricing": {
        "inputPer1k": 0.015,
        "outputPer1k": 0.075
      },
      "capabilities": {
        "supportsVision": true,
        "supportsStreaming": true
      }
    },
    ...
  ],
  "total": 15
}`,
    'model-detail': `{
  "id": "claude-sonnet-4-5",
  "name": "Claude Sonnet 4.5",
  "provider": "Anthropic",
  "description": "Balanced model for most tasks",
  "pricing": {
    "inputPer1k": 0.003,
    "outputPer1k": 0.015
  },
  "capabilities": {
    "maxInputTokens": 200000,
    "maxOutputTokens": 8192,
    "supportsVision": true
  }
}`,
    analyze: `{
  "analysis": {
    "intent": "Coding",
    "domain": "Technology",
    "complexity": "Standard",
    "keywords": ["debug", "python", "function"]
  }
}`,
    feedback: `{
  "success": true,
  "feedbackId": "fb_def456"
}`,
    health: `{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-26T10:30:00Z",
  "services": {
    "kv": "connected"
  }
}`,
  };

  return (
    <div style={{ display: 'flex', gap: 0, marginLeft: -24, marginRight: -24, minHeight: 'calc(100vh - 96px)' }}>
      {/* Dark Sidebar */}
      <aside style={{ width: 260, background: '#18181B', padding: '24px 0', flexShrink: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 96px)', position: 'sticky', top: 72 }}>
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>API Reference</div>
        </div>

        {navSections.map((section) => (
          <div key={section.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, color: '#A1A1AA', textAlign: 'left',
              }}
            >
              {section.label}
              <ChevronDown style={{ width: 14, height: 14, transform: expandedSections[section.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {expandedSections[section.id] && (
              <div style={{ paddingLeft: 8 }}>
                {section.items.map((item) => {
                  const methodStyle = getMethodColor(item.method);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', background: activeSection === item.id ? '#27272A' : 'transparent',
                        border: 'none', borderLeft: activeSection === item.id ? '2px solid #fff' : '2px solid transparent',
                        cursor: 'pointer', fontSize: 13, color: activeSection === item.id ? '#fff' : '#A1A1AA',
                        textAlign: 'left',
                      }}
                    >
                      {item.method && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3,
                          background: methodStyle.bg, color: methodStyle.color,
                        }}>
                          {item.method}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Main Content + Code Panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', background: '#fff' }}>
        {/* Documentation Content */}
        <main style={{ padding: '32px 40px', borderRight: '1px solid #E5E5E5', overflowY: 'auto' }}>

          {/* Introduction */}
          {activeSection === 'introduction' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>ADE API</h1>
                <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: 0 }}>
                  The Araviel Decision Engine (ADE) API provides intelligent LLM routing by analyzing prompts
                  and recommending the optimal model based on task requirements, cost, and performance.
                </p>
              </div>

              <div style={{ background: '#F4F4F5', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#52525B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base URL</div>
                <code style={{ fontSize: 14, color: '#18181B', fontFamily: 'ui-monospace, monospace' }}>https://api.ade.dev/v1</code>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', margin: '32px 0 16px' }}>How It Works</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { num: '1', title: 'Analyze', desc: 'Engine detects intent, domain, complexity, and tone from your prompt' },
                  { num: '2', title: 'Score', desc: 'Each model is scored across 6 weighted factors including task fitness and cost' },
                  { num: '3', title: 'Select', desc: 'Models are ranked and the optimal choice is returned with backup alternatives' },
                ].map((step) => (
                  <div key={step.num} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, background: '#18181B', color: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B', marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: 14, color: '#52525B', lineHeight: 1.6 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentication */}
          {activeSection === 'authentication' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Authentication</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 24px' }}>
                ADE uses API keys to authenticate requests. Include your API key in the Authorization header.
              </p>

              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertCircle style={{ width: 18, height: 18, color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Keep your API key secure</div>
                    <div style={{ fontSize: 13, color: '#A16207', lineHeight: 1.5 }}>Never expose your API key in client-side code. Use environment variables.</div>
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '32px 0 16px' }}>Request Headers</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Header</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5' }}>
                        <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>Authorization</code>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5', fontSize: 13, color: '#52525B' }}>Bearer YOUR_API_KEY</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>Content-Type</code>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#52525B' }}>application/json</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Route Prompt */}
          {activeSection === 'route' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#D1FAE5', color: '#059669' }}>POST</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/route</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Route Prompt</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Analyzes a prompt and returns the optimal model recommendation with scoring breakdown and confidence metrics.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Request Body</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Parameter</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5', width: 100 }}>Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'prompt', type: 'string', required: true, desc: 'The user prompt to analyze and route' },
                      { name: 'modality', type: 'string', required: false, desc: 'Input type: text, image, voice, text+image, text+voice' },
                      { name: 'humanContext', type: 'object', required: false, desc: 'User context (mood, time, preferences)' },
                      { name: 'constraints', type: 'object', required: false, desc: 'Constraints (max cost, latency, capabilities)' },
                      { name: 'conversationId', type: 'string', required: false, desc: 'ID for conversation coherence' },
                    ].map((param, idx) => (
                      <tr key={param.name}>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 4 ? '1px solid #E5E5E5' : 'none', verticalAlign: 'top' }}>
                          <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>{param.name}</code>
                          {param.required && <span style={{ marginLeft: 8, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>required</span>}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 4 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#7C3AED', verticalAlign: 'top' }}>{param.type}</td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 4 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#52525B', lineHeight: 1.5, verticalAlign: 'top' }}>{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Response</h2>
              <p style={{ fontSize: 14, color: '#52525B', lineHeight: 1.6, margin: '0 0 16px' }}>
                Returns a <code style={{ background: '#F4F4F5', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>RouteResponse</code> object containing the recommended model and analysis.
              </p>
            </div>
          )}

          {/* List Models */}
          {activeSection === 'models' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1D4ED8' }}>GET</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/models</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>List Models</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Returns all available models with capabilities, pricing, and performance metrics.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Query Parameters</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Parameter</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5', width: 100 }}>Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'provider', type: 'string', desc: 'Filter by provider: anthropic, openai, google' },
                      { name: 'capability', type: 'string', desc: 'Filter by capability: vision, audio, streaming' },
                      { name: 'limit', type: 'integer', desc: 'Results per page (default: 50, max: 100)' },
                      { name: 'offset', type: 'integer', desc: 'Pagination offset (default: 0)' },
                    ].map((param, idx) => (
                      <tr key={param.name}>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none' }}>
                          <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>{param.name}</code>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#7C3AED' }}>{param.type}</td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#52525B' }}>{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Get Model */}
          {activeSection === 'model-detail' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1D4ED8' }}>GET</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/models/:id</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Get Model</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Retrieves detailed information about a specific model including pricing and capabilities.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Path Parameters</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px', width: 200 }}>
                        <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>id</code>
                        <span style={{ marginLeft: 8, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>required</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#7C3AED', width: 80 }}>string</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#52525B' }}>The model ID (e.g., claude-sonnet-4-5)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analyze */}
          {activeSection === 'analyze' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#D1FAE5', color: '#059669' }}>POST</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/analyze</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Analyze Prompt</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Analyzes a prompt without model selection. Useful for understanding how the engine interprets prompts.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Request Body</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5' }}>
                        <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>prompt</code>
                        <span style={{ marginLeft: 8, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>required</span>
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5', fontSize: 13, color: '#7C3AED', width: 80 }}>string</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5', fontSize: 13, color: '#52525B' }}>The prompt to analyze</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>modality</code>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#7C3AED' }}>string</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#52525B' }}>Input modality type (defaults to text)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback */}
          {activeSection === 'feedback' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#D1FAE5', color: '#059669' }}>POST</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/feedback</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Submit Feedback</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Submit feedback on routing decisions to improve the engine&apos;s recommendations.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Request Body</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      { name: 'decisionId', type: 'string', required: true, desc: 'The decision ID from route response' },
                      { name: 'rating', type: 'integer', required: true, desc: 'Rating from 1-5' },
                      { name: 'selectedModel', type: 'string', required: false, desc: 'Model ID if user chose different' },
                      { name: 'comment', type: 'string', required: false, desc: 'Optional feedback comment' },
                    ].map((param, idx) => (
                      <tr key={param.name}>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none' }}>
                          <code style={{ fontSize: 13, color: '#18181B', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>{param.name}</code>
                          {param.required && <span style={{ marginLeft: 8, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>required</span>}
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#7C3AED', width: 80 }}>{param.type}</td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 3 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#52525B' }}>{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Health */}
          {activeSection === 'health' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: '#DBEAFE', color: '#1D4ED8' }}>GET</span>
                <code style={{ fontSize: 14, color: '#52525B', fontFamily: 'ui-monospace, monospace' }}>/v1/health</code>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Health Check</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Returns the health status of the ADE engine and its dependencies.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Status Values</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { status: 'healthy', color: '#22C55E', desc: 'All systems operational' },
                  { status: 'degraded', color: '#F59E0B', desc: 'Some services experiencing issues' },
                  { status: 'unhealthy', color: '#EF4444', desc: 'Critical services are down' },
                ].map((item) => (
                  <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#F9FAFB', borderRadius: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <code style={{ fontSize: 13, color: '#18181B' }}>{item.status}</code>
                    <span style={{ fontSize: 13, color: '#52525B' }}>— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {activeSection === 'errors' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Error Handling</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                ADE uses standard HTTP status codes and returns consistent error responses.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>HTTP Status Codes</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5', width: 100 }}>Code</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#52525B', borderBottom: '1px solid #E5E5E5' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: '200', desc: 'Success' },
                      { code: '400', desc: 'Bad Request — Invalid parameters' },
                      { code: '401', desc: 'Unauthorized — Invalid API key' },
                      { code: '404', desc: 'Not Found — Resource doesn\'t exist' },
                      { code: '429', desc: 'Too Many Requests — Rate limit exceeded' },
                      { code: '500', desc: 'Internal Server Error' },
                    ].map((item, idx) => (
                      <tr key={item.code}>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 5 ? '1px solid #E5E5E5' : 'none' }}>
                          <code style={{ fontSize: 13, fontWeight: 600, color: item.code.startsWith('2') ? '#059669' : item.code.startsWith('4') ? '#D97706' : '#DC2626' }}>{item.code}</code>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: idx < 5 ? '1px solid #E5E5E5' : 'none', fontSize: 13, color: '#52525B' }}>{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>Error Response Format</h2>
              <div style={{ background: '#18181B', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "error": {
    "code": "invalid_request",
    "message": "The 'prompt' field is required",
    "type": "validation_error"
  }
}`}</pre>
              </div>
            </div>
          )}

          {/* Objects */}
          {activeSection === 'objects' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181B', margin: '0 0 12px' }}>Objects</h1>
              <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.7, margin: '0 0 32px' }}>
                Reference documentation for API object schemas.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>humanContext Object</h2>
              <div style={{ background: '#18181B', borderRadius: 8, padding: 16, marginBottom: 32 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "emotionalState": {
    "mood": "happy | neutral | stressed",
    "energyLevel": "low | moderate | high"
  },
  "temporalContext": {
    "localTime": "14:30",
    "isWorkingHours": true
  },
  "environmentalContext": {
    "weather": "sunny | cloudy | rainy",
    "location": "United States"
  },
  "preferences": {
    "preferredResponseStyle": "concise | detailed",
    "preferredModels": ["claude-opus-4-5"]
  }
}`}</pre>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#18181B', margin: '0 0 16px' }}>constraints Object</h2>
              <div style={{ background: '#18181B', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "maxCostPer1kTokens": 0.01,
  "maxLatencyMs": 2000,
  "requireVision": true,
  "requireAudio": false,
  "excludedModels": ["model-id"]
}`}</pre>
              </div>
            </div>
          )}
        </main>

        {/* Code Examples Panel */}
        <aside style={{ background: '#18181B', padding: '32px 24px', overflowY: 'auto' }}>
          {(activeSection !== 'introduction' && activeSection !== 'authentication' && activeSection !== 'errors' && activeSection !== 'objects') && codeExamples[activeSection] && (
            <>
              {/* Language Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {codeLangs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveCodeLang(lang.id)}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: activeCodeLang === lang.id ? 500 : 400,
                      color: activeCodeLang === lang.id ? '#fff' : '#71717A',
                      background: activeCodeLang === lang.id ? '#27272A' : 'transparent',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Request Example */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA' }}>Request</span>
                  <button
                    onClick={() => copyToClipboard(codeExamples[activeSection]?.[activeCodeLang] || '', `${activeSection}-request`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, color: '#71717A', background: '#27272A', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {copiedCode === `${activeSection}-request` ? <Check style={{ width: 12, height: 12, color: '#22C55E' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  </button>
                </div>
                <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16, overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>
                    {codeExamples[activeSection]?.[activeCodeLang]}
                  </pre>
                </div>
              </div>

              {/* Response Example */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA' }}>Response</span>
                  <button
                    onClick={() => copyToClipboard(responseExamples[activeSection] || '', `${activeSection}-response`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, color: '#71717A', background: '#27272A', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {copiedCode === `${activeSection}-response` ? <Check style={{ width: 12, height: 12, color: '#22C55E' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  </button>
                </div>
                <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16, overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>
                    {responseExamples[activeSection]}
                  </pre>
                </div>
              </div>
            </>
          )}

          {activeSection === 'introduction' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 8 }}>Quick Start</div>
              <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>{`curl -X POST https://api.ade.dev/v1/route \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hello, world!"}'`}</pre>
              </div>
            </div>
          )}

          {activeSection === 'authentication' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 8 }}>Example Header</div>
              <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>{`Authorization: Bearer sk_live_abc123...`}</pre>
              </div>
            </div>
          )}

          {activeSection === 'errors' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 8 }}>Error Response</div>
              <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "type": "rate_limit_error"
  }
}`}</pre>
              </div>
            </div>
          )}

          {activeSection === 'objects' && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 8 }}>Model Object</div>
              <div style={{ background: '#0D0D0D', borderRadius: 8, padding: 16 }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.7 }}>{`{
  "id": "claude-sonnet-4-5",
  "name": "Claude Sonnet 4.5",
  "provider": "Anthropic",
  "capabilities": {
    "supportsVision": true,
    "supportsStreaming": true
  }
}`}</pre>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
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

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Image Attachment State
  const [attachedImage, setAttachedImage] = useState<{ file: File; preview: string } | null>(null);

  // Weather Auto-detection
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Models View State
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [modelsPage, setModelsPage] = useState(1);
  const MODELS_PER_PAGE = 8;

  // ============ EFFECTS ============
  useEffect(() => {
    fetchHealth();
    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
                                (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
    // Auto-detect weather and location
    autoDetectWeatherAndLocation();
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

  // Auto-detect weather and location from IP
  const autoDetectWeatherAndLocation = async () => {
    setWeatherLoading(true);
    try {
      // Get location from IP using free API
      const geoRes = await fetch('https://ipapi.co/json/');
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const country = geoData.country_name || null;
        setDetectedLocation(country);

        // Update human context with detected location
        if (country) {
          setHumanContext(prev => ({
            ...prev,
            environmentalContext: {
              ...prev.environmentalContext,
              location: country,
            },
          }));
        }

        // Get weather based on coordinates
        if (geoData.latitude && geoData.longitude) {
          try {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current_weather=true`
            );
            if (weatherRes.ok) {
              const weatherData = await weatherRes.json();
              const weatherCode = weatherData.current_weather?.weathercode;
              const temp = weatherData.current_weather?.temperature;

              // Map weather code to our options
              let weather = 'sunny';
              if (weatherCode >= 0 && weatherCode <= 3) weather = temp > 30 ? 'hot' : temp < 5 ? 'cold' : 'sunny';
              else if (weatherCode >= 45 && weatherCode <= 48) weather = 'cloudy';
              else if (weatherCode >= 51 && weatherCode <= 67) weather = 'rainy';
              else if (weatherCode >= 71 && weatherCode <= 77) weather = 'snowy';
              else if (weatherCode >= 80 && weatherCode <= 99) weather = 'stormy';

              setHumanContext(prev => ({
                ...prev,
                environmentalContext: {
                  ...prev.environmentalContext,
                  weather,
                },
              }));
            }
          } catch {
            // Weather fetch failed silently
          }
        }
      }
    } catch {
      // Geo fetch failed silently
    } finally {
      setWeatherLoading(false);
    }
  };

  // Voice input handlers
  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
                              (window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  // Image attachment handlers
  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setAttachedImage({ file, preview });
      // Auto-switch to image modality
      if (modality === 'text') {
        setModality('text+image');
      }
    }
  };

  const removeAttachedImage = () => {
    if (attachedImage) {
      URL.revokeObjectURL(attachedImage.preview);
      setAttachedImage(null);
      if (modality === 'text+image') {
        setModality('text');
      }
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
          <div className="router-grid" style={{ display: 'grid', gap: 24 }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Input Section */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8 }}>
                <div style={{ padding: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      placeholder="Enter a prompt to test the routing engine..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleRoute(); }}
                      style={{ width: '100%', minHeight: 100, padding: 0, paddingRight: 80, fontSize: 14, color: '#000', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit' }}
                    />
                    {/* Voice & Attach buttons inside textarea area */}
                    <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: 4 }}>
                      {/* Voice Input Button */}
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
                      {/* Image Attach Button */}
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
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageAttach}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Attached Image Preview */}
                  {attachedImage && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: '#F5F5F5', borderRadius: 6 }}>
                      <img
                        src={attachedImage.preview}
                        alt="Attached"
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
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

                  {/* Voice recording indicator */}
                  {isListening && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6 }}>
                      <span style={{ width: 8, height: 8, background: '#DC2626', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                      <span style={{ fontSize: 12, color: '#DC2626' }}>Listening... Speak now</span>
                    </div>
                  )}
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
                <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                                {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
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
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
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
        {activeView === 'models' && (() => {
          // Filter and paginate models
          const providers = ['all', ...Array.from(new Set(models.map(m => m.provider.toLowerCase())))];
          const filteredModels = selectedProvider === 'all'
            ? models
            : models.filter(m => m.provider.toLowerCase() === selectedProvider);
          const totalPages = Math.ceil(filteredModels.length / MODELS_PER_PAGE);
          const paginatedModels = filteredModels.slice((modelsPage - 1) * MODELS_PER_PAGE, modelsPage * MODELS_PER_PAGE);

          return (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#000', margin: '0 0 8px' }}>Models</h1>
                <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                  Explore the {models.length} models available through ADE. Each model has unique strengths, pricing, and capabilities optimized for different use cases.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter style={{ width: 14, height: 14, color: '#6B7280' }} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Filter by provider:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {providers.map((provider) => (
                      <button
                        key={provider}
                        onClick={() => { setSelectedProvider(provider); setModelsPage(1); }}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: selectedProvider === provider ? 600 : 400,
                          color: selectedProvider === provider ? '#fff' : '#374151',
                          background: selectedProvider === provider ? '#000' : '#F3F4F6',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {provider === 'all' ? 'All Providers' : provider}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  Showing {paginatedModels.length} of {filteredModels.length} models
                </div>
              </div>

              {modelsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                  <Loader2 style={{ width: 20, height: 20, color: '#666', animation: 'spin 1s linear infinite' }} />
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
                <>
                  {/* Model Cards Grid */}
                  <div className="models-grid" style={{ display: 'grid', gap: 16 }}>
                    {paginatedModels.map((model) => (
                      <div key={model.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20, transition: 'box-shadow 0.2s', cursor: 'default' }}>
                        {/* Model Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getProviderColor(model.provider)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: getProviderColor(model.provider) }}>
                                {model.provider.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{model.name}</div>
                              <div style={{ fontSize: 12, color: '#6B7280' }}>{model.provider}</div>
                            </div>
                          </div>
                          <code style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '4px 8px', borderRadius: 4 }}>
                            {model.id}
                          </code>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 16px', lineHeight: 1.6 }}>{model.description}</p>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                          <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Input</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>${model.pricing.inputPer1k.toFixed(4)}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>per 1K tokens</div>
                          </div>
                          <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Output</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>${model.pricing.outputPer1k.toFixed(4)}</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>per 1K tokens</div>
                          </div>
                          <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Latency</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{model.performance.avgLatencyMs}ms</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>average</div>
                          </div>
                          <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Uptime</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{model.performance.reliabilityPercent}%</div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>reliability</div>
                          </div>
                        </div>

                        {/* Context Window */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 2, textTransform: 'uppercase' }}>Context Window</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{(model.capabilities.maxInputTokens / 1000).toFixed(0)}K input / {(model.capabilities.maxOutputTokens / 1000).toFixed(0)}K output</div>
                          </div>
                        </div>

                        {/* Capabilities */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {model.capabilities.supportsVision && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 6 }}>
                              <Eye style={{ width: 12, height: 12 }} /> Vision
                            </span>
                          )}
                          {model.capabilities.supportsAudio && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
                              <AudioLines style={{ width: 12, height: 12 }} /> Audio
                            </span>
                          )}
                          {model.capabilities.supportsStreaming && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#D1FAE5', color: '#059669', borderRadius: 6 }}>
                              <Zap style={{ width: 12, height: 12 }} /> Streaming
                            </span>
                          )}
                          {model.capabilities.supportsFunctionCalling && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#FEF3C7', color: '#D97706', borderRadius: 6 }}>
                              <Box style={{ width: 12, height: 12 }} /> Functions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                      <button
                        onClick={() => setModelsPage(p => Math.max(1, p - 1))}
                        disabled={modelsPage === 1}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13,
                          color: modelsPage === 1 ? '#9CA3AF' : '#374151', background: '#fff',
                          border: '1px solid #E5E5E5', borderRadius: 6, cursor: modelsPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
                      </button>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setModelsPage(page)}
                            style={{
                              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: modelsPage === page ? 600 : 400,
                              color: modelsPage === page ? '#fff' : '#374151',
                              background: modelsPage === page ? '#000' : '#fff',
                              border: '1px solid #E5E5E5', borderRadius: 6, cursor: 'pointer',
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setModelsPage(p => Math.min(totalPages, p + 1))}
                        disabled={modelsPage === totalPages}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13,
                          color: modelsPage === totalPages ? '#9CA3AF' : '#374151', background: '#fff',
                          border: '1px solid #E5E5E5', borderRadius: 6, cursor: modelsPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Next <ChevronRight style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive Grid Layouts */
        .router-grid {
          grid-template-columns: 1fr 340px;
        }
        .models-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .router-grid {
            grid-template-columns: 1fr !important;
          }
          .models-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .router-grid {
            grid-template-columns: 1fr !important;
          }
          .models-grid {
            grid-template-columns: 1fr !important;
          }
          main {
            padding: 16px !important;
          }
          header > div {
            padding: 0 16px !important;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
