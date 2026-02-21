# Araviel Backend — Build Prompt

## 1. PROJECT OVERVIEW

You are building the backend for **Araviel** — an AI orchestrator platform that unifies multiple AI providers (OpenAI, Anthropic, Google Gemini, Perplexity) into a single intelligent interface. Think of it as a production-grade rival to ChatGPT, Claude, and Perplexity but with intelligent model routing.

This is a **SEPARATE Next.js project** (API-only, no frontend). It will be deployed on Vercel and serves as the backend for:

- **Frontend**: Vite + React SPA at `https://araviel-web.vercel.app/` (repo: `https://github.com/samaig-araviel/araviel-web`)
- **ADE** (Araviel Decision Engine): Next.js routing engine at `https://ade-sandy.vercel.app/` (repo: `https://github.com/samaig-araviel/ade`)
- **Database**: Supabase (PostgreSQL)

No authentication is needed yet. Build everything without auth — it will be added later.

---

## 2. WHAT EXISTS ALREADY

### 2A. ADE (Araviel Decision Engine)

ADE is a standalone microservice that analyzes user prompts and selects the optimal AI model. It runs at `https://ade-sandy.vercel.app/api/v1`. The backend must call ADE for routing then forward requests to the selected provider.

ADE routing latency: < 50ms (in-memory scoring engine, no external API calls during routing).

#### ADE Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/route` | POST | Main routing — analyzes prompt, selects optimal model |
| `/api/v1/analyze` | POST | Analysis only — returns intent/domain/complexity without model selection |
| `/api/v1/models` | GET | List all available models with pricing and capabilities |
| `/api/v1/models/:id` | GET | Get details for a specific model |
| `/api/v1/feedback` | POST | Submit feedback on a routing decision (positive/neutral/negative) |
| `/api/v1/health` | GET | Health check |

#### ADE Route Endpoint — EXACT Request Format

```
POST /api/v1/route
Content-Type: application/json

{
  "prompt": "string (REQUIRED — the user's message)",
  "modality": "string (REQUIRED — one of: text, image, voice, text+image, text+voice)",
  "context": {                           // OPTIONAL — conversation context
    "userId": "string?",
    "conversationId": "string?",
    "previousModelUsed": "string?",
    "messageCount": "number?",
    "sessionDurationMinutes": "number?"
  },
  "humanContext": {                      // OPTIONAL — rich context for better routing
    "emotionalState": {
      "mood": "happy | neutral | stressed | frustrated | excited | tired | anxious | calm",
      "energyLevel": "low | moderate | high"
    },
    "temporalContext": {
      "localTime": "string? (HH:MM format)",
      "timezone": "string?",
      "dayOfWeek": "string?",
      "isWorkingHours": "boolean?"
    },
    "environmentalContext": {
      "weather": "sunny | cloudy | rainy | stormy | snowy | hot | cold",
      "location": "home | office | commute | travel | other"
    },
    "preferences": {
      "preferredResponseStyle": "concise | detailed | conversational | formal | casual",
      "preferredResponseLength": "short | medium | long",
      "preferredModels": ["string[]?"],
      "avoidModels": ["string[]?"]
    },
    "historyHints": {
      "recentTopics": ["string[]?"],
      "frequentIntents": ["string[]?"]
    }
  },
  "constraints": {                       // OPTIONAL — hard filters on model selection
    "maxCostPer1kTokens": "number?",
    "maxLatencyMs": "number?",
    "allowedModels": ["string[]?"],      // Use this to force a specific model
    "excludedModels": ["string[]?"],
    "requireStreaming": "boolean?",
    "requireVision": "boolean?",
    "requireAudio": "boolean?"
  }
}
```

**IMPORTANT**: `modality` is REQUIRED. For a text chat app, always pass `"text"`. There is NO `options.preferModel` field — to force a specific model, use `constraints.allowedModels: ["model-id"]`.

#### ADE Route Endpoint — EXACT Response Format

```json
{
  "decisionId": "ade_abc123",
  "primaryModel": {
    "id": "claude-opus-4-6",
    "name": "Claude Opus 4.6",
    "provider": "anthropic",
    "score": 0.943,
    "reasoning": {
      "summary": "Claude Opus 4.6 excels at complex reasoning tasks with demanding complexity...",
      "factors": [
        {
          "name": "Task Fitness",
          "impact": "positive",
          "weight": 0.45,
          "detail": "Strong coding performance (0.98) matches detected intent."
        }
      ]
    }
  },
  "backupModels": [
    {
      "id": "gpt-5.2",
      "name": "GPT-5.2",
      "provider": "openai",
      "score": 0.912,
      "reasoning": { "summary": "...", "factors": [...] }
    }
  ],
  "confidence": 0.943,
  "analysis": {
    "intent": "coding",
    "domain": "technology",
    "complexity": "demanding",
    "tone": "focused",
    "modality": "text",
    "keywords": ["algorithm", "optimize"],
    "humanContextUsed": false
  },
  "timing": {
    "totalMs": 12.45,
    "analysisMs": 3.21,
    "scoringMs": 7.89,
    "selectionMs": 1.35
  }
}
```

**Field mapping — ADE response to frontend format:**

| ADE Field | Frontend Expects | Mapping |
|---|---|---|
| `primaryModel.id` | `modelId` | Direct |
| `primaryModel.name` | `modelName` | Direct |
| `primaryModel.provider` | `provider` | Direct |
| `primaryModel.score` | `score` | Direct |
| `primaryModel.reasoning.summary` | `reasoning` (string) | Extract `.summary` |
| `backupModels` | `alternateModels` | Rename + map `id`→`modelId`, `name`→`modelName`, `reasoning.summary`→`reasoning` |
| `decisionId` | — | Store for feedback |
| `analysis` | — | Use for system prompt tuning and logging |

#### ADE Models Endpoint — Response Format

```
GET /api/v1/models

Response:
{
  "models": [
    {
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6",
      "provider": "anthropic",
      "description": "Latest flagship model...",
      "pricing": { "inputPer1k": 0.005, "outputPer1k": 0.025 },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 64000,
        "supportsStreaming": true,
        "supportsVision": true,
        "supportsAudio": false,
        "supportsFunctionCalling": true,
        "supportsJsonMode": true
      },
      "performance": { "avgLatencyMs": 2000, "reliabilityPercent": 99.5 },
      "available": true
    }
  ],
  "count": 32
}
```

NOTE: The public ModelInfo response does NOT include `supportsExtendedThinking`, `supportsReasoning`, or `supportsWebSearch`. The backend must maintain its own knowledge of which models support these features (see Model ID Mapping section).

#### ADE Feedback Endpoint

```
POST /api/v1/feedback
{ "decisionId": "ade_abc123", "signal": "positive" | "neutral" | "negative", "comment": "string?" }

Response:
{ "success": true, "decisionId": "ade_abc123", "message": "Feedback recorded" }
```

The backend should call this after a chat completes to improve ADE's routing over time.

---

### 2B. Frontend (araviel-web)

A Vite + React 18 SPA with Redux Toolkit. Currently uses mock responses.

#### Message format the frontend uses

```js
// User message
{
  id: "user-{timestamp}",
  role: "user",
  content: "string",
  timestamp: number
}

// Assistant message
{
  id: "assistant-{timestamp}",
  role: "assistant",
  content: "string",               // The AI response text (streamed)
  timestamp: number,
  modelId: "string",                // e.g., "claude-opus-4-6"
  modelName: "string",              // e.g., "Claude Opus 4.6"
  provider: "string",               // "anthropic" | "openai" | "google" | "perplexity"
  score: "number | null",           // ADE confidence score (0-1), null if manual
  reasoning: "string",              // ADE reasoning summary (extracted from reasoning.summary)
  isManualSelection: "boolean",
  alternateModels: [{ modelId, modelName, provider, score, reasoning }],
  thinkingData: {
    routingDuration: "string",
    thinkingDuration: "string",
    totalDuration: "string"
  }
}
```

#### Frontend state (Redux — chatSlice)

```js
{
  messages: [],
  inputValue: "",
  mode: "auto" | "code" | "write",
  selectedModelId: null,        // null = Auto mode (ADE decides)
  extendedThinking: false,      // Anthropic extended thinking toggle
  deepResearch: false,          // OpenAI deep research toggle
  googleThinking: false,        // Gemini thinking mode toggle
  recentChats: [],
  currentChatId: null,
  isProcessing: false
}
```

#### Current frontend flow (mock — your backend replaces this)

1. User submits prompt
2. Frontend calls ADE `/api/v1/route` → gets model routing result
3. Frontend calls `generateMockResponse()` → gets fake full text
4. Frontend streams text word-by-word locally using `useStreamingText` hook
5. **This ENTIRE flow needs to be replaced with**: Frontend → Backend API (single call) → Backend handles ADE + provider + streaming back

#### Provider model IDs used in frontend (from `src/data/models.js`)

**Anthropic (11 models):**
`claude-opus-4-6`, `claude-sonnet-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-4-5-20250929`, `claude-haiku-4-5-20251001`, `claude-opus-4-1-20250805`, `claude-opus-4-20250514`, `claude-sonnet-4-20250514`, `claude-3-7-sonnet-20250219`, `claude-3-5-haiku-20241022`, `claude-3-haiku-20240307`

**OpenAI (16 models):**
`gpt-5.2`, `gpt-5.2-pro`, `gpt-5.1`, `gpt-5`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o`, `gpt-4o-mini`, `o3`, `o3-pro`, `o4-mini`

**Google (3 models):**
`gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`

**Perplexity (2 models):**
`sonar-pro`, `sonar`

**Providers defined in frontend:**
`{ anthropic, openai, google, perplexity }` — each with id, name, accentColor, etc.

---

### 2C. Database (Supabase PostgreSQL)

The database is already set up in Supabase with these tables:

1. **profiles** — User profiles (`id` uuid PK, `user_id` uuid, `display_name` text, `avatar_url` text, `created_at` timestamptz, `updated_at` timestamptz)
2. **conversations** — Chat conversations (`id` uuid PK, `user_id` uuid, `title` text, `model_id` text, `provider` text, `created_at` timestamptz, `updated_at` timestamptz, `is_archived` boolean)
3. **messages** — Individual messages (`id` uuid PK, `conversation_id` uuid FK, `role` text, `content` text, `model_id` text, `model_name` text, `provider` text, `score` numeric, `reasoning` text, `thinking_data` jsonb, `is_manual_selection` boolean, `alternate_models` jsonb, `tokens_input` integer, `tokens_output` integer, `cost` numeric, `created_at` timestamptz)
4. **user_preferences** — User settings (`id` uuid PK, `user_id` uuid, `default_model_id` text, `theme` text, `extended_thinking_enabled` boolean, `deep_research_enabled` boolean, `google_thinking_enabled` boolean, `mode` text, `created_at` timestamptz, `updated_at` timestamptz)
5. **api_keys** — Encrypted API keys per provider (`id` uuid PK, `user_id` uuid, `provider` text, `api_key_encrypted` text, `is_active` boolean, `created_at` timestamptz, `updated_at` timestamptz)
6. **usage_logs** — Usage tracking (`id` uuid PK, `user_id` uuid, `conversation_id` uuid, `message_id` uuid, `provider` text, `model_id` text, `tokens_input` integer, `tokens_output` integer, `cost` numeric, `duration_ms` integer, `created_at` timestamptz)

**IMPORTANT**: Before building, connect to the actual Supabase database and verify the exact schema. Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment. The table and column names above are from the setup but may have minor differences — always verify first.

---

## 3. WHAT TO BUILD

A Next.js API-only backend with these capabilities:

### Core API Routes

#### `POST /api/v1/chat` — The Main Endpoint

This is the ONLY endpoint the frontend calls to send a message and get an AI response.

**Request body:**
```json
{
  "conversationId": "string? (null for new conversation)",
  "message": "string (REQUIRED)",
  "modelId": "string? (null = auto, ADE decides)",
  "mode": "auto | code | write",
  "extendedThinking": false,
  "deepResearch": false,
  "googleThinking": false,
  "timeOfDay": "string (for ADE humanContext)"
}
```

**Internal pipeline:**
1. **Validate** — Parse and validate the request body
2. **Route** — If `modelId` is null (auto mode): call ADE `POST /api/v1/route` with `{ prompt: message, modality: "text", humanContext: { temporalContext: { ... } } }`. If `modelId` is specified: skip ADE, use that model directly.
3. **Persist** — Create or get the conversation in the database, save the user message
4. **Stream** — Initialize the correct provider SDK, call the AI with streaming, pipe SSE events to the response
5. **Complete** — On stream end, save the assistant message and usage log to the database (fire-and-forget, don't block the stream)

**SSE response — event types:**

```
event: routing
data: {"modelId":"claude-opus-4-6","modelName":"Claude Opus 4.6","provider":"anthropic","score":0.94,"reasoning":"Best for complex reasoning","alternateModels":[{"modelId":"gpt-5.2","modelName":"GPT-5.2","provider":"openai","score":0.91,"reasoning":"Strong alternative"}],"conversationId":"uuid","adeDecisionId":"ade_abc123"}

event: thinking
data: {"content":"<thinking text from extended thinking/reasoning>"}

event: delta
data: {"content":"token text chunk"}

event: citations
data: {"citations":[{"title":"...","url":"...","snippet":"..."}]}

event: done
data: {"messageId":"uuid","usage":{"inputTokens":150,"outputTokens":430,"cost":0.0023},"thinkingData":{"routingDuration":"0.3","thinkingDuration":"2.1","totalDuration":"5.4"}}

event: error
data: {"message":"Rate limit exceeded","code":"RATE_LIMIT","retryAfter":5}
```

**IMPORTANT**: The `routing` event must map ADE's response format to the frontend's expected format:
- `primaryModel.id` → `modelId`
- `primaryModel.name` → `modelName`
- `primaryModel.reasoning.summary` → `reasoning` (string, not object)
- `backupModels` → `alternateModels` (with same field remapping)

#### `POST /api/v1/chat/stop` — Cancel Streaming

```json
{ "conversationId": "string", "messageId": "string" }
```
Aborts the provider API call and saves partial response.

#### `POST /api/v1/chat/retry` — Retry with Same or Different Model

```json
{ "conversationId": "string", "messageId": "string", "modelId": "string?" }
```
Deletes the previous assistant message, re-runs the pipeline.

#### `GET /api/v1/conversations` — List Conversations (paginated)

Query params: `?limit=20&offset=0&archived=false`

#### `GET /api/v1/conversations/:id` — Get Conversation with Messages

#### `PATCH /api/v1/conversations/:id` — Update Conversation (title, archive)

#### `DELETE /api/v1/conversations/:id` — Delete Conversation and All Messages

#### `GET /api/v1/conversations/:id/messages` — Get Messages (paginated)

Query params: `?limit=50&offset=0`

#### `GET /api/v1/models` — Get All Available Models

Can proxy from ADE or maintain its own registry. Must include capability flags (`extendedThinking`, `reasoning`, `webSearch`) that ADE's public API doesn't expose.

#### `GET /api/v1/usage` — Usage Statistics

Query params: `?period=day|week|month`

#### `GET /api/v1/health` — Health Check

---

## 4. AI PROVIDER INTEGRATION

### 4A. OpenAI — Responses API

**SDK:** `openai` npm package (v6.x — this is the current major version).

**API:** Use the Responses API (`POST /v1/responses`), NOT Chat Completions. The Responses API is the primary API going forward.

**Request format:**
```typescript
const response = await openai.responses.create({
  model: "gpt-5.2",
  instructions: "You are a helpful assistant.",   // replaces "system" role
  input: [
    { role: "developer", content: "Additional context..." },  // NOT "system"
    { role: "user", content: "Hello" }
  ],
  stream: true,
  tools: [{ type: "web_search_preview" }],        // optional — enables web search
  reasoning: { effort: "high", summary: "detailed" },  // for reasoning models
  temperature: 0.7,
  max_output_tokens: 4096
});
```

**Streaming events:**
```typescript
for await (const event of response) {
  if (event.type === "response.output_text.delta") {
    // event.delta — text chunk → emit as SSE "delta"
  }
  if (event.type === "response.reasoning_summary_text.delta") {
    // event.delta — thinking chunk → emit as SSE "thinking"
  }
  if (event.type === "response.completed") {
    // event.response — full response with usage → emit as SSE "done"
  }
}
```

**Web search:** Add `tools: [{ type: "web_search_preview" }]` to enable. The model decides when to search. Citations appear in `output[].content[].annotations[]` with `url`, `title`, `start_index`, `end_index`. Extract and normalize to the standard citations event format.

**Reasoning models (o3, o3-pro, o4-mini):**
- Use `reasoning: { effort: "low" | "medium" | "high", summary: "detailed" }` to control depth
- `effort: "xhigh"` available for gpt-5.2 only
- Reasoning content streams as `response.reasoning_summary_text.delta` events
- These models do NOT accept a `system` role — use `developer` role or `instructions` parameter
- Thinking content → emit as SSE "thinking" events

**Deep research models:**
- Model IDs: `o3-deep-research-2025-06-26`, `o4-mini-deep-research-2025-06-26`
- Require at least one data source tool (`web_search_preview`, `file_search`, or MCP)
- These requests can take minutes — set long timeout, send periodic SSE keepalive comments

**Multi-turn:** Use `previous_response_id` for server-side conversation state:
```typescript
const res2 = await openai.responses.create({
  model: "gpt-5.2",
  input: "Follow-up question...",
  previous_response_id: res1.id,
  store: true,
});
```

**Key models and pricing (per 1M tokens):**

| Model | Input | Output | Context | Notes |
|---|---|---|---|---|
| gpt-5.2 | $1.75 | $14.00 | 400K | Flagship |
| gpt-5.2-pro | — | — | — | Enhanced |
| gpt-5 | $1.25 | $10.00 | — | |
| gpt-5-mini | $0.25 | $2.00 | — | |
| gpt-5-nano | $0.05 | $0.40 | — | |
| gpt-4.1 | $2.00 | $8.00 | ~1M | |
| gpt-4.1-mini | $0.40 | $1.60 | — | |
| gpt-4.1-nano | $0.10 | $0.40 | — | |
| o3 | $2.00 | $8.00 | 200K | Reasoning |
| o3-pro | — | — | — | Premium reasoning |
| o4-mini | $1.10 | $4.40 | 200K | Fast reasoning |

---

### 4B. Anthropic/Claude — Messages API

**SDK:** `@anthropic-ai/sdk` npm package (latest stable).

**Request format:**
```typescript
const stream = client.messages.stream({
  model: "claude-opus-4-6",  // Use frontend model ID directly (see mapping note below)
  max_tokens: 16384,
  system: "You are a helpful assistant.",
  messages: [{ role: "user", content: "Hello" }],
  thinking: { type: "enabled", budget_tokens: 10000 },  // if extendedThinking
  tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],  // if web search
});
```

**Streaming events:**
```typescript
stream.on("contentBlockStart", (block) => {
  // block.type === "thinking" or "text" — signals what's coming
});
stream.on("thinking", (thinking) => {
  // thinking delta → emit as SSE "thinking"
});
stream.on("text", (text) => {
  // text delta → emit as SSE "delta"
});
stream.on("message", (message) => {
  // final message with usage → emit as SSE "done"
});
```

**Extended thinking — two modes:**

For Opus 4.6 and Sonnet 4.6 (latest models), prefer **adaptive thinking**:
```typescript
thinking: { type: "adaptive" },
output_config: { effort: "high" }  // "max" | "high" | "medium" | "low"
```
This lets Claude decide how much to think based on task complexity.

For older models (Opus 4.5, Sonnet 4.5, Haiku 4.5, etc.), use **budget-based thinking**:
```typescript
thinking: { type: "enabled", budget_tokens: 10000 }
```

**IMPORTANT constraints when thinking is enabled:**
- Do NOT set `temperature` (it must be 1.0, which is the default)
- Set `max_tokens` high enough to accommodate both thinking and response tokens

**Web search tools (use latest versions):**
```typescript
{ type: "web_search_20260209", name: "web_search", max_uses: 5 }
{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 10 }
```
Web search pricing: $10 per 1,000 searches on top of standard token costs.

**Model ID mapping:**
Some Claude model IDs work without date suffixes, some need them:
- `claude-opus-4-6` — works as-is (no suffix needed)
- `claude-sonnet-4-6` — works as-is
- `claude-haiku-4-5-20251001` — needs date suffix
- `claude-sonnet-4-5-20250929` — needs date suffix
- `claude-opus-4-5-20251101` — needs date suffix
- Other older models — need their full ID with date suffix

Since ADE already returns the correct IDs with date suffixes where needed, you can generally pass the model ID from ADE directly to the Anthropic API. Maintain a mapping in `config/models.ts` for cases where the frontend ID differs from the API ID.

**Models that support extended thinking:**
`claude-opus-4-6`, `claude-sonnet-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-4-5-20250929`, `claude-haiku-4-5-20251001`, `claude-opus-4-1-20250805`, `claude-opus-4-20250514`, `claude-sonnet-4-20250514`, `claude-3-7-sonnet-20250219`

**Models that do NOT support extended thinking:**
`claude-3-5-haiku-20241022`, `claude-3-haiku-20240307`

**Key pricing (per 1M tokens):**

| Model | Input | Output |
|---|---|---|
| Opus 4.6 | $5.00 | $25.00 |
| Sonnet 4.6 | $3.00 | $15.00 |
| Opus 4.5 | $5.00 | $25.00 |
| Sonnet 4.5 | $3.00 | $15.00 |
| Haiku 4.5 | $0.80 | $4.00 |

---

### 4C. Google Gemini — @google/genai SDK

**SDK:** `@google/genai` npm package. This is the NEW official SDK — do NOT use the old `@google/generative-ai` which was sunset August 2025.

**Request format:**
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const stream = await ai.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: [{ role: "user", parts: [{ text: "Hello" }] }],
  config: {
    systemInstruction: "You are a helpful assistant.",
    maxOutputTokens: 8192,
    temperature: 1.0,  // Keep at 1.0 for Gemini models with thinking
    tools: [{ googleSearch: {} }],  // optional — enables grounded search
    thinkingConfig: {
      thinkingBudget: 8192,     // 0-32768 tokens, -1 for dynamic (Gemini 2.5)
      includeThoughts: true
    }
  }
});
```

**Streaming:**
```typescript
for await (const chunk of stream) {
  // chunk.text — text delta → emit as SSE "delta"
  // chunk.candidates[0].content.parts — may contain thinking parts (thought: true)
  // Thinking parts → emit as SSE "thinking"
}
```

**Thinking mode:**
- Gemini 2.5 models: Use `thinkingConfig: { thinkingBudget: 8192, includeThoughts: true }`
- Thinking tokens appear as parts with `thought: true`

**Grounding with Google Search:**
Add `tools: [{ googleSearch: {} }]`. Response includes `groundingMetadata` with:
- `webSearchQueries` — queries the model ran
- `groundingChunks` — sources with title/URI
- `groundingSupports` — text-to-source mapping

Extract and normalize citations from `groundingMetadata` to the standard citations event format.

**Key pricing (per 1M tokens):**

| Model | Input | Output |
|---|---|---|
| Gemini 2.5 Pro | $1.25 | $10.00 (≤200K) |
| Gemini 2.5 Flash | $0.30 | $2.50 |
| Gemini 2.5 Flash-Lite | $0.10 | $0.40 |

---

### 4D. Perplexity — OpenAI-compatible API

**SDK:** Use the `openai` npm package with a custom `baseURL`. No separate Perplexity SDK needed.

```typescript
import OpenAI from "openai";
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai"
});
```

**Request format:**
```typescript
const stream = await perplexity.chat.completions.create({
  model: "sonar-pro",
  messages: [
    { role: "system", content: "Be precise and concise." },
    { role: "user", content: "What is quantum computing?" }
  ],
  stream: true,
  search_recency_filter: "month",  // optional: "hour" | "day" | "week" | "month"
  return_citations: true,
  return_related_questions: true,
  web_search_options: {
    search_context_size: "low"     // "low" ($5/1K) | "medium" | "high" ($12-14/1K) — controls cost
  }
});
```

**Streaming:**
```typescript
for await (const chunk of stream) {
  // chunk.choices[0].delta.content — text delta → emit as SSE "delta"
  // Final chunk may include citations at top level (not inside choices)
}
```

**Citation handling:**
- Citations are at the **top level** of the response (not inside `choices`)
- The response text uses `[1]`, `[2]` bracketed references that map to **0-indexed** positions in the `citations[]` array
- Also check `search_results[]` for richer metadata (title, url, snippet, date)
- Extract and forward as SSE "citations" event

**Additional Perplexity models to support:**
- `sonar-reasoning-pro` — Chain-of-thought reasoning with visible `<think>` section. Parse and strip `<think>...</think>` tags — send content inside them as SSE "thinking" events, and the rest as "delta" events
- `sonar-deep-research` — Long-form research reports. Supports async via `POST /async/chat/completions`

**IMPORTANT:** Every Perplexity request performs a web search — this is their core value prop. Always extract and forward citations.

**Key pricing (per 1M tokens):**

| Model | Input | Output | Search |
|---|---|---|---|
| sonar-pro | $3.00 | $15.00 | +$5/1K searches |
| sonar | $1.00 | $1.00 | +$5/1K searches |

---

## 5. STREAMING ARCHITECTURE

This is critical. The user experience depends on zero-delay streaming from provider → backend → frontend.

```
Frontend (EventSource/fetch) ←——SSE——→ Backend API Route ←——stream——→ AI Provider SDK
```

### Implementation for Next.js on Vercel

- Use the **Web Streams API** with `ReadableStream` and `TransformStream`
- Return a `Response` object with `Content-Type: text/event-stream`
- Use `TextEncoder` to encode SSE events
- For each provider, consume their streaming SDK output and re-emit as standardized SSE events

### SSE Event Format (standardized across all providers)

```
event: routing\ndata: {JSON}\n\n       — ADE routing result (sent FIRST, before any AI output)
event: thinking\ndata: {JSON}\n\n      — Extended thinking / reasoning content
event: delta\ndata: {JSON}\n\n         — Text content chunk {"content": "..."}
event: citations\ndata: {JSON}\n\n     — Search citations (Perplexity, OpenAI, Gemini, Anthropic web search)
event: done\ndata: {JSON}\n\n          — Completion with usage stats
event: error\ndata: {JSON}\n\n         — Error occurred
```

### Critical Requirements

- The SSE connection must be kept alive until the provider finishes streaming
- Use `AbortController` to support cancellation (stop button)
- Buffer and forward chunks immediately — do NOT wait for full response
- Handle provider-specific streaming formats and normalize them to the standard SSE events above
- Vercel Serverless Functions: 60s timeout on Hobby, 300s on Pro. For long responses (deep research, extended thinking), ensure the function stays within limits. Use Vercel's `maxDuration` config
- Set response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`

### Edge Runtime

Use Edge Runtime (`export const runtime = "edge"`) for the streaming chat endpoint to avoid cold starts and get better streaming performance on Vercel. Edge Runtime supports Web Streams natively.

---

## 6. PROJECT STRUCTURE

```
araviel-backend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── v1/
│   │           ├── chat/
│   │           │   ├── route.ts              — POST: main chat + streaming
│   │           │   ├── stop/route.ts         — POST: cancel streaming
│   │           │   └── retry/route.ts        — POST: retry with different model
│   │           ├── conversations/
│   │           │   ├── route.ts              — GET: list, POST: create
│   │           │   └── [id]/
│   │           │       ├── route.ts          — GET, PATCH, DELETE
│   │           │       └── messages/route.ts — GET: paginated messages
│   │           ├── models/
│   │           │   └── route.ts              — GET: all models
│   │           ├── usage/
│   │           │   └── route.ts              — GET: usage stats
│   │           └── health/
│   │               └── route.ts              — GET: health check
│   ├── lib/
│   │   ├── providers/
│   │   │   ├── base.ts                       — Abstract base provider class
│   │   │   ├── openai.ts                     — OpenAI Responses API provider
│   │   │   ├── anthropic.ts                  — Anthropic Messages API provider
│   │   │   ├── gemini.ts                     — Google Gemini provider
│   │   │   ├── perplexity.ts                 — Perplexity provider
│   │   │   └── index.ts                      — Provider factory/registry
│   │   ├── ade/
│   │   │   └── client.ts                     — ADE API client
│   │   ├── db/
│   │   │   ├── client.ts                     — Supabase client singleton
│   │   │   ├── conversations.ts              — Conversation CRUD operations
│   │   │   ├── messages.ts                   — Message CRUD operations
│   │   │   └── usage.ts                      — Usage logging operations
│   │   ├── streaming/
│   │   │   └── sse.ts                        — SSE utilities (encoder, event formatter)
│   │   ├── config/
│   │   │   ├── models.ts                     — Model ID mapping + capabilities
│   │   │   └── providers.ts                  — Provider configuration
│   │   └── errors/
│   │       └── index.ts                      — Custom error classes
│   └── types/
│       ├── chat.ts                           — Chat, Message, Conversation types
│       ├── provider.ts                       — Provider interfaces
│       ├── ade.ts                            — ADE request/response types
│       └── sse.ts                            — SSE event types
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## 7. ARCHITECTURE & DESIGN PATTERNS

### Provider Pattern (Strategy + Factory)

Create an abstract `BaseProvider` class that each provider extends:

```typescript
abstract class BaseProvider {
  abstract readonly name: string;
  abstract readonly id: string;

  abstract stream(params: ProviderStreamParams): AsyncGenerator<SSEEvent>;
  abstract mapModelId(frontendModelId: string): string;
  abstract estimateCost(inputTokens: number, outputTokens: number, modelId: string): number;
}
```

Each provider (OpenAI, Anthropic, Gemini, Perplexity) implements this interface, handling their specific SDK calls and normalizing output to the standard SSE event format. A `ProviderFactory` maps provider names to instances.

### Chat Pipeline (single responsibility, clear stages)

The main `/api/v1/chat` route orchestrates a pipeline:

1. **Validate** — Parse and validate the request body
2. **Route** — Call ADE with `{ prompt, modality: "text", humanContext?, constraints? }` to get the optimal model (or use specified model). Map ADE's response to the frontend format.
3. **Persist** — Create/get conversation, save user message
4. **Stream** — Get the correct provider, call `provider.stream()`, pipe SSE events to the response
5. **Complete** — On stream end, save assistant message + usage log to database

Each stage is a separate function. The route handler composes them.

### ADE Client

```typescript
class AdeClient {
  private baseUrl = process.env.ADE_BASE_URL || "https://ade-sandy.vercel.app/api/v1";

  async route(params: {
    prompt: string;
    modality?: string;        // defaults to "text"
    conversationContext?: { conversationId?: string; previousModelUsed?: string; messageCount?: number };
    humanContext?: { temporalContext?: { localTime?: string; isWorkingHours?: boolean } };
    constraints?: { allowedModels?: string[] };
  }): Promise<AdeRouteResponse> { ... }

  async submitFeedback(decisionId: string, signal: "positive" | "neutral" | "negative"): Promise<void> { ... }
}
```

The client handles:
- Mapping the backend's `timeOfDay` to ADE's `humanContext.temporalContext` format
- When `modelId` is manually specified: using `constraints.allowedModels: [modelId]` OR skipping ADE entirely
- Mapping ADE's response format to the frontend's expected field names

### SSE Encoder Utility

```typescript
function encodeSSE(event: string, data: object): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
```

### Model ID Mapping & Capabilities

Maintain a mapping in `config/models.ts` that the backend uses to:
1. Map frontend model IDs to actual API model IDs where they differ
2. Track which models support which special features (since ADE's public API doesn't expose all capability flags)

```typescript
const MODEL_CONFIG: Record<string, {
  apiModelId: string;
  provider: "anthropic" | "openai" | "google" | "perplexity";
  supportsExtendedThinking: boolean;
  supportsReasoning: boolean;
  supportsWebSearch: boolean;
  thinkingMode?: "adaptive" | "budget";  // For Anthropic: adaptive for 4.6, budget for older
  pricing: { inputPer1M: number; outputPer1M: number };
}> = {
  "claude-opus-4-6": {
    apiModelId: "claude-opus-4-6",
    provider: "anthropic",
    supportsExtendedThinking: true,
    supportsReasoning: false,
    supportsWebSearch: false,
    thinkingMode: "adaptive",
    pricing: { inputPer1M: 5.00, outputPer1M: 25.00 }
  },
  "gpt-5.2": {
    apiModelId: "gpt-5.2",
    provider: "openai",
    supportsExtendedThinking: false,
    supportsReasoning: true,
    supportsWebSearch: false,
    pricing: { inputPer1M: 1.75, outputPer1M: 14.00 }
  },
  // ... all 32 models
};
```

### Error Handling

- Create custom error classes: `ProviderError`, `RateLimitError`, `ValidationError`, `AdeError`
- Each provider catches SDK errors and wraps them in `ProviderError` with standardized codes
- The route handler catches errors and sends them as SSE `error` events
- Implement exponential backoff retry for transient errors (429, 500, 503) within providers — retry up to 3 times with 1s, 2s, 4s delays

### AbortController for Cancellation

- Create an `AbortController` per request
- Pass its signal to provider SDK calls
- On stop request, abort the controller
- Clean up partial responses and save what was streamed

---

## 8. ENVIRONMENT VARIABLES

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
PERPLEXITY_API_KEY=

# ADE
ADE_BASE_URL=https://ade-sandy.vercel.app/api/v1

# App
FRONTEND_URL=https://araviel-web.vercel.app
NODE_ENV=development
```

---

## 9. CORS CONFIGURATION

Since the frontend (Vite SPA on different domain) calls this backend, configure CORS in `next.config.ts` or via middleware:

- Allow origins: `https://araviel-web.vercel.app`, `http://localhost:5173` (Vite dev)
- Allow methods: `GET, POST, PATCH, DELETE, OPTIONS`
- Allow headers: `Content-Type, Authorization`
- Allow credentials: `true`
- Handle preflight `OPTIONS` requests

---

## 10. CODE QUALITY REQUIREMENTS

- **TypeScript** — Strict mode. All types explicitly defined. No `any`.
- **DRY** — No duplicated logic. Provider-specific code isolated in provider classes. Shared logic in utilities.
- **SOLID** — Single responsibility for each file/class. Open/closed via provider abstraction. Dependency injection for testability.
- **Simple** — No over-engineering. No unnecessary abstractions. If a function is used once, inline it. Three similar lines is better than a premature abstraction.
- **Production-grade** — Proper error handling at every boundary. Graceful degradation. Meaningful error messages.
- **Maintainable** — Clear file names. Logical directory structure. Self-documenting code. Comments only where logic is non-obvious.
- **No auth** — Don't build auth yet. But structure the code so adding auth middleware later is a one-line change per route.
- **Vercel-ready** — Use Edge Runtime for streaming routes. Respect function timeout limits. Use `maxDuration` in `vercel.json` if needed.

---

## 11. DEPENDENCIES

```json
{
  "dependencies": {
    "next": "latest",
    "openai": "latest",
    "@anthropic-ai/sdk": "latest",
    "@google/genai": "latest",
    "@supabase/supabase-js": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

- Perplexity uses the `openai` package with custom `baseURL` — no separate SDK needed.
- Do NOT use `@google/generative-ai` — it was sunset in August 2025. Use `@google/genai`.
- Do NOT use old OpenAI Chat Completions API — use the new Responses API.

---

## 12. IMPLEMENTATION ORDER

Build in this order:

1. Project setup (Next.js, TypeScript, dependencies, env config, CORS)
2. Supabase client + DB operations (verify schema first, build CRUD)
3. SSE streaming utilities
4. ADE client (with correct request/response types matching ADE's actual API)
5. Base provider class + provider factory
6. Anthropic provider (straightforward streaming, test extended thinking)
7. OpenAI provider (Responses API, test reasoning models)
8. Gemini provider (`@google/genai` SDK, test thinking mode)
9. Perplexity provider (OpenAI-compatible, test citations)
10. Main `/api/v1/chat` route (orchestrates everything: validate → route → persist → stream → complete)
11. Stop + Retry routes
12. Conversation CRUD routes
13. Models + Usage + Health routes
14. Test all providers with real API keys
15. Deploy to Vercel

---

## 13. KEY REMINDERS

- The frontend will be updated separately to call this backend instead of using mock data. For now, build the backend to the SSE contract defined above.
- **ADE is already deployed and working.** Just call it — don't rebuild routing logic. But call it with the CORRECT request format (`prompt` + `modality` are both required, `humanContext` is a nested object, not `{ timeOfDay }`).
- **Map ADE responses to frontend format.** ADE returns `primaryModel`/`backupModels` with `reasoning: { summary, factors }`. The frontend expects `modelId`/`modelName`/`alternateModels` with `reasoning` as a plain string. The backend is responsible for this translation in the `routing` SSE event.
- Every response must be streamed. Never buffer the full response before sending.
- Perplexity ALWAYS does web search — extract and forward citations.
- OpenAI web search returns citations as annotations on text — extract and normalize.
- Gemini grounding returns citations in `groundingMetadata` — extract and normalize.
- Anthropic web search returns results as tool_use blocks — extract and normalize.
- Extended thinking (Anthropic), reasoning (OpenAI o-series), and thinking mode (Gemini) all produce "thinking" content — stream it as `thinking` events.
- Model IDs from the frontend need mapping to actual API model IDs. Some are identical, some need date suffixes. Since ADE returns the correct IDs, use ADE's output when in auto mode.
- Save ALL messages and usage to the database, but don't let DB writes block the streaming response. Use fire-and-forget patterns for writes that happen after streaming completes.
- After a conversation completes, call ADE's feedback endpoint (`POST /api/v1/feedback`) with the `decisionId` to help ADE improve its routing.
- **Use ADE's `analysis` field** (intent, domain, complexity, tone) to tune system prompts. For example, if ADE detects `intent: "coding"`, adjust the system prompt accordingly. If `complexity: "demanding"`, increase thinking budgets.
- This is a production MVP that will be launched. Build it clean, build it right, build it simple.
