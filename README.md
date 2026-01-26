# ADE - Araviel Decision Engine

<div align="center">

**Intelligent LLM Routing for Optimal Model Selection**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Overview](#overview) • [Features](#features) • [Quick Start](#quick-start) • [API Reference](#api-reference) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## Overview

ADE (Araviel Decision Engine) is a sophisticated LLM routing engine that analyzes user prompts and automatically selects the optimal model based on task requirements, cost efficiency, and performance characteristics. With sub-50ms routing decisions and support for 10+ models from Anthropic, OpenAI, and Google, ADE ensures your requests are always handled by the best model for the job.

### Why ADE?

- **Cost Optimization**: Automatically route simple queries to cost-effective models and complex tasks to capable ones
- **Performance Matching**: Match task requirements (coding, creative, analysis) to model strengths
- **Multi-Modal Support**: Seamlessly handle text, image, voice, and combined inputs
- **Human Context Awareness**: Factor in user mood, energy level, and preferences for better recommendations

---

## Features

| Feature | Description |
|---------|-------------|
| **Sub-50ms Routing** | Lightning-fast routing decisions with intelligent caching |
| **10+ Models** | Support for Anthropic, OpenAI, and Google models |
| **Multi-Modal** | Text, vision, audio, and combined modality support |
| **6 Scoring Factors** | Task fitness, modality, cost, speed, preference, coherence |
| **Human Context** | Mood, energy, time, and preference-aware routing |
| **Natural Language Reasoning** | Human-readable explanations for every recommendation |
| **Interactive UI** | Beautiful routing interface for testing and exploration |

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/ade.git
   cd ade
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration:

   ```env
   # API Authentication Keys (comma-separated for multiple keys)
   ADE_API_KEYS=sk_live_your_api_key_here

   # Vercel KV Storage (Optional - for context persistence)
   KV_REST_API_URL=https://your-kv.kv.vercel-storage.com
   KV_REST_API_TOKEN=your-kv-token
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

---

## Running Locally

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

This will start:
- Next.js development server on port 3000
- API routes at `/api/v1/*`
- Interactive UI at the root URL

### Production Build

Build and run the production version:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Running Tests

Execute the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Type Checking

Verify TypeScript types:

```bash
npm run typecheck
```

### Linting

Check code quality:

```bash
npm run lint
```

---

## Using the Route UI

The ADE interface provides an interactive way to test and explore routing decisions.

### Accessing the UI

1. Start the development server: `npm run dev`
2. Open `http://localhost:3000` in your browser

### Router Interface

The main Router view allows you to:

1. **Enter a Prompt**: Type or paste your prompt in the input field
2. **Select Modality**: Choose from Text, Vision, Voice, or combined modes
3. **Set Human Context** (Optional): Configure mood, energy level, and preferences
4. **Set Constraints** (Optional): Add cost limits, latency requirements, or model restrictions
5. **Route**: Click "Route Prompt" to get model recommendations

### Understanding Results

After routing, you'll see:

- **Primary Recommendation**: The optimal model with score and reasoning
- **Backup Models**: Alternative recommendations ranked by score
- **Analysis**: Detected intent, domain, complexity, and keywords
- **Timing**: Breakdown of analysis, scoring, and selection time
- **Factor Scores**: Detailed view of how each scoring factor contributed

### API Documentation

Navigate to the **Docs** tab for comprehensive API documentation with:

- Interactive endpoint reference
- Code examples in Shell, JavaScript, and Python
- Request/response schemas
- Error handling guide

### Models Browser

The **Models** tab displays all available models with:

- Provider information (Anthropic, OpenAI, Google)
- Pricing details
- Capability indicators (vision, audio, streaming, functions)
- Performance metrics

---

## API Reference

### Base URL

```
https://api.ade.dev/v1
```

For local development: `http://localhost:3000/api/v1`

### Authentication

All API requests (except health check) require authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.ade.dev/v1/route
```

### Endpoints

#### POST /v1/route

Analyze a prompt and get model recommendations.

```bash
curl -X POST https://api.ade.dev/v1/route \
  -H "Authorization: Bearer $ADE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a Python function to sort an array",
    "modality": "text"
  }'
```

**Response:**
```json
{
  "decisionId": "dec_abc123",
  "primaryModel": {
    "id": "claude-sonnet-4-20250514",
    "name": "Claude Sonnet 4",
    "provider": "Anthropic",
    "score": 0.912,
    "reasoning": {
      "summary": "Excellent match for coding tasks with strong performance",
      "factors": [...]
    }
  },
  "backupModels": [...],
  "confidence": 0.87,
  "analysis": {
    "intent": "coding",
    "domain": "technology",
    "complexity": "standard"
  },
  "timing": {
    "totalMs": 24.5
  }
}
```

#### POST /v1/analyze

Analyze a prompt without model selection.

```bash
curl -X POST https://api.ade.dev/v1/analyze \
  -H "Authorization: Bearer $ADE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing"}'
```

#### GET /v1/models

List all available models.

```bash
curl https://api.ade.dev/v1/models \
  -H "Authorization: Bearer $ADE_API_KEY"
```

#### GET /v1/models/:id

Get details for a specific model.

```bash
curl https://api.ade.dev/v1/models/claude-sonnet-4-20250514 \
  -H "Authorization: Bearer $ADE_API_KEY"
```

#### POST /v1/feedback

Submit feedback for a routing decision.

```bash
curl -X POST https://api.ade.dev/v1/feedback \
  -H "Authorization: Bearer $ADE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionId": "dec_abc123",
    "rating": 5,
    "comment": "Perfect recommendation!"
  }'
```

#### GET /v1/health

Health check endpoint (no authentication required).

```bash
curl https://api.ade.dev/v1/health
```

---

## Architecture

### System Overview

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
│      │  (10+ models)   │         │  (Context Storage)  │        │
│      └─────────────────┘         └─────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Request** → Incoming prompt with optional context and constraints
2. **Analysis** → Intent detection, domain classification, complexity scoring
3. **Scoring** → Each model scored across 6 weighted factors
4. **Selection** → Top model selected with backup alternatives
5. **Reasoning** → Natural language explanation generated
6. **Response** → Full recommendation returned

### Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Task Fitness | 40% | Match between detected intent/domain and model strengths |
| Modality Fitness | 15% | Capability match for vision/audio requirements |
| Cost Efficiency | 15% | Normalized cost comparison |
| Speed | 10% | Latency comparison |
| User Preference | 10% | Boost/penalty based on user preferences |
| Conversation Coherence | 10% | Consistency with previous model in conversation |

---

## Project Structure

```
ade/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/v1/               # API Routes
│   │   │   ├── route/            # Main routing endpoint
│   │   │   ├── analyze/          # Analysis-only endpoint
│   │   │   ├── models/           # Model listing
│   │   │   ├── feedback/         # Feedback submission
│   │   │   ├── decisions/        # Decision retrieval
│   │   │   └── health/           # Health check
│   │   ├── page.tsx              # Main UI (Router, Models, Docs)
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   │
│   ├── core/                     # Core Engine Logic
│   │   ├── analyzer/             # Intent & domain analysis
│   │   ├── scorer/               # Factor scoring
│   │   ├── selector/             # Model selection
│   │   ├── reasoning/            # Reasoning generation
│   │   └── engine/               # Main orchestrator
│   │
│   ├── components/               # React Components
│   │   ├── ui/                   # Base UI components
│   │   ├── routing/              # Routing-specific components
│   │   └── status/               # Status page component
│   │
│   ├── models/                   # Model Registry
│   ├── context/                  # Context managers
│   ├── lib/                      # Utilities
│   ├── types/                    # TypeScript definitions
│   └── __tests__/                # Test files
│
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## Supported Models

### Anthropic

| Model | Best For |
|-------|----------|
| Claude Opus 4.5 | Complex reasoning, analysis, long-form content |
| Claude Sonnet 4 | Balanced tasks, coding, general-purpose |
| Claude Haiku 3.5 | Quick responses, high volume, cost-sensitive |

### OpenAI

| Model | Best For |
|-------|----------|
| GPT-4.1 | Coding, long context, complex tasks |
| GPT-4.1 Mini | Cost-effective coding, moderate complexity |
| GPT-4o | Multi-modal, conversation, creative tasks |
| o4-mini | Complex reasoning, chain-of-thought |

### Google

| Model | Best For |
|-------|----------|
| Gemini 2.5 Pro | Multi-modal analysis, complex reasoning |
| Gemini 2.5 Flash | Fast responses, balanced performance |
| Gemini 2.5 Flash-Lite | High volume, budget-conscious |

---

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Total Routing Time | < 50ms | ~25ms |
| Analysis Phase | < 10ms | ~6ms |
| Scoring Phase | < 20ms | ~14ms |
| Selection Phase | < 20ms | ~5ms |

All routing is performed in-memory with no external API calls during the decision process.

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build the image
docker build -t ade .

# Run the container
docker run -p 3000:3000 -e ADE_API_KEYS=your_key ade
```

### Manual

```bash
npm run build
npm start
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with the Araviel Philosophy**

*Clean • Modern • Professional • Billion Dollar Tech Company Standards*

</div>
