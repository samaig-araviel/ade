# ADE - Araviel Decision Engine

An intelligent LLM routing engine that analyzes user prompts and recommends the optimal model based on task requirements, user context, and constraints.

## Overview

ADE (Araviel Decision Engine) receives a user's prompt along with optional context, analyzes the request, scores all available models against multiple factors, and returns a recommendation with clear, human-readable reasoning.

**Key Features:**
- Sub-50ms routing decisions
- Multi-modal support (text, image, voice, combined)
- Human context awareness (mood, energy, time, preferences)
- Natural language reasoning for every recommendation
- 10 models from Anthropic, OpenAI, and Google

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  POST /v1/route  │  POST /v1/analyze  │  GET /v1/models  │ ...  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Engine Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Analyzer │→ │  Scorer  │→ │ Selector │→ │ Reasoning Gen.   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│      ┌─────────────────┐         ┌─────────────────────┐        │
│      │  Model Registry │         │     Vercel KV       │        │
│      │  (10 models)    │         │  (Context Storage)  │        │
│      └─────────────────┘         └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
Request → Auth Middleware → Analyze Prompt → Score Models → Select Best → Generate Reasoning → Response
                                  │              │              │
                                  ▼              ▼              ▼
                            Intent/Domain   All Factors    Primary +
                            Complexity      Weighted       2 Backups
                            Tone/Keywords   Combined       w/Reasoning
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (for KV storage)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ade

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys and KV credentials to .env.local
```

### Environment Variables

```env
# API Keys (comma-separated)
ADE_API_KEYS=your-api-key-1,your-api-key-2

# Vercel KV
KV_REST_API_URL=https://your-kv.kv.vercel-storage.com
KV_REST_API_TOKEN=your-kv-token
```

### Running Locally

```bash
# Development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API Reference

### POST /v1/route

Main routing endpoint. Analyzes the prompt and returns model recommendations.

**Request:**
```json
{
  "prompt": "Write a Python function to sort an array",
  "modality": "text",
  "context": {
    "userId": "user_123",
    "conversationId": "conv_456",
    "previousModelUsed": "claude-sonnet-4-20250514",
    "messageCount": 5
  },
  "humanContext": {
    "emotionalState": {
      "mood": "focused",
      "energyLevel": "high"
    },
    "temporalContext": {
      "localTime": "14:30",
      "isWorkingHours": true
    },
    "preferences": {
      "preferredResponseStyle": "detailed",
      "preferredModels": ["claude-opus-4-5-20251101"]
    }
  },
  "constraints": {
    "maxCostPer1kTokens": 0.01,
    "maxLatencyMs": 2000,
    "requireVision": false
  }
}
```

**Response:**
```json
{
  "decisionId": "dec_abc123def456",
  "primaryModel": {
    "id": "claude-sonnet-4-20250514",
    "name": "Claude Sonnet 4",
    "provider": "anthropic",
    "score": 0.892,
    "reasoning": {
      "summary": "Claude Sonnet 4 excels at coding tasks with strong technology domain knowledge.",
      "factors": [
        {
          "name": "Task Fitness",
          "impact": "positive",
          "weight": 0.4,
          "detail": "Excels at coding tasks (95%) with strong technology domain knowledge (95%)"
        }
      ]
    }
  },
  "backupModels": [...],
  "confidence": 0.87,
  "analysis": {
    "intent": "coding",
    "domain": "technology",
    "complexity": "standard",
    "tone": "focused",
    "modality": "text",
    "keywords": ["python", "function", "sort", "array"],
    "humanContextUsed": true
  },
  "timing": {
    "totalMs": 23.45,
    "analysisMs": 5.12,
    "scoringMs": 14.33,
    "selectionMs": 4.00
  }
}
```

### POST /v1/analyze

Analyze-only endpoint (no model selection).

**Request:**
```json
{
  "prompt": "Explain quantum computing",
  "modality": "text"
}
```

### POST /v1/feedback

Submit feedback on a routing decision.

**Request:**
```json
{
  "decisionId": "dec_abc123def456",
  "signal": "positive",
  "comment": "Great recommendation!"
}
```

### GET /v1/models

List all available models.

### GET /v1/models/:id

Get details for a specific model.

### GET /v1/decisions/:id

Retrieve a past decision.

### GET /v1/health

Health check (no authentication required).

## Scoring System

### Factors & Weights

**Without Human Context:**
| Factor | Weight |
|--------|--------|
| Task Fitness | 40% |
| Modality Fitness | 15% |
| Cost Efficiency | 15% |
| User Preference | 10% |
| Conversation Coherence | 10% |
| Speed | 10% |

**With Human Context:**
| Factor | Weight |
|--------|--------|
| Task Fitness | 32% |
| Human Context Fit | 15% |
| Modality Fitness | 12% |
| Cost Efficiency | 12% |
| User Preference | 10% |
| Conversation Coherence | 10% |
| Speed | 9% |

### Human Context Influence

- **Mood**: Frustrated/stressed favors empathetic models; playful favors playful models
- **Energy**: Low energy favors concise responses; high energy handles verbose
- **Time**: Late night favors lighter models; work hours favor professional
- **Style**: Matches preferred response style and length

## Supported Models

| Provider | Model | Best For |
|----------|-------|----------|
| Anthropic | Claude Opus 4.5 | Complex reasoning, analysis |
| Anthropic | Claude Sonnet 4 | Balanced tasks, coding |
| Anthropic | Claude Haiku 4.5 | Quick responses, high volume |
| OpenAI | GPT-4.1 | Coding, long context |
| OpenAI | GPT-4.1 Mini | Cost-effective coding |
| OpenAI | GPT-4o | Multi-modal, conversation |
| OpenAI | o4-mini | Complex reasoning |
| Google | Gemini 2.5 Pro | Multi-modal, analysis |
| Google | Gemini 2.5 Flash | Fast responses |
| Google | Gemini 2.5 Flash-Lite | High volume, budget |

## Multi-Modal Routing

### Text-Only
Full analysis and scoring pipeline.

### Pure Image/Voice
Fast-path selection (< 10ms) based on modality capability scores.

### Combined (Text + Image/Voice)
Reconciliation approach:
- 60% weight on modality capability
- 40% weight on text analysis
- Edge case handling for close matches

## Project Structure

```
src/
├── app/
│   └── api/v1/           # API routes
│       ├── route/        # Main routing endpoint
│       ├── analyze/      # Analysis-only endpoint
│       ├── feedback/     # Feedback endpoint
│       ├── models/       # Model listing
│       ├── decisions/    # Decision retrieval
│       └── health/       # Health check
├── core/
│   ├── analyzer/         # Intent, domain, complexity detection
│   ├── scorer/           # Factor calculators
│   ├── selector/         # Model selection logic
│   ├── reasoning/        # Natural language generation
│   └── engine/           # Main orchestrator
├── models/               # Model registry (10 models)
├── context/              # KV context managers
├── lib/                  # Utilities (auth, errors, helpers)
├── types/                # TypeScript definitions
└── __tests__/            # Test files
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# With coverage
npm test:coverage
```

### Type Checking

```bash
# Check types
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Setup

1. Create a Vercel KV store
2. Copy the connection details to your environment variables
3. Add your API keys

## Performance

- **Target**: < 50ms for 99th percentile
- **Analysis**: < 10ms
- **Scoring**: < 20ms
- **Selection + Reasoning**: < 20ms

All routing is done in-memory with no external API calls.

## License

MIT
