# ADE — Araviel Decision Engine

Intelligent LLM routing for optimal model selection.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

---

## Overview

ADE analyzes a prompt and picks the best AI model for the job. It returns a primary recommendation plus ranked backups, along with a short natural-language explanation. Routing happens in-memory with no external calls, so decisions are fast (typically ~25 ms).

Signals considered:

- Task intent, domain, and complexity
- Modality (text, vision, voice, or combined)
- Cost and latency trade-offs
- Optional human context (mood, energy, preferences)
- Optional constraints (budget, latency caps, model allow/deny lists)

---

## How It Works

```
┌───────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Analyzer    │ ──▶ │    Scorer     │ ──▶ │   Selector   │ ──▶ │  Reasoning   │
│ intent/domain │     │  6 factors    │     │   top + N    │     │   summary    │
└───────────────┘     └───────────────┘     └──────────────┘     └──────────────┘
```

Each candidate model is scored across six weighted factors:

| Factor                  | Weight |
| ----------------------- | :----: |
| Task fitness            |  40%   |
| Modality fitness        |  15%   |
| Cost efficiency         |  15%   |
| Speed                   |  10%   |
| User preference         |  10%   |
| Conversation coherence  |  10%   |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **UI**: React 19
- **Optional storage**: Vercel KV (for decision history and context)

---

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/samaig-araviel/ade.git
cd ade
npm install
```

### Environment

Create `.env.local` with the variables your deployment needs. Storage is optional — the engine runs without it, but decisions won't persist:

```env
# Optional: Vercel KV for persisting decisions and context
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

### Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm start         # run production build
npm test          # vitest/jest suite
npm run lint      # eslint
```

---

## API

Base path: `/api/v1`

| Method | Path                  | Purpose                                   |
| ------ | --------------------- | ----------------------------------------- |
| POST   | `/route`              | Analyze a prompt and recommend a model    |
| POST   | `/analyze`            | Run prompt analysis without selecting     |
| POST   | `/feedback`           | Submit feedback for a past decision       |
| GET    | `/models`             | List available models                     |
| GET    | `/models/:id`         | Get a single model's details              |
| GET    | `/decisions/:id`      | Retrieve a stored decision (requires KV)  |
| GET    | `/health`             | Health check                              |

### Example

```bash
curl -X POST http://localhost:3000/api/v1/route \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a Python function to sort an array", "modality": "text"}'
```

Response (abridged):

```json
{
  "decisionId": "dec_abc123",
  "primaryModel": {
    "id": "claude-sonnet-4-6",
    "provider": "Anthropic",
    "score": 0.91,
    "reasoning": { "summary": "Strong fit for coding tasks" }
  },
  "backupModels": [],
  "analysis": { "intent": "coding", "complexity": "standard" },
  "timing": { "totalMs": 24.5 }
}
```

---

## UI

Visit `http://localhost:3000` for the interactive console:

- **Router** — try prompts and inspect scoring breakdowns
- **Models** — browse supported models and capabilities
- **Docs** — in-app endpoint reference with examples

---

## Project Structure

```
src/
├── app/
│   ├── api/v1/          # Route handlers (route, analyze, models, feedback, ...)
│   ├── page.tsx         # Interactive UI
│   └── layout.tsx
├── core/
│   ├── analyzer/        # Intent, domain, complexity detection
│   ├── scorer/          # Per-factor scoring
│   ├── selector/        # Top-N selection
│   ├── reasoning/       # Natural-language explanations
│   └── engine/          # Orchestrator
├── models/              # Model registry
├── context/             # Conversation and user context
├── lib/                 # Shared utilities
└── types/
```

---

## Deployment

Designed for Vercel. Connect the repo, set environment variables in the dashboard, and deploy. A standard `npm run build` + `npm start` works for any Node host.
