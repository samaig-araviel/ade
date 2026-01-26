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
  const [activeCodeLang, setActiveCodeLang] = useState('shell');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'getting-started': true,
    'endpoints': true,
    'reference': false,
  });
  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleResponse = (id: string) => {
    setExpandedResponses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Syntax highlighting for code blocks
  const highlightCode = (code: string, lang: string): React.ReactNode[] => {
    const lines = code.split('\n');
    return lines.map((line, lineIdx) => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIdx = 0;

      if (lang === 'shell') {
        // Shell/cURL highlighting
        remaining = remaining.replace(/(curl|wget|httpie|http)(\s)/g, (_, cmd, space) => {
          parts.push(<span key={`cmd-${lineIdx}-${keyIdx++}`} style={{ color: '#C792EA' }}>{cmd}</span>);
          parts.push(space);
          return '\x00'.repeat(cmd.length + space.length);
        });
        remaining = remaining.replace(/(-X\s+)(GET|POST|PUT|DELETE|PATCH)/g, (_, flag, method) => {
          parts.push(<span key={`flag-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{flag}</span>);
          parts.push(<span key={`method-${lineIdx}-${keyIdx++}`} style={{ color: '#FFCB6B' }}>{method}</span>);
          return '\x00'.repeat(flag.length + method.length);
        });
        remaining = remaining.replace(/(-H\s+|-d\s+|--header\s+|--data\s+)/g, (_, flag) => {
          parts.push(<span key={`hflag-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{flag}</span>);
          return '\x00'.repeat(flag.length);
        });
        remaining = remaining.replace(/(https?:\/\/[^\s'"]+)/g, (_, url) => {
          parts.push(<span key={`url-${lineIdx}-${keyIdx++}`} style={{ color: '#89DDFF' }}>{url}</span>);
          return '\x00'.repeat(url.length);
        });
        remaining = remaining.replace(/"([^"]*)"/g, (match, content) => {
          parts.push(<span key={`str-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>&quot;{content}&quot;</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/'([^']*)'/g, (match, content) => {
          parts.push(<span key={`str2-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>&apos;{content}&apos;</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/(\$[A-Z_]+)/g, (_, varName) => {
          parts.push(<span key={`var-${lineIdx}-${keyIdx++}`} style={{ color: '#F78C6C' }}>{varName}</span>);
          return '\x00'.repeat(varName.length);
        });
      } else if (lang === 'javascript') {
        // JavaScript highlighting
        remaining = remaining.replace(/\b(const|let|var|function|async|await|return|import|from|export|if|else|try|catch|throw|new)\b/g, (keyword) => {
          parts.push(<span key={`kw-${lineIdx}-${keyIdx++}`} style={{ color: '#C792EA' }}>{keyword}</span>);
          return '\x00'.repeat(keyword.length);
        });
        remaining = remaining.replace(/\b(fetch|console|process|JSON|Object|Array|Promise)\b/g, (builtin) => {
          parts.push(<span key={`bi-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{builtin}</span>);
          return '\x00'.repeat(builtin.length);
        });
        remaining = remaining.replace(/\.(log|stringify|parse|json|env|then|catch)\b/g, (_, method) => {
          parts.push(<span key={`dot-${lineIdx}-${keyIdx++}`} style={{ color: '#E0E0E0' }}>.</span>);
          parts.push(<span key={`meth-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{method}</span>);
          return '\x00'.repeat(method.length + 1);
        });
        remaining = remaining.replace(/(https?:\/\/[^\s'"]+)/g, (_, url) => {
          parts.push(<span key={`url-${lineIdx}-${keyIdx++}`} style={{ color: '#89DDFF' }}>{url}</span>);
          return '\x00'.repeat(url.length);
        });
        remaining = remaining.replace(/'([^']*)'/g, (match, content) => {
          parts.push(<span key={`str-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>&apos;{content}&apos;</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/`([^`]*)`/g, (match, content) => {
          parts.push(<span key={`tpl-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>`{content}`</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/\/\/.*$/g, (comment) => {
          parts.push(<span key={`cmt-${lineIdx}-${keyIdx++}`} style={{ color: '#546E7A' }}>{comment}</span>);
          return '\x00'.repeat(comment.length);
        });
      } else if (lang === 'python') {
        // Python highlighting
        remaining = remaining.replace(/\b(import|from|def|class|return|if|else|elif|try|except|raise|with|as|for|in|True|False|None)\b/g, (keyword) => {
          parts.push(<span key={`kw-${lineIdx}-${keyIdx++}`} style={{ color: '#C792EA' }}>{keyword}</span>);
          return '\x00'.repeat(keyword.length);
        });
        remaining = remaining.replace(/\b(print|requests|json|os|open|len|str|int|dict|list)\b/g, (builtin) => {
          parts.push(<span key={`bi-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{builtin}</span>);
          return '\x00'.repeat(builtin.length);
        });
        remaining = remaining.replace(/\.(get|post|put|delete|json|environ)\b/g, (_, method) => {
          parts.push(<span key={`dot-${lineIdx}-${keyIdx++}`} style={{ color: '#E0E0E0' }}>.</span>);
          parts.push(<span key={`meth-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>{method}</span>);
          return '\x00'.repeat(method.length + 1);
        });
        remaining = remaining.replace(/(https?:\/\/[^\s'"]+)/g, (_, url) => {
          parts.push(<span key={`url-${lineIdx}-${keyIdx++}`} style={{ color: '#89DDFF' }}>{url}</span>);
          return '\x00'.repeat(url.length);
        });
        remaining = remaining.replace(/(f?)'([^']*)'/g, (match, prefix, content) => {
          parts.push(<span key={`str-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>{prefix}&apos;{content}&apos;</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/(f?)"([^"]*)"/g, (match, prefix, content) => {
          parts.push(<span key={`str2-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>{prefix}&quot;{content}&quot;</span>);
          return '\x00'.repeat(match.length);
        });
        remaining = remaining.replace(/#.*$/g, (comment) => {
          parts.push(<span key={`cmt-${lineIdx}-${keyIdx++}`} style={{ color: '#546E7A' }}>{comment}</span>);
          return '\x00'.repeat(comment.length);
        });
      }

      // Handle remaining text (not highlighted)
      let lastIdx = 0;
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] === '\x00') {
          if (i > lastIdx) {
            parts.splice(parts.length - (remaining.length - i), 0,
              <span key={`txt-${lineIdx}-${keyIdx++}`} style={{ color: '#E0E0E0' }}>{remaining.slice(lastIdx, i)}</span>
            );
          }
          while (i < remaining.length && remaining[i] === '\x00') i++;
          lastIdx = i;
        }
      }
      if (lastIdx < remaining.length) {
        const remainingText = remaining.slice(lastIdx).replace(/\x00/g, '');
        if (remainingText) {
          parts.push(<span key={`txt-end-${lineIdx}-${keyIdx++}`} style={{ color: '#E0E0E0' }}>{remainingText}</span>);
        }
      }

      return (
        <div key={`line-${lineIdx}`} style={{ display: 'flex' }}>
          <span style={{ color: '#4A5568', minWidth: 32, paddingRight: 12, textAlign: 'right', userSelect: 'none' }}>{lineIdx + 1}</span>
          <span>{parts.length > 0 ? parts : <span style={{ color: '#E0E0E0' }}>{line}</span>}</span>
        </div>
      );
    });
  };

  // JSON syntax highlighting
  const highlightJSON = (json: string): React.ReactNode[] => {
    const lines = json.split('\n');
    return lines.map((line, lineIdx) => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIdx = 0;

      // Keys
      remaining = remaining.replace(/"([^"]+)":/g, (match, key) => {
        parts.push(<span key={`key-${lineIdx}-${keyIdx++}`} style={{ color: '#82AAFF' }}>&quot;{key}&quot;</span>);
        parts.push(<span key={`colon-${lineIdx}-${keyIdx++}`} style={{ color: '#89DDFF' }}>:</span>);
        return '\x00'.repeat(match.length);
      });

      // String values
      remaining = remaining.replace(/:\s*"([^"]*)"/g, (match, value) => {
        parts.push(<span key={`strval-${lineIdx}-${keyIdx++}`} style={{ color: '#C3E88D' }}>&quot;{value}&quot;</span>);
        return '\x00'.repeat(match.length);
      });

      // Numbers
      remaining = remaining.replace(/:\s*(\d+\.?\d*)/g, (match, num) => {
        parts.push(<span key={`num-${lineIdx}-${keyIdx++}`} style={{ color: '#F78C6C' }}>{num}</span>);
        return '\x00'.repeat(match.length);
      });

      // Booleans and null
      remaining = remaining.replace(/\b(true|false|null)\b/g, (match) => {
        parts.push(<span key={`bool-${lineIdx}-${keyIdx++}`} style={{ color: '#F78C6C' }}>{match}</span>);
        return '\x00'.repeat(match.length);
      });

      // Brackets and braces
      remaining = remaining.replace(/([{}\[\],])/g, (match) => {
        parts.push(<span key={`brace-${lineIdx}-${keyIdx++}`} style={{ color: '#89DDFF' }}>{match}</span>);
        return '\x00'.repeat(match.length);
      });

      // Handle remaining text
      const remainingText = remaining.replace(/\x00/g, '');
      if (remainingText.trim()) {
        parts.push(<span key={`txt-${lineIdx}-${keyIdx++}`} style={{ color: '#E0E0E0' }}>{remainingText}</span>);
      }

      return (
        <div key={`line-${lineIdx}`} style={{ display: 'flex' }}>
          <span style={{ color: '#4A5568', minWidth: 32, paddingRight: 12, textAlign: 'right', userSelect: 'none' }}>{lineIdx + 1}</span>
          <span>{parts.length > 0 ? parts : <span style={{ color: '#E0E0E0' }}>{line}</span>}</span>
        </div>
      );
    });
  };

  const codeLangs = [
    { id: 'shell', label: 'Shell' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
  ];

  const shellVariants = [
    { id: 'curl', label: 'cURL' },
    { id: 'httpie', label: 'HTTPie' },
    { id: 'wget', label: 'wget' },
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
        { id: 'errors', label: 'Error Codes' },
        { id: 'objects', label: 'Object Schemas' },
      ],
    },
  ];

  const getMethodStyle = (method?: string) => {
    switch (method) {
      case 'GET': return { bg: '#3B82F6', color: '#fff' };
      case 'POST': return { bg: '#22C55E', color: '#fff' };
      case 'PUT': return { bg: '#F59E0B', color: '#fff' };
      case 'DELETE': return { bg: '#EF4444', color: '#fff' };
      default: return { bg: '#6B7280', color: '#fff' };
    }
  };

  const endpoints: Record<string, { method: string; path: string; title: string; description: string }> = {
    route: { method: 'POST', path: '/api/v1/route', title: 'Route Prompt', description: 'Analyze a prompt and get the optimal model recommendation. The engine evaluates intent, domain, complexity, and returns a ranked list of models with confidence scores.' },
    models: { method: 'GET', path: '/api/v1/models', title: 'List Models', description: 'Retrieve the list of all available models with their capabilities, pricing, and performance metrics.' },
    'model-detail': { method: 'GET', path: '/api/v1/models/:id', title: 'Get Model', description: 'Retrieve detailed information about a specific model including full capabilities, pricing tiers, and performance benchmarks.' },
    analyze: { method: 'POST', path: '/api/v1/analyze', title: 'Analyze Prompt', description: 'Analyze a prompt without model selection. Returns detected intent, domain, complexity, and extracted keywords.' },
    feedback: { method: 'POST', path: '/api/v1/feedback', title: 'Submit Feedback', description: 'Submit feedback for a routing decision. This helps improve the engine\'s recommendations over time.' },
    health: { method: 'GET', path: '/api/v1/health', title: 'Health Check', description: 'Check the health status of the ADE engine and its dependent services.' },
  };

  const requestParams: Record<string, Array<{ name: string; type: string; required: boolean; description: string }>> = {
    route: [
      { name: 'prompt', type: 'string', required: true, description: 'The user prompt to analyze and route to the optimal model.' },
      { name: 'modality', type: 'string', required: false, description: 'Input modality type. Options: text, image, voice, text+image, text+voice. Defaults to text.' },
      { name: 'humanContext', type: 'object', required: false, description: 'Optional user context including mood, energy level, time, location, and preferences.' },
      { name: 'constraints', type: 'object', required: false, description: 'Optional constraints like max cost, max latency, or required capabilities.' },
      { name: 'conversationId', type: 'string', required: false, description: 'Conversation ID for maintaining model coherence across turns.' },
    ],
    models: [
      { name: 'provider', type: 'string', required: false, description: 'Filter by provider name: anthropic, openai, google.' },
      { name: 'capability', type: 'string', required: false, description: 'Filter by capability: vision, audio, streaming, functions.' },
      { name: 'limit', type: 'integer', required: false, description: 'Number of results per page. Default: 50, Max: 100.' },
      { name: 'offset', type: 'integer', required: false, description: 'Pagination offset. Default: 0.' },
    ],
    'model-detail': [
      { name: 'id', type: 'string', required: true, description: 'The unique model identifier (e.g., claude-sonnet-4-5, gpt-5-2).' },
    ],
    analyze: [
      { name: 'prompt', type: 'string', required: true, description: 'The prompt text to analyze.' },
      { name: 'modality', type: 'string', required: false, description: 'Input modality type. Defaults to text.' },
    ],
    feedback: [
      { name: 'decisionId', type: 'string', required: true, description: 'The decision ID returned from the route endpoint.' },
      { name: 'rating', type: 'integer', required: true, description: 'Rating from 1 (poor) to 5 (excellent).' },
      { name: 'selectedModel', type: 'string', required: false, description: 'Model ID if the user chose a different model than recommended.' },
      { name: 'comment', type: 'string', required: false, description: 'Optional feedback comment explaining the rating.' },
    ],
  };

  const codeExamples: Record<string, Record<string, string>> = {
    route: {
      shell: `curl -X POST https://api.ade.dev/v1/route \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a creative short story about a robot learning to paint",
    "modality": "text",
    "humanContext": {
      "preferences": {
        "preferredResponseStyle": "detailed"
      }
    }
  }'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/route', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Write a creative short story about a robot learning to paint',
    modality: 'text',
    humanContext: {
      preferences: {
        preferredResponseStyle: 'detailed'
      }
    }
  }),
});

const data = await response.json();
console.log(data.primaryModel.name);`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/route',
    headers={
        'Authorization': f'Bearer {ADE_API_KEY}',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'Write a creative short story about a robot learning to paint',
        'modality': 'text',
        'humanContext': {
            'preferences': {
                'preferredResponseStyle': 'detailed'
            }
        }
    }
)

data = response.json()
print(data['primaryModel']['name'])`,
    },
    models: {
      shell: `curl https://api.ade.dev/v1/models \\
  -H "Authorization: Bearer $ADE_API_KEY"`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/models', {
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
  },
});

const { models } = await response.json();
console.log(models);`,
      python: `import requests

response = requests.get(
    'https://api.ade.dev/v1/models',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'}
)

models = response.json()['models']
print(models)`,
    },
    'model-detail': {
      shell: `curl https://api.ade.dev/v1/models/claude-sonnet-4-5 \\
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
      shell: `curl -X POST https://api.ade.dev/v1/analyze \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Debug this Python function and optimize for performance"}'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Debug this Python function and optimize for performance'
  }),
});

const analysis = await response.json();
console.log(analysis);`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/analyze',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'},
    json={'prompt': 'Debug this Python function and optimize for performance'}
)

analysis = response.json()
print(analysis)`,
    },
    feedback: {
      shell: `curl -X POST https://api.ade.dev/v1/feedback \\
  -H "Authorization: Bearer $ADE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "decisionId": "dec_abc123xyz",
    "rating": 5,
    "comment": "Perfect model recommendation for my creative writing task"
  }'`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/feedback', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    decisionId: 'dec_abc123xyz',
    rating: 5,
    comment: 'Perfect model recommendation for my creative writing task'
  }),
});`,
      python: `import requests

response = requests.post(
    'https://api.ade.dev/v1/feedback',
    headers={'Authorization': f'Bearer {ADE_API_KEY}'},
    json={
        'decisionId': 'dec_abc123xyz',
        'rating': 5,
        'comment': 'Perfect model recommendation for my creative writing task'
    }
)`,
    },
    health: {
      shell: `curl https://api.ade.dev/v1/health`,
      javascript: `const response = await fetch('https://api.ade.dev/v1/health');
const health = await response.json();
console.log(health.status);`,
      python: `import requests

response = requests.get('https://api.ade.dev/v1/health')
health = response.json()
print(health['status'])`,
    },
    authentication: {
      shell: `curl https://api.ade.dev/v1/route \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hello, world!"}'`,
      javascript: `// Set your API key as an environment variable
const ADE_API_KEY = process.env.ADE_API_KEY;

const response = await fetch('https://api.ade.dev/v1/route', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${ADE_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt: 'Hello, world!' }),
});`,
      python: `import os
import requests

ADE_API_KEY = os.environ.get('ADE_API_KEY')

response = requests.post(
    'https://api.ade.dev/v1/route',
    headers={
        'Authorization': f'Bearer {ADE_API_KEY}',
        'Content-Type': 'application/json',
    },
    json={'prompt': 'Hello, world!'}
)`,
    },
  };

  const responseExamples: Record<string, string> = {
    route: `{
  "decisionId": "dec_abc123xyz789",
  "primaryModel": {
    "id": "claude-sonnet-4-5",
    "name": "Claude Sonnet 4.5",
    "provider": "Anthropic",
    "score": 0.912,
    "reasoning": {
      "summary": "Excellent match for creative writing with nuanced storytelling",
      "factors": [
        {
          "name": "Task Fitness",
          "score": 0.95,
          "weight": 0.50,
          "detail": "Strong creative writing capabilities"
        },
        {
          "name": "Cost Efficiency",
          "score": 0.78,
          "weight": 0.10,
          "detail": "Mid-range pricing"
        }
      ]
    }
  },
  "backupModels": [
    {
      "id": "claude-opus-4-5",
      "name": "Claude Opus 4.5",
      "provider": "Anthropic",
      "score": 0.889
    },
    {
      "id": "gpt-5-2",
      "name": "GPT-5.2",
      "provider": "OpenAI",
      "score": 0.856
    }
  ],
  "confidence": 0.87,
  "analysis": {
    "intent": "Creative",
    "domain": "Creative Arts",
    "complexity": "Standard",
    "tone": "Neutral",
    "keywords": ["story", "creative", "robot", "painting"]
  },
  "timing": {
    "totalMs": 24.5,
    "analysisMs": 8.3,
    "scoringMs": 12.8,
    "selectionMs": 3.4
  }
}`,
    models: `{
  "models": [
    {
      "id": "claude-opus-4-5",
      "name": "Claude Opus 4.5",
      "provider": "Anthropic",
      "description": "Most capable model for complex reasoning",
      "pricing": {
        "inputPer1k": 0.015,
        "outputPer1k": 0.075
      },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 32000,
        "supportsVision": true,
        "supportsStreaming": true
      }
    },
    {
      "id": "gpt-5-2",
      "name": "GPT-5.2",
      "provider": "OpenAI",
      "description": "Latest GPT model with enhanced reasoning",
      "pricing": {
        "inputPer1k": 0.01,
        "outputPer1k": 0.03
      },
      "capabilities": {
        "maxInputTokens": 128000,
        "maxOutputTokens": 16384,
        "supportsVision": true,
        "supportsStreaming": true
      }
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}`,
    'model-detail': `{
  "id": "claude-sonnet-4-5",
  "name": "Claude Sonnet 4.5",
  "provider": "Anthropic",
  "description": "Balanced model excelling at most tasks with great speed",
  "version": "4.5",
  "releaseDate": "2025-03-15",
  "pricing": {
    "inputPer1k": 0.003,
    "outputPer1k": 0.015,
    "cachedInputPer1k": 0.00075
  },
  "capabilities": {
    "maxInputTokens": 200000,
    "maxOutputTokens": 8192,
    "supportsVision": true,
    "supportsAudio": false,
    "supportsStreaming": true,
    "supportsFunctionCalling": true
  },
  "performance": {
    "avgLatencyMs": 800,
    "p95LatencyMs": 1500,
    "reliabilityPercent": 99.8
  },
  "strengths": ["creative_writing", "coding", "analysis"]
}`,
    analyze: `{
  "analysis": {
    "intent": "Coding",
    "domain": "Technology",
    "complexity": "Standard",
    "tone": "Neutral",
    "modality": "text",
    "keywords": ["debug", "python", "function", "optimize", "performance"],
    "estimatedTokens": 15,
    "language": "en"
  },
  "timing": {
    "analysisMs": 6.2
  }
}`,
    feedback: `{
  "success": true,
  "feedbackId": "fb_xyz789abc",
  "message": "Feedback recorded successfully. Thank you!"
}`,
    health: `{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-26T14:30:00.000Z",
  "uptime": 864000,
  "services": {
    "kv": "connected",
    "cache": "connected"
  },
  "stats": {
    "requestsProcessed": 125430,
    "avgLatencyMs": 18.5
  }
}`,
  };

  return (
    <div style={{ display: 'flex', marginLeft: -24, marginRight: -24, minHeight: 'calc(100vh - 96px)', background: '#fff' }}>
      {/* Left Sidebar - Dark Theme */}
      <aside style={{ width: 280, background: '#18181B', borderRight: '1px solid #27272A', padding: '24px 0', flexShrink: 0, overflowY: 'auto' }}>
        {/* Search */}
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#27272A', border: '1px solid #3F3F46', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease' }}>
            <Search style={{ width: 16, height: 16, color: '#71717A' }} />
            <span style={{ fontSize: 14, color: '#71717A', flex: 1 }}>Search</span>
            <span style={{ fontSize: 11, color: '#52525B', background: '#3F3F46', padding: '3px 8px', borderRadius: 5, fontWeight: 500 }}>⌘K</span>
          </div>
        </div>

        {/* Navigation */}
        {navSections.map((section) => (
          <div key={section.id} style={{ marginBottom: 4 }}>
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#A1A1AA', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              {section.label}
              <ChevronDown style={{ width: 14, height: 14, color: '#52525B', transform: expandedSections[section.id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {expandedSections[section.id] && (
              <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                {section.items.map((item: { id: string; label: string; method?: string }) => {
                  const methodStyle = getMethodStyle(item.method);
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', marginBottom: 2,
                        background: isActive ? '#27272A' : 'transparent',
                        border: 'none', borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 14, color: isActive ? '#FAFAFA' : '#A1A1AA',
                        fontWeight: isActive ? 500 : 400, textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#27272A40'; e.currentTarget.style.color = '#E4E4E7'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A1A1AA'; }}
                    >
                      {item.method && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '4px 6px', borderRadius: 4,
                          background: methodStyle.bg, color: methodStyle.color,
                          minWidth: 38, textAlign: 'center', letterSpacing: '0.02em',
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

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', minWidth: 0 }}>
        {/* Documentation */}
        <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', borderRight: '1px solid #E5E5E5' }}>

          {/* Introduction */}
          {activeSection === 'introduction' && (
            <div>
              {/* Hero Section */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderRadius: 20, marginBottom: 16 }}>
                  <Sparkles style={{ width: 14, height: 14, color: '#6366F1' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6366F1', letterSpacing: '0.02em' }}>API REFERENCE</span>
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 700, color: '#111', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  Araviel Decision Engine
                </h1>
                <p style={{ fontSize: 18, color: '#4B5563', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 640 }}>
                  The intelligent LLM routing API that analyzes your prompts and automatically selects the optimal model based on task requirements, cost efficiency, and performance characteristics.
                </p>
              </div>

              {/* Quick Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Zap style={{ width: 18, height: 18, color: '#F59E0B' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Fast Routing</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Sub-50ms routing decisions with intelligent caching</p>
                </div>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Layers style={{ width: 18, height: 18, color: '#6366F1' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Multi-Modal</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Supports text, vision, audio, and combined inputs</p>
                </div>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Brain style={{ width: 18, height: 18, color: '#8B5CF6' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>10+ Models</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>Anthropic, OpenAI, and Google models supported</p>
                </div>
              </div>

              {/* Base URL */}
              <div style={{ background: 'linear-gradient(135deg, #18181B, #27272A)', borderRadius: 12, padding: 24, marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base URL</span>
                  <button
                    onClick={() => copyToClipboard('https://api.ade.dev/v1', 'base-url')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', fontSize: 11, color: '#A1A1AA', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {copiedCode === 'base-url' ? <><Check style={{ width: 12, height: 12, color: '#22C55E' }} /> Copied</> : <><Copy style={{ width: 12, height: 12 }} /> Copy</>}
                  </button>
                </div>
                <code style={{ fontSize: 16, color: '#22C55E', fontFamily: '"SF Mono", "Monaco", "Inconsolata", monospace', display: 'block' }}>
                  https://api.ade.dev/v1
                </code>
              </div>

              {/* How It Works */}
              <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111', margin: '0 0 8px', letterSpacing: '-0.01em' }}>How it works</h2>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' }}>ADE uses a three-step process to select the best model for your request.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                {/* Vertical line connector */}
                <div style={{ position: 'absolute', left: 19, top: 40, bottom: 40, width: 2, background: 'linear-gradient(to bottom, #E5E5E5, #E5E5E5)', zIndex: 0 }} />

                {[
                  { num: '1', title: 'Analyze', desc: 'The engine parses your prompt to detect intent (coding, creative, analysis), domain context, complexity level, and communication tone.', color: '#3B82F6' },
                  { num: '2', title: 'Score', desc: 'Each available model is scored across 6 weighted factors: Task Fitness (40%), Modality (15%), Cost (15%), Speed (10%), User Preference (10%), and Coherence (10%).', color: '#8B5CF6' },
                  { num: '3', title: 'Select', desc: 'Models are ranked by composite score. The top model is returned as the primary recommendation with 2 backup alternatives and full reasoning.', color: '#22C55E' },
                ].map((step) => (
                  <div key={step.num} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '16px 0', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 40, height: 40, background: step.color, color: '#fff', borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0,
                      boxShadow: `0 4px 12px ${step.color}40`
                    }}>
                      {step.num}
                    </div>
                    <div style={{ paddingTop: 8, flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 600, color: '#111', marginBottom: 6 }}>{step.title}</div>
                      <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supported Providers */}
              <div style={{ marginTop: 40, padding: 24, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E5E5' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Supported Providers</h3>
                <div style={{ display: 'flex', gap: 24 }}>
                  {[
                    { name: 'Anthropic', models: 'Claude Opus 4.5, Sonnet 4, Haiku 3.5', color: '#D97706' },
                    { name: 'OpenAI', models: 'GPT-4.1, GPT-4.1 Mini, GPT-4o, o4-mini', color: '#10B981' },
                    { name: 'Google', models: 'Gemini 2.5 Pro, Flash, Flash-Lite', color: '#3B82F6' },
                  ].map((provider) => (
                    <div key={provider.name} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: provider.color }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{provider.name}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{provider.models}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Authentication */}
          {activeSection === 'authentication' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 16px', lineHeight: 1.2 }}>Authentication</h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                ADE uses API keys to authenticate requests. Include your API key in the Authorization header of all requests.
              </p>

              <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: 20, marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertCircle style={{ width: 20, height: 20, color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Keep your API key secure</div>
                    <div style={{ fontSize: 14, color: '#A16207', lineHeight: 1.6 }}>
                      Never share your API key or expose it in client-side code. Use environment variables to store your key securely.
                    </div>
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Request Headers</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Header</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E5E5' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '14px 20px', borderBottom: '1px solid #E5E5E5', verticalAlign: 'top' }}>
                        <code style={{ fontSize: 14, color: '#7C3AED', fontFamily: 'ui-monospace, monospace' }}>Authorization</code>
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#DC2626', fontWeight: 600 }}>required</span>
                      </td>
                      <td style={{ padding: '14px 20px', borderBottom: '1px solid #E5E5E5', fontSize: 14, color: '#4B5563' }}>Bearer YOUR_API_KEY</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '14px 20px', verticalAlign: 'top' }}>
                        <code style={{ fontSize: 14, color: '#7C3AED', fontFamily: 'ui-monospace, monospace' }}>Content-Type</code>
                        <span style={{ marginLeft: 8, fontSize: 11, color: '#DC2626', fontWeight: 600 }}>required</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#4B5563' }}>application/json (for POST requests)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Endpoint Pages */}
          {endpoints[activeSection] && (
            <div>
              {/* Breadcrumb + Title */}
              <div style={{ marginBottom: 8, fontSize: 13, color: '#6B7280' }}>
                Endpoints
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 16px', lineHeight: 1.2 }}>
                {endpoints[activeSection].title}
              </h1>

              {/* Method + Path */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6,
                  background: getMethodStyle(endpoints[activeSection].method).bg,
                  color: getMethodStyle(endpoints[activeSection].method).color,
                }}>
                  {endpoints[activeSection].method}
                </span>
                <code style={{ fontSize: 15, color: '#374151', fontFamily: 'ui-monospace, monospace' }}>
                  {endpoints[activeSection].path}
                </code>
              </div>

              {/* Description */}
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                {endpoints[activeSection].description}
              </p>

              {/* Request Section */}
              {requestParams[activeSection] && (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Request</h2>

                  {requestParams[activeSection] && (
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                        {activeSection === 'models' || activeSection === 'model-detail' ? 'Query Parameters' : 'Body Parameters'}
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: '#6B7280' }}>application/json</span>
                      </div>

                      <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
                        {requestParams[activeSection].map((param, idx) => (
                          <div
                            key={param.name}
                            style={{
                              display: 'flex', alignItems: 'flex-start', padding: '16px 20px',
                              borderBottom: idx < requestParams[activeSection]!.length - 1 ? '1px solid #E5E5E5' : 'none',
                              background: '#fff',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <code style={{ fontSize: 14, color: '#7C3AED', fontFamily: 'ui-monospace, monospace', fontWeight: 500 }}>{param.name}</code>
                                <span style={{ fontSize: 13, color: '#6B7280' }}>{param.type}</span>
                              </div>
                              <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>{param.description}</div>
                            </div>
                            {param.required && (
                              <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>required</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Responses Section */}
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Responses</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleResponse(activeSection)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                    background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#22C55E' }}>200</span>
                  <span style={{ fontSize: 15, color: '#374151' }}>OK</span>
                  <ChevronDown style={{ marginLeft: 'auto', width: 18, height: 18, color: '#9CA3AF', transform: expandedResponses[activeSection] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {expandedResponses[activeSection] && (
                  <div style={{ borderTop: '1px solid #E5E5E5', padding: 20, background: '#F9FAFB' }}>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>application/json</div>
                    <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.5 }}>
                      {activeSection === 'route' && 'Returns the routing decision with primary and backup model recommendations.'}
                      {activeSection === 'models' && 'Returns a paginated list of available models.'}
                      {activeSection === 'model-detail' && 'Returns detailed model information.'}
                      {activeSection === 'analyze' && 'Returns the prompt analysis results.'}
                      {activeSection === 'feedback' && 'Returns confirmation of feedback submission.'}
                      {activeSection === 'health' && 'Returns the health status of all services.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {activeSection === 'errors' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 16px', lineHeight: 1.2 }}>Error Codes</h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                ADE uses conventional HTTP response codes to indicate success or failure of API requests.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>HTTP Status Codes</h2>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
                {[
                  { code: '200', status: 'OK', desc: 'Request succeeded' },
                  { code: '400', status: 'Bad Request', desc: 'Invalid request parameters' },
                  { code: '401', status: 'Unauthorized', desc: 'Missing or invalid API key' },
                  { code: '403', status: 'Forbidden', desc: 'API key lacks permissions' },
                  { code: '404', status: 'Not Found', desc: 'Resource not found' },
                  { code: '429', status: 'Too Many Requests', desc: 'Rate limit exceeded' },
                  { code: '500', status: 'Internal Error', desc: 'Server error' },
                ].map((item, idx) => (
                  <div
                    key={item.code}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '14px 20px',
                      borderBottom: idx < 6 ? '1px solid #E5E5E5' : 'none', background: '#fff',
                    }}
                  >
                    <code style={{
                      fontSize: 14, fontWeight: 600, width: 50,
                      color: item.code.startsWith('2') ? '#059669' : item.code.startsWith('4') ? '#D97706' : '#DC2626',
                    }}>
                      {item.code}
                    </code>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#374151', width: 160 }}>{item.status}</span>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>{item.desc}</span>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>Error Response Format</h2>
              <div style={{ background: '#18181B', borderRadius: 12, padding: 20 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "error": {
    "code": "invalid_request",
    "message": "The 'prompt' field is required",
    "type": "validation_error",
    "param": "prompt"
  }
}`}</pre>
              </div>
            </div>
          )}

          {/* Objects */}
          {activeSection === 'objects' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 16px', lineHeight: 1.2 }}>Object Schemas</h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                Reference documentation for the main object types used in the API.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>humanContext</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Optional context about the user&apos;s current state and preferences.</p>
              <div style={{ background: '#18181B', borderRadius: 12, padding: 20, marginBottom: 32 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "emotionalState": {
    "mood": "happy" | "neutral" | "stressed" | "frustrated",
    "energyLevel": "low" | "moderate" | "high"
  },
  "temporalContext": {
    "localTime": "14:30",
    "timezone": "America/New_York",
    "isWorkingHours": true
  },
  "environmentalContext": {
    "weather": "sunny" | "cloudy" | "rainy",
    "location": "United States"
  },
  "preferences": {
    "preferredResponseStyle": "concise" | "detailed",
    "preferredResponseLength": "short" | "medium" | "long",
    "preferredModels": ["claude-opus-4-5"],
    "avoidModels": ["model-id"]
  }
}`}</pre>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>constraints</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Optional constraints to filter models before scoring.</p>
              <div style={{ background: '#18181B', borderRadius: 12, padding: 20 }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#E5E5E5', lineHeight: 1.6 }}>{`{
  "maxCostPer1kTokens": 0.01,
  "maxLatencyMs": 2000,
  "allowedModels": ["claude-sonnet-4-5", "gpt-5-2"],
  "excludedModels": ["gemini-2-5-flash"],
  "requireVision": true,
  "requireAudio": false,
  "requireStreaming": true
}`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Code Panel - Dark */}
        <aside style={{ width: 480, background: '#0F0F0F', padding: '0', overflowY: 'auto', flexShrink: 0 }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #262626', background: '#141414' }}>
            {/* Language Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', marginRight: 16 }}>Request</span>
              <div style={{ display: 'flex', background: '#262626', borderRadius: 8, padding: 3 }}>
                {codeLangs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveCodeLang(lang.id)}
                    style={{
                      padding: '6px 14px', fontSize: 13, fontWeight: 500,
                      color: activeCodeLang === lang.id ? '#FAFAFA' : '#71717A',
                      background: activeCodeLang === lang.id ? '#3F3F46' : 'transparent',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Content */}
          <div style={{ padding: '24px' }}>
            {/* Shell Variants (when shell selected) */}
            {activeCodeLang === 'shell' && (
              <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                {shellVariants.map((variant, idx) => (
                  <span
                    key={variant.id}
                    style={{
                      fontSize: 12, fontWeight: 500, color: idx === 0 ? '#FAFAFA' : '#52525B',
                      background: idx === 0 ? '#27272A' : 'transparent',
                      padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                      border: idx === 0 ? '1px solid #3F3F46' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {variant.label}
                  </span>
                ))}
              </div>
            )}

          {/* Code Example */}
          {codeExamples[activeSection] && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>Example request</span>
                <button
                  onClick={() => copyToClipboard(codeExamples[activeSection]?.[activeCodeLang] || '', `${activeSection}-code`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    fontSize: 12, color: '#A1A1AA', background: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: 6, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#3D3D3D'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#2D2D2D'; e.currentTarget.style.color = '#A1A1AA'; }}
                >
                  {copiedCode === `${activeSection}-code` ? (
                    <><Check style={{ width: 14, height: 14, color: '#22C55E' }} /> Copied</>
                  ) : (
                    <><Copy style={{ width: 14, height: 14 }} /> Copy</>
                  )}
                </button>
              </div>
              <div style={{ background: '#0D0D0D', borderRadius: 10, padding: 16, overflowX: 'auto', border: '1px solid #262626' }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace', lineHeight: 1.8 }}>
                  {highlightCode(codeExamples[activeSection]?.[activeCodeLang] || '', activeCodeLang)}
                </pre>
              </div>
            </div>
          )}

          {/* Response Section */}
          {responseExamples[activeSection] && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA' }}>Response</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22C55E', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                    200
                  </span>
                  <button
                    onClick={() => copyToClipboard(responseExamples[activeSection] || '', `${activeSection}-response`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
                      background: '#2D2D2D', border: '1px solid #3D3D3D', borderRadius: 6, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#3D3D3D'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#2D2D2D'; }}
                  >
                    {copiedCode === `${activeSection}-response` ? (
                      <Check style={{ width: 14, height: 14, color: '#22C55E' }} />
                    ) : (
                      <Copy style={{ width: 14, height: 14, color: '#A1A1AA' }} />
                    )}
                  </button>
                </div>
              </div>
              <div style={{ background: '#0D0D0D', borderRadius: 10, padding: 16, overflowX: 'auto', maxHeight: 500, border: '1px solid #262626' }}>
                <pre style={{ margin: 0, fontSize: 13, fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Fira Mono", monospace', lineHeight: 1.7 }}>
                  {highlightJSON(responseExamples[activeSection] || '')}
                </pre>
              </div>
            </div>
          )}

          {/* Show helpful text for non-endpoint sections */}
          {!codeExamples[activeSection] && activeSection !== 'authentication' && (
            <div style={{ color: '#52525B', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
              <div style={{ width: 48, height: 48, background: '#1F1F1F', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BookOpen style={{ width: 24, height: 24, color: '#3F3F46' }} />
              </div>
              Select an endpoint to see code examples
            </div>
          )}
          </div>
        </aside>
      </main>
    </div>
  );
}
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
