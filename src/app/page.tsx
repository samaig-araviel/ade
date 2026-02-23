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
  services: { engine: string; store: string };
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
  const [activeSection, setActiveSection] = useState('route');
  const [activeCodeLang, setActiveCodeLang] = useState('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Language tabs like Stripe
  const codeLangs = [
    { id: 'curl', label: 'curl' },
    { id: 'node', label: 'Node' },
    { id: 'python', label: 'Python' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'go', label: 'Go' },
  ];

  // Navigation structure like Stripe
  const navSections = [
    {
      category: 'GETTING STARTED',
      items: [
        { id: 'introduction', label: 'Introduction' },
        { id: 'authentication', label: 'Authentication' },
      ],
    },
    {
      category: 'CORE RESOURCES',
      items: [
        { id: 'route', label: 'Route' },
        { id: 'models', label: 'Models' },
        { id: 'analyze', label: 'Analyze' },
        { id: 'feedback', label: 'Feedback' },
      ],
    },
    {
      category: 'OTHER',
      items: [
        { id: 'health', label: 'Health' },
        { id: 'errors', label: 'Errors' },
      ],
    },
  ];

  // Endpoint definitions
  const endpoints: Record<string, {
    method: string;
    path: string;
    title: string;
    description: string;
    descriptionCode?: string;
    params: Array<{ name: string; type: string; required: boolean; description: string; descriptionCode?: string }>;
  }> = {
    route: {
      method: 'POST',
      path: '/v1/route',
      title: 'Route a prompt',
      description: 'To route a prompt to the optimal model, you create a ',
      descriptionCode: 'RouteRequest',
      params: [
        { name: 'prompt', type: 'string', required: true, description: 'The user prompt to analyze and route to the optimal model. This is the text that will be sent to the selected LLM.' },
        { name: 'modality', type: 'string', required: false, description: 'Input modality type. Options: ', descriptionCode: 'text, image, voice, text+image, text+voice' },
        { name: 'humanContext', type: 'object', required: false, description: 'Optional context about the user including mood, energy level, preferences, and temporal context.' },
        { name: 'constraints', type: 'object', required: false, description: 'Optional constraints like ', descriptionCode: 'maxCostPer1kTokens, maxLatencyMs, requireVision' },
        { name: 'conversationId', type: 'string', required: false, description: 'Conversation ID for maintaining model coherence across conversation turns.' },
      ],
    },
    models: {
      method: 'GET',
      path: '/v1/models',
      title: 'List all models',
      description: 'Returns a list of all available models with their capabilities, pricing, and performance metrics.',
      params: [
        { name: 'provider', type: 'string', required: false, description: 'Filter by provider: ', descriptionCode: 'anthropic, openai, google' },
        { name: 'capability', type: 'string', required: false, description: 'Filter by capability: ', descriptionCode: 'vision, audio, streaming' },
        { name: 'limit', type: 'integer', required: false, description: 'Number of results per page. Default: 50, Max: 100.' },
      ],
    },
    analyze: {
      method: 'POST',
      path: '/v1/analyze',
      title: 'Analyze a prompt',
      description: 'Analyze a prompt without model selection. Returns the detected intent, domain, complexity, and extracted keywords.',
      params: [
        { name: 'prompt', type: 'string', required: true, description: 'The prompt text to analyze.' },
        { name: 'modality', type: 'string', required: false, description: 'Input modality type. Defaults to ', descriptionCode: 'text' },
      ],
    },
    feedback: {
      method: 'POST',
      path: '/v1/feedback',
      title: 'Submit feedback',
      description: 'Submit feedback for a routing decision. This helps improve the engine\'s recommendations over time.',
      params: [
        { name: 'decisionId', type: 'string', required: true, description: 'The decision ID returned from the ', descriptionCode: '/v1/route' },
        { name: 'rating', type: 'integer', required: true, description: 'Rating from 1 (poor) to 5 (excellent).' },
        { name: 'selectedModel', type: 'string', required: false, description: 'Model ID if the user chose a different model than recommended.' },
        { name: 'comment', type: 'string', required: false, description: 'Optional feedback comment.' },
      ],
    },
    health: {
      method: 'GET',
      path: '/v1/health',
      title: 'Health check',
      description: 'Check the health status of the ADE engine and its dependent services. No authentication required.',
      params: [],
    },
  };

  // Code examples with Stripe-like formatting
  const codeExamples: Record<string, Record<string, string>> = {
    route: {
      curl: `curl https://api.ade.dev/v1/route \\
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \\
  -d prompt="Write a creative story about AI" \\
  -d modality=text \\
  -d "humanContext[preferences][style]=detailed"`,
      node: `const ade = require('ade')('sk_test_...');

const decision = await ade.route.create({
  prompt: 'Write a creative story about AI',
  modality: 'text',
  humanContext: {
    preferences: { style: 'detailed' }
  }
});`,
      python: `import ade
ade.api_key = "sk_test_..."

decision = ade.Route.create(
  prompt="Write a creative story about AI",
  modality="text",
  human_context={
    "preferences": {"style": "detailed"}
  }
)`,
      ruby: `require 'ade'
Ade.api_key = 'sk_test_...'

decision = Ade::Route.create({
  prompt: 'Write a creative story about AI',
  modality: 'text',
  human_context: {
    preferences: { style: 'detailed' }
  }
})`,
      go: `ade.Key = "sk_test_..."

decision, _ := route.New(&ade.RouteParams{
  Prompt:   ade.String("Write a creative story about AI"),
  Modality: ade.String("text"),
})`,
    },
    models: {
      curl: `curl https://api.ade.dev/v1/models \\
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc:`,
      node: `const ade = require('ade')('sk_test_...');

const models = await ade.models.list();`,
      python: `import ade
ade.api_key = "sk_test_..."

models = ade.Model.list()`,
      ruby: `require 'ade'
Ade.api_key = 'sk_test_...'

models = Ade::Model.list()`,
      go: `ade.Key = "sk_test_..."

models, _ := model.List(&ade.ModelListParams{})`,
    },
    analyze: {
      curl: `curl https://api.ade.dev/v1/analyze \\
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \\
  -d prompt="Debug this Python function"`,
      node: `const ade = require('ade')('sk_test_...');

const analysis = await ade.analyze.create({
  prompt: 'Debug this Python function'
});`,
      python: `import ade
ade.api_key = "sk_test_..."

analysis = ade.Analyze.create(
  prompt="Debug this Python function"
)`,
      ruby: `require 'ade'
Ade.api_key = 'sk_test_...'

analysis = Ade::Analyze.create({
  prompt: 'Debug this Python function'
})`,
      go: `ade.Key = "sk_test_..."

analysis, _ := analyze.New(&ade.AnalyzeParams{
  Prompt: ade.String("Debug this Python function"),
})`,
    },
    feedback: {
      curl: `curl https://api.ade.dev/v1/feedback \\
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \\
  -d decisionId="dec_1MtIR92eZvKYlo2C" \\
  -d rating=5 \\
  -d comment="Perfect recommendation"`,
      node: `const ade = require('ade')('sk_test_...');

const feedback = await ade.feedback.create({
  decisionId: 'dec_1MtIR92eZvKYlo2C',
  rating: 5,
  comment: 'Perfect recommendation'
});`,
      python: `import ade
ade.api_key = "sk_test_..."

feedback = ade.Feedback.create(
  decision_id="dec_1MtIR92eZvKYlo2C",
  rating=5,
  comment="Perfect recommendation"
)`,
      ruby: `require 'ade'
Ade.api_key = 'sk_test_...'

feedback = Ade::Feedback.create({
  decision_id: 'dec_1MtIR92eZvKYlo2C',
  rating: 5,
  comment: 'Perfect recommendation'
})`,
      go: `ade.Key = "sk_test_..."

feedback, _ := feedback.New(&ade.FeedbackParams{
  DecisionID: ade.String("dec_1MtIR92eZvKYlo2C"),
  Rating:     ade.Int64(5),
})`,
    },
    health: {
      curl: `curl https://api.ade.dev/v1/health`,
      node: `const response = await fetch('https://api.ade.dev/v1/health');
const health = await response.json();`,
      python: `import requests

response = requests.get('https://api.ade.dev/v1/health')
health = response.json()`,
      ruby: `require 'net/http'

uri = URI('https://api.ade.dev/v1/health')
response = Net::HTTP.get(uri)`,
      go: `resp, _ := http.Get("https://api.ade.dev/v1/health")`,
    },
    authentication: {
      curl: `curl https://api.ade.dev/v1/route \\
  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \\
  -d prompt="Hello, world!"`,
      node: `const ade = require('ade')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

// All API calls will use your key automatically`,
      python: `import ade
ade.api_key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"

# All API calls will use your key automatically`,
      ruby: `require 'ade'
Ade.api_key = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'

# All API calls will use your key automatically`,
      go: `import "github.com/ade/ade-go"

ade.Key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"`,
    },
  };

  // Response examples
  const responseExamples: Record<string, string> = {
    route: `{
  "id": "dec_1DpeX82eZvKYlo2CmYWvyOvp",
  "object": "decision",
  "primaryModel": {
    "id": "claude-sonnet-4-5",
    "name": "Claude Sonnet 4.5",
    "provider": "anthropic",
    "score": 0.912
  },
  "backupModels": [
    {
      "id": "claude-opus-4-5",
      "score": 0.889
    }
  ],
  "confidence": 0.87,
  "analysis": {
    "intent": "creative",
    "domain": "creative_arts",
    "complexity": "standard"
  },
  "created": 1546792290,
  "timing": {
    "totalMs": 24.5
  }
}`,
    models: `{
  "object": "list",
  "data": [
    {
      "id": "claude-opus-4-5",
      "object": "model",
      "name": "Claude Opus 4.5",
      "provider": "anthropic",
      "created": 1686935002,
      "capabilities": {
        "vision": true,
        "audio": false
      }
    },
    {
      "id": "gpt-4-1",
      "object": "model",
      "name": "GPT-4.1",
      "provider": "openai",
      "created": 1687882411
    }
  ],
  "has_more": false
}`,
    analyze: `{
  "id": "anl_82eZvKYlo2CmYWvy",
  "object": "analysis",
  "intent": "coding",
  "domain": "technology",
  "complexity": "standard",
  "tone": "neutral",
  "keywords": ["debug", "python", "function"],
  "created": 1546792290
}`,
    feedback: `{
  "id": "fb_xyz789abc123",
  "object": "feedback",
  "success": true,
  "message": "Feedback recorded successfully"
}`,
    health: `{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-26T14:30:00Z",
  "services": {
    "kv": "connected",
    "cache": "connected"
  }
}`,
  };

  // Syntax highlighting for curl commands (Stripe style)
  const highlightCurl = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line) => {
      let highlighted = line;

      // curl command
      highlighted = highlighted.replace(/^(curl)(\s)/, '<span class="hl-cmd">$1</span>$2');

      // URLs
      highlighted = highlighted.replace(/(https:\/\/[^\s\\]+)/g, '<span class="hl-url">$1</span>');

      // Flags (-u, -d, -H, -X)
      highlighted = highlighted.replace(/\s(-u|-d|-H|-X)(\s)/g, ' <span class="hl-flag">$1</span>$2');

      // API key (cyan color like Stripe)
      highlighted = highlighted.replace(/(sk_test_[a-zA-Z0-9]+)(:?)/g, '<span class="hl-key">$1</span>$2');

      // Parameter names before = (cyan)
      highlighted = highlighted.replace(/\s([a-zA-Z_\[\]\.]+)(=)/g, ' <span class="hl-param">$1</span><span class="hl-eq">=</span>');

      // Values after = (without quotes)
      highlighted = highlighted.replace(/=([a-zA-Z0-9_]+)(\s|\\|$)/g, '=<span class="hl-value">$1</span>$2');

      // String values in double quotes (yellow/green)
      highlighted = highlighted.replace(/"([^"]+)"/g, '<span class="hl-quote">"</span><span class="hl-string">$1</span><span class="hl-quote">"</span>');

      return highlighted;
    }).join('\n');
  };

  // Syntax highlighting for JSON (Stripe style)
  const highlightJSON = (json: string) => {
    let result = json;

    // Keys (cyan)
    result = result.replace(/"([^"]+)"(\s*:)/g, '<span class="hl-quote">"</span><span class="hl-json-key">$1</span><span class="hl-quote">"</span>$2');

    // String values (yellow)
    result = result.replace(/:(\s*)"([^"]+)"/g, ':$1<span class="hl-quote">"</span><span class="hl-json-string">$2</span><span class="hl-quote">"</span>');

    // Numbers (orange)
    result = result.replace(/:(\s*)(\d+\.?\d*)(,|\s|\n|}|])/g, ':$1<span class="hl-json-number">$2</span>$3');

    // Booleans (pink)
    result = result.replace(/:\s*(true|false)/g, ': <span class="hl-json-bool">$1</span>');

    // null
    result = result.replace(/:\s*(null)/g, ': <span class="hl-json-null">$1</span>');

    return result;
  };

  const currentEndpoint = endpoints[activeSection];
  const currentCode = codeExamples[activeSection];
  const currentResponse = responseExamples[activeSection];

  return (
    <div style={{ display: 'flex', marginLeft: -24, marginRight: -24, minHeight: 'calc(100vh - 96px)' }}>
      {/* Left Sidebar - Light theme like Stripe */}
      <aside style={{
        width: 240,
        background: '#FAFAFA',
        borderRight: '1px solid #E5E7EB',
        padding: '24px 0',
        flexShrink: 0,
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} style={{ marginBottom: 24 }}>
            {/* Category Header */}
            <div style={{
              padding: '0 20px',
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 600,
              color: '#6B7280',
              letterSpacing: '0.05em'
            }}>
              {section.category}
            </div>

            {/* Items */}
            {section.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'block',
                    padding: '8px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '2px solid #635BFF' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: isActive ? '#635BFF' : '#374151',
                    fontWeight: isActive ? 500 : 400,
                    textAlign: 'left',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Main Content - White background like Stripe */}
      <main style={{
        flex: 1,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ maxWidth: 640, padding: '40px 48px' }}>

          {/* Introduction Page */}
          {activeSection === 'introduction' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                API Reference
              </h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                The ADE API is organized around REST. Our API has predictable resource-oriented URLs,
                accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.
              </p>

              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '32px 0 12px' }}>Base URL</h2>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px 16px' }}>
                <code style={{ fontSize: 14, color: '#1a1a1a', fontFamily: 'SF Mono, Monaco, monospace' }}>
                  https://api.ade.dev
                </code>
              </div>
            </div>
          )}

          {/* Authentication Page */}
          {activeSection === 'authentication' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Authentication
              </h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 24px' }}>
                The ADE API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard.
              </p>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 24px' }}>
                Authentication is performed via HTTP Basic Auth. Provide your API key as the basic auth username value.
                You do not need to provide a password.
              </p>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 24px' }}>
                All API requests must be made over HTTPS. Calls made over plain HTTP will fail.
                API requests without authentication will also fail.
              </p>
            </div>
          )}

          {/* Errors Page */}
          {activeSection === 'errors' && (
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Errors
              </h1>
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                ADE uses conventional HTTP response codes to indicate the success or failure of an API request.
              </p>

              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', margin: '32px 0 16px', letterSpacing: '0.05em' }}>
                HTTP STATUS CODES
              </h2>

              <div style={{ borderTop: '1px solid #E5E7EB' }}>
                {[
                  { code: '200', status: 'OK', desc: 'Everything worked as expected.' },
                  { code: '400', status: 'Bad Request', desc: 'The request was unacceptable, often due to missing a required parameter.' },
                  { code: '401', status: 'Unauthorized', desc: 'No valid API key provided.' },
                  { code: '403', status: 'Forbidden', desc: 'The API key doesn\'t have permissions to perform the request.' },
                  { code: '404', status: 'Not Found', desc: 'The requested resource doesn\'t exist.' },
                  { code: '429', status: 'Too Many Requests', desc: 'Too many requests hit the API too quickly.' },
                  { code: '500', status: 'Server Error', desc: 'Something went wrong on ADE\'s end.' },
                ].map((error) => (
                  <div key={error.code} style={{
                    display: 'flex',
                    padding: '16px 0',
                    borderBottom: '1px solid #E5E7EB',
                    gap: 16
                  }}>
                    <code style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: error.code.startsWith('2') ? '#059669' : error.code.startsWith('4') ? '#D97706' : '#DC2626',
                      fontFamily: 'SF Mono, Monaco, monospace',
                      minWidth: 50
                    }}>
                      {error.code}
                    </code>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 4 }}>{error.status}</div>
                      <div style={{ fontSize: 14, color: '#6B7280' }}>{error.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endpoint Pages */}
          {currentEndpoint && (
            <div>
              {/* Title */}
              <h1 style={{ fontSize: 32, fontWeight: 600, color: '#1a1a1a', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                {currentEndpoint.title}
              </h1>

              {/* Description */}
              <p style={{ fontSize: 16, color: '#4B5563', lineHeight: 1.7, margin: '0 0 32px' }}>
                {currentEndpoint.description}
                {currentEndpoint.descriptionCode && (
                  <code style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 14,
                    fontFamily: 'SF Mono, Monaco, monospace'
                  }}>
                    {currentEndpoint.descriptionCode}
                  </code>
                )}
                {currentEndpoint.descriptionCode && ' object.'}
              </p>

              {/* Arguments Section */}
              {currentEndpoint.params.length > 0 && (
                <>
                  <h2 style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#6B7280',
                    margin: '0 0 20px',
                    letterSpacing: '0.05em'
                  }}>
                    ARGUMENTS
                  </h2>

                  <div style={{ borderTop: '1px solid #E5E7EB' }}>
                    {currentEndpoint.params.map((param) => (
                      <div key={param.name} style={{
                        display: 'flex',
                        padding: '20px 0',
                        borderBottom: '1px solid #E5E7EB',
                        gap: 24
                      }}>
                        {/* Parameter name and required badge */}
                        <div style={{ width: 140, flexShrink: 0 }}>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1a1a1a',
                            marginBottom: 4,
                            fontFamily: 'SF Mono, Monaco, monospace'
                          }}>
                            {param.name}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: param.required ? '#DC6803' : '#6B7280',
                            fontWeight: param.required ? 600 : 400,
                            textTransform: param.required ? 'uppercase' : 'none'
                          }}>
                            {param.required ? 'REQUIRED' : 'optional'}
                          </div>
                        </div>

                        {/* Description */}
                        <div style={{ flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 1.6 }}>
                          {param.description}
                          {param.descriptionCode && (
                            <code style={{
                              background: '#FEE2E2',
                              color: '#991B1B',
                              padding: '1px 5px',
                              borderRadius: 3,
                              fontSize: 13,
                              fontFamily: 'SF Mono, Monaco, monospace'
                            }}>
                              {param.descriptionCode}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Right Code Panel - Light mode */}
      <aside style={{
        width: 480,
        background: '#F8F9FA',
        flexShrink: 0,
        overflowY: 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Language Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          gap: 4
        }}>
          {codeLangs.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setActiveCodeLang(lang.id)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: activeCodeLang === lang.id ? '#FFFFFF' : '#4B5563',
                background: activeCodeLang === lang.id ? '#4F46E5' : 'transparent',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Endpoint badge */}
          {currentEndpoint && (
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: currentEndpoint.method === 'POST' ? '#16A34A' : '#2563EB',
                fontFamily: '"SF Mono", Monaco, "Menlo", monospace'
              }}>
                {currentEndpoint.method}
              </span>
              <span style={{
                fontSize: 13,
                color: '#374151',
                marginLeft: 10,
                fontFamily: '"SF Mono", Monaco, "Menlo", monospace'
              }}>
                {currentEndpoint.path}
              </span>
            </div>
          )}

          {/* Example Request */}
          {currentCode && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Example Request
              </div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: '16px 18px',
                border: '1px solid #E5E7EB',
                position: 'relative'
              }}>
                <button
                  onClick={() => copyToClipboard(currentCode[activeCodeLang] || '', 'request')}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '5px 10px',
                    fontSize: 11,
                    color: '#6B7280',
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode === 'request' ? 'Copied!' : 'Copy'}
                </button>
                <pre style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: '"SF Mono", Monaco, "Menlo", "Consolas", monospace',
                  color: '#1F2937',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  <style>{`
                    .hl-cmd { color: #1F2937; font-weight: 500; }
                    .hl-url { color: #1F2937; }
                    .hl-flag { color: #1F2937; }
                    .hl-key { color: #0891B2; }
                    .hl-param { color: #0891B2; }
                    .hl-eq { color: #6B7280; }
                    .hl-value { color: #0891B2; }
                    .hl-quote { color: #059669; }
                    .hl-string { color: #059669; }
                    .hl-json-key { color: #7C3AED; }
                    .hl-json-string { color: #059669; }
                    .hl-json-number { color: #D97706; }
                    .hl-json-bool { color: #DC2626; }
                    .hl-json-null { color: #6B7280; }
                  `}</style>
                  <span style={{ color: '#9CA3AF', userSelect: 'none' }}>$ </span>
                  {activeCodeLang === 'curl' ? (
                    <span dangerouslySetInnerHTML={{ __html: highlightCurl(currentCode[activeCodeLang] || '') }} />
                  ) : (
                    currentCode[activeCodeLang]
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* Example Response */}
          {currentResponse && (
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Example Response
              </div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: '16px 18px',
                border: '1px solid #E5E7EB',
                maxHeight: 420,
                overflowY: 'auto'
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: '"SF Mono", Monaco, "Menlo", "Consolas", monospace',
                  color: '#1F2937',
                  whiteSpace: 'pre-wrap'
                }}>
                  <span dangerouslySetInnerHTML={{ __html: highlightJSON(currentResponse) }} />
                </pre>
              </div>
            </div>
          )}

          {/* Placeholder for sections without code */}
          {!currentCode && !currentResponse && (
            <div style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
              Select an endpoint to see code examples
            </div>
          )}
        </div>
      </aside>
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
      {/* Top Navigation - Premium Branded Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Brand + Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>A</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.1 }}>ADE</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.02em' }}>Decision Engine</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13,
                      color: isActive ? '#111' : '#6B7280',
                      background: isActive ? '#F3F4F6' : 'transparent',
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon style={{ width: 15, height: 15, opacity: isActive ? 1 : 0.6 }} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Status + Version */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'ui-monospace, monospace' }}>v1.0.0</span>
            <button
              onClick={() => { fetchHealth(); setShowStatus(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12,
                color: '#374151', background: '#F9FAFB', border: '1px solid #E5E5E5',
                borderRadius: 8, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                width: 7, height: 7,
                background: health?.status === 'healthy' ? '#22C55E' : health?.status === 'degraded' ? '#F59E0B' : '#EF4444',
                borderRadius: '50%',
                boxShadow: health?.status === 'healthy' ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
              }} />
              {healthLoading ? 'Checking...' : health?.status === 'healthy' ? 'All Systems Go' : health?.status || 'Status'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
        {/* ============ ROUTER VIEW ============ */}
        {activeView === 'router' && (
          <div className="router-grid" style={{ display: 'grid', gap: 24 }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Page Title */}
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Route a Prompt</h1>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
                  Enter a prompt to analyze and find the optimal AI model. Configure modality, context, and constraints below.
                </p>
              </div>

              {/* Input Section */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      placeholder="Describe your task... e.g. &quot;Write a Python function to parse JSON&quot;"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleRoute(); }}
                      style={{ width: '100%', minHeight: 100, padding: 0, paddingRight: 80, fontSize: 15, color: '#111', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.7, fontFamily: 'inherit' }}
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
                <div style={{ padding: '0 20px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Try an example</div>
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
                </div>

                {/* Controls Bar */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Modality Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
                      {MODALITIES.map((m) => {
                        const Icon = m.icon;
                        const isActive = modality === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setModality(m.id)}
                            title={`${m.label}: ${m.desc}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5, padding: isActive ? '5px 10px' : '5px 8px',
                              background: isActive ? '#fff' : 'transparent', border: 'none', borderRadius: 6,
                              cursor: 'pointer', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                              fontSize: 12, color: isActive ? '#111' : '#9CA3AF', fontWeight: isActive ? 500 : 400,
                              transition: 'all 0.15s',
                            }}
                          >
                            <Icon style={{ width: 14, height: 14 }} />
                            {isActive && <span>{m.label}</span>}
                          </button>
                        );
                      })}
                    </div>
                    {/* Options Toggle */}
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

                {/* Options Panel */}
                <AnimatePresence>
                  {showOptions && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: 20, borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                        {/* Human Context Section */}
                        <div style={{ marginBottom: 24 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                            <input type="checkbox" checked={useHumanContext} onChange={(e) => setUseHumanContext(e.target.checked)} style={{ width: 15, height: 15, accentColor: '#4F46E5' }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Human Context</span>
                            <span style={{ fontSize: 11, color: '#6B7280', background: '#EEF2FF', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>+15% scoring weight</span>
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
                    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      {/* Header */}
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

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Engine Stats */}
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine Stats</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Models', value: '10', color: '#6366F1' },
                    { label: 'Latency', value: '<50ms', color: '#10B981' },
                    { label: 'Factors', value: '7', color: '#F59E0B' },
                    { label: 'Providers', value: '3', color: '#3B82F6' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring Weights */}
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

              {/* Request History */}
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

              {/* API Card */}
              <div style={{ background: 'linear-gradient(135deg, #18181B, #27272A)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#71717A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API Endpoint</div>
                <code style={{ display: 'block', fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#A1A1AA', background: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  POST /api/v1/route
                </code>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a href="/api/v1/health" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A1A1AA', textDecoration: 'none' }}>
                    Health Check <ChevronRight style={{ width: 12, height: 12 }} />
                  </a>
                  <a href="/api/v1/models" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A1A1AA', textDecoration: 'none' }}>
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
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Models</h1>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
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
                  <div style={{ marginBottom: 16, padding: 14, background: health.status === 'healthy' ? '#ECFDF5' : '#FEF2F2', borderRadius: 10, border: `1px solid ${health.status === 'healthy' ? '#D1FAE5' : '#FECACA'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {health.status === 'healthy' ? <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} /> : <XCircle style={{ width: 16, height: 16, color: '#DC2626' }} />}
                      <span style={{ fontSize: 14, fontWeight: 600, color: health.status === 'healthy' ? '#059669' : '#DC2626', textTransform: 'capitalize' }}>{health.status}</span>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: '#4B5563', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><strong>Version:</strong> {health.version}</div>
                      <div><strong>Engine:</strong> {health.services.engine}</div>
                      <div><strong>Store:</strong> {health.services.store}</div>
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
          grid-template-columns: 1fr 360px;
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
