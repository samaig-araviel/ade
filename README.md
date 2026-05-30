# ADE — Araviel Decision Engine

Intelligent LLM routing. Give ADE a prompt, and it picks the best AI model for the job.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

---

## Overview

ADE looks at a prompt and recommends the model best suited to answer it. For each request it returns:

- A **primary model** recommendation
- A set of **ranked backups**
- A short, plain-language **explanation** of the choice

Routing happens in memory with no external API calls, so decisions are fast. It weighs signals such as the task at hand, the type of content (text, vision, voice), and the trade-off between cost and speed — along with any constraints you pass in.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **UI**: React 19
- **Optional storage**: Vercel KV (to persist decision history)

---

## Getting Started

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

The engine runs out of the box. Storage is optional — without it, decisions simply aren't persisted. To enable persistence, create `.env.local`:

```env
# Optional: Vercel KV for persisting decisions
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

### Run

```bash
npm run dev       # start the dev server at http://localhost:3000
npm run build     # production build
npm start         # run the production build
npm test          # run the test suite
npm run lint      # lint
```

---

## Using the API

The API lives under `/api/v1`. The main entry point is `POST /route` — send a prompt, get a recommendation back:

```bash
curl -X POST http://localhost:3000/api/v1/route \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a Python function to sort an array", "modality": "text"}'
```

```json
{
  "primaryModel": {
    "id": "claude-sonnet-4-6",
    "provider": "Anthropic",
    "reasoning": { "summary": "Strong fit for coding tasks" }
  },
  "backupModels": [],
  "analysis": { "intent": "coding" }
}
```

The full endpoint reference (analysis, models, feedback, health) is available in the in-app **Docs** tab once the server is running.

---

## Interactive Console

Open `http://localhost:3000` to explore ADE in the browser:

- **Router** — try prompts and see which model gets picked
- **Models** — browse the supported models
- **Docs** — full endpoint reference with examples

---

## Deployment

Built for Vercel: connect the repo, set any environment variables in the dashboard, and deploy. A standard `npm run build` + `npm start` also works on any Node host.
