# Araviel — Complete API Reference

This document covers **every API endpoint** across both systems:

- **Part A** — ADE (Araviel Decision Engine) endpoints — already deployed at `https://ade-sandy.vercel.app/api/v1`
- **Part B** — Araviel Backend endpoints — to be built, will be deployed on Vercel

---

# PART A: ADE ENDPOINTS (EXISTING)

Base URL: `https://ade-sandy.vercel.app/api/v1`

All ADE error responses use this format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": "Optional additional context"
}
```

---

## A1. POST `/api/v1/route` — Model Routing

Analyzes a user prompt and selects the optimal AI model.

### Request

```
POST /api/v1/route
Content-Type: application/json
```

```json
{
  "prompt": "string (REQUIRED)",
  "modality": "string (REQUIRED)",
  "context": {
    "userId": "string?",
    "conversationId": "string?",
    "previousModelUsed": "string?",
    "messageCount": "number?",
    "sessionDurationMinutes": "number?"
  },
  "humanContext": {
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
  "constraints": {
    "maxCostPer1kTokens": "number?",
    "maxLatencyMs": "number?",
    "allowedModels": ["string[]?"],
    "excludedModels": ["string[]?"],
    "requireStreaming": "boolean?",
    "requireVision": "boolean?",
    "requireAudio": "boolean?"
  }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `prompt` | string | **YES** | Must be non-empty after trimming |
| `modality` | enum | **YES** | `text`, `image`, `voice`, `text+image`, `text+voice` (case-insensitive) |
| `context` | object | no | Must be an object if provided, not null |
| `humanContext` | object | no | Must be an object if provided, not null. All sub-objects and their fields are optional |
| `constraints` | object | no | Must be an object if provided, not null. Use `allowedModels` to force a specific model |

### Response — `200 OK`

```json
{
  "decisionId": "ade_abc123def456",
  "primaryModel": {
    "id": "claude-opus-4-6",
    "name": "Claude Opus 4.6",
    "provider": "anthropic",
    "score": 0.943,
    "reasoning": {
      "summary": "Claude Opus 4.6 excels at complex reasoning tasks with demanding complexity and professional tone.",
      "factors": [
        {
          "name": "Task Fitness",
          "impact": "positive",
          "weight": 0.45,
          "detail": "Strong coding performance (0.98) matches detected intent."
        },
        {
          "name": "Complexity Match",
          "impact": "positive",
          "weight": 0.25,
          "detail": "Model handles demanding queries well."
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
      "reasoning": {
        "summary": "Strong alternative with broad capabilities.",
        "factors": [
          {
            "name": "Task Fitness",
            "impact": "positive",
            "weight": 0.45,
            "detail": "Good coding performance (0.95)."
          }
        ]
      }
    }
  ],
  "confidence": 0.943,
  "analysis": {
    "intent": "coding",
    "domain": "technology",
    "complexity": "demanding",
    "tone": "professional",
    "modality": "text",
    "keywords": ["algorithm", "optimize", "performance"],
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

| Field | Type | Description |
|---|---|---|
| `decisionId` | string | Unique ID for this routing decision — save it for feedback |
| `primaryModel` | ModelRecommendation | The recommended model |
| `primaryModel.id` | string | Model ID (e.g., `claude-opus-4-6`) |
| `primaryModel.name` | string | Human-readable name |
| `primaryModel.provider` | enum | `anthropic`, `openai`, `google`, `perplexity` |
| `primaryModel.score` | number | Confidence score (0–1) |
| `primaryModel.reasoning.summary` | string | Human-readable explanation |
| `primaryModel.reasoning.factors` | array | Detailed scoring factors with name, impact, weight, detail |
| `backupModels` | ModelRecommendation[] | Alternative models, same shape as `primaryModel` |
| `confidence` | number | Overall routing confidence (0–1) |
| `analysis.intent` | enum | `coding`, `creative`, `analysis`, `factual`, `conversation`, `task`, `brainstorm`, `translation`, `summarization`, `extraction` |
| `analysis.domain` | enum | `technology`, `business`, `health`, `legal`, `finance`, `education`, `science`, `creative_arts`, `lifestyle`, `general` |
| `analysis.complexity` | enum | `quick`, `standard`, `demanding` |
| `analysis.tone` | enum | `casual`, `focused`, `curious`, `frustrated`, `urgent`, `playful`, `professional` |
| `analysis.keywords` | string[] | Extracted keywords from the prompt |
| `analysis.humanContextUsed` | boolean | Whether humanContext influenced the decision |
| `timing` | object | Performance metrics in milliseconds |

### Errors

| Status | Condition | Example |
|---|---|---|
| `400` | Missing or invalid `prompt` | `{ "error": "Missing or invalid prompt", "code": "..." }` |
| `400` | Missing or invalid `modality` | `{ "error": "Invalid modality. Must be one of: text, image, voice, text+image, text+voice" }` |
| `400` | `context`/`humanContext`/`constraints` is not an object | `{ "error": "Missing or invalid humanContext" }` |
| `400` | Invalid JSON body | `{ "error": "Invalid JSON in request body" }` |
| `500` | Internal error | `{ "error": "An unexpected error occurred" }` |

### Side Effects

- Asynchronously stores the decision to Vercel KV (fire-and-forget, does not block the response)

---

## A2. POST `/api/v1/analyze` — Prompt Analysis Only

Returns intent/domain/complexity analysis without selecting a model. Useful for debugging or system prompt tuning.

### Request

```
POST /api/v1/analyze
Content-Type: application/json
```

```json
{
  "prompt": "string (REQUIRED)",
  "modality": "string (REQUIRED)"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `prompt` | string | **YES** | Must be non-empty after trimming |
| `modality` | enum | **YES** | `text`, `image`, `voice`, `text+image`, `text+voice` |

### Response — `200 OK`

```json
{
  "analysis": {
    "intent": "coding",
    "domain": "technology",
    "complexity": "demanding",
    "tone": "focused",
    "modality": "text",
    "keywords": ["algorithm", "binary tree", "optimize"],
    "humanContextUsed": false
  },
  "timing": {
    "analysisMs": 2.87
  }
}
```

### Errors

Same as `/api/v1/route` — 400 for validation, 500 for internal errors.

---

## A3. GET `/api/v1/models` — List All Models

Returns all models known to ADE with pricing, capabilities, and performance data.

### Request

```
GET /api/v1/models
```

No request body. No query parameters.

### Response — `200 OK`

```json
{
  "models": [
    {
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6",
      "provider": "anthropic",
      "description": "Latest flagship model with exceptional reasoning and coding abilities.",
      "pricing": {
        "inputPer1k": 0.005,
        "outputPer1k": 0.025,
        "cachedInputPer1k": 0.0025
      },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 64000,
        "supportsStreaming": true,
        "supportsVision": true,
        "supportsAudio": false,
        "supportsFunctionCalling": true,
        "supportsJsonMode": true
      },
      "performance": {
        "avgLatencyMs": 2000,
        "reliabilityPercent": 99.5
      },
      "available": true
    }
  ],
  "count": 32
}
```

| Field | Type | Description |
|---|---|---|
| `models` | ModelInfo[] | Array of all models |
| `count` | number | Total count of models |
| `models[].id` | string | Model ID used in routing |
| `models[].provider` | enum | `anthropic`, `openai`, `google`, `perplexity` |
| `models[].pricing.inputPer1k` | number | Cost per 1K input tokens |
| `models[].pricing.outputPer1k` | number | Cost per 1K output tokens |
| `models[].pricing.cachedInputPer1k` | number? | Optional cached input cost |
| `models[].capabilities` | object | What the model supports |
| `models[].performance` | object | Average latency and reliability |
| `models[].available` | boolean | Whether the model is currently available |

**NOTE:** The public ModelInfo response does NOT include `supportsExtendedThinking`, `supportsReasoning`, or `supportsWebSearch`. The backend must track these capabilities separately.

### Errors

Never fails — always returns `200`.

---

## A4. GET `/api/v1/models/:id` — Get Single Model

Returns details for a specific model.

### Request

```
GET /api/v1/models/claude-opus-4-6
```

### Response — `200 OK`

Same `ModelInfo` shape as a single element from the `/models` list.

### Errors

| Status | Condition |
|---|---|
| `404` | Model ID not found |

---

## A5. POST `/api/v1/feedback` — Submit Routing Feedback

Submit feedback on a routing decision to improve ADE over time.

### Request

```
POST /api/v1/feedback
Content-Type: application/json
```

```json
{
  "decisionId": "string (REQUIRED)",
  "signal": "string (REQUIRED)",
  "comment": "string (OPTIONAL)"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `decisionId` | string | **YES** | Must match a `decisionId` from a previous `/route` response |
| `signal` | enum | **YES** | `positive`, `neutral`, `negative` (case-insensitive) |
| `comment` | string | no | Free-text feedback |

### Response — `200 OK`

```json
{
  "success": true,
  "decisionId": "ade_abc123def456",
  "message": "Feedback recorded successfully"
}
```

### Errors

| Status | Condition | Example |
|---|---|---|
| `400` | Missing/invalid `decisionId` | `{ "error": "Missing or invalid decisionId" }` |
| `400` | Missing/invalid `signal` | `{ "error": "Invalid signal. Must be one of: positive, neutral, negative" }` |
| `400` | `comment` is not a string | `{ "error": "Comment must be a string" }` |
| `404` | `decisionId` not found in KV | `{ "error": "Decision ade_abc123 not found" }` |
| `500` | KV storage failure | `{ "error": "Failed to store feedback" }` |

---

## A6. GET `/api/v1/health` — Health Check

### Request

```
GET /api/v1/health
```

No request body. No query parameters.

### Response — `200 OK` (always)

```json
{
  "status": "healthy",
  "timestamp": "2026-02-21T14:30:00.000Z",
  "version": "0.1.0",
  "services": {
    "kv": "connected"
  }
}
```

| Field | Type | Values |
|---|---|---|
| `status` | enum | `healthy` (KV connected), `degraded` (KV disconnected/unknown), `unhealthy` (never used currently) |
| `timestamp` | string | ISO 8601 timestamp |
| `version` | string | From `package.json` or `"1.0.0"` fallback |
| `services.kv` | enum | `connected`, `disconnected`, `unknown` |

### Errors

Never fails — always returns `200`. KV check errors result in `status: "degraded"` with `kv: "unknown"`.

---

# PART B: ARAVIEL BACKEND ENDPOINTS (TO BUILD)

Base URL: TBD (will be `https://<app>.vercel.app/api/v1`)

All backend error responses (non-streaming) use this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Optional additional context"
}
```

For streaming endpoints, errors are sent as SSE events:

```
event: error
data: {"message":"Human-readable error","code":"ERROR_CODE","retryAfter":5}
```

---

## B1. POST `/api/v1/chat` — Main Chat Endpoint (Streaming)

The primary endpoint. Accepts a user message, routes via ADE (or uses a specified model), calls the AI provider, and streams the response back as Server-Sent Events.

### Request

```
POST /api/v1/chat
Content-Type: application/json
```

```json
{
  "conversationId": "uuid or null",
  "message": "string (REQUIRED)",
  "modelId": "string or null",
  "mode": "auto",
  "extendedThinking": false,
  "deepResearch": false,
  "googleThinking": false,
  "timeOfDay": "work_hours"
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `conversationId` | string \| null | no | null | UUID of existing conversation. Null creates a new one. |
| `message` | string | **YES** | — | The user's message text |
| `modelId` | string \| null | no | null | Specific model to use. Null = auto mode (ADE decides). |
| `mode` | enum | no | `"auto"` | `auto`, `code`, `write` — influences system prompt |
| `extendedThinking` | boolean | no | false | Enable Anthropic extended thinking |
| `deepResearch` | boolean | no | false | Enable OpenAI deep research mode |
| `googleThinking` | boolean | no | false | Enable Gemini thinking mode |
| `timeOfDay` | string | no | — | Mapped to ADE's `humanContext.temporalContext` |

### Response — `200 OK` (SSE Stream)

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

The response is a stream of Server-Sent Events. Events arrive in this order:

#### Event 1: `routing` (sent first, exactly once)

```
event: routing
data: {"modelId":"claude-opus-4-6","modelName":"Claude Opus 4.6","provider":"anthropic","score":0.943,"reasoning":"Claude Opus 4.6 excels at complex reasoning tasks...","alternateModels":[{"modelId":"gpt-5.2","modelName":"GPT-5.2","provider":"openai","score":0.912,"reasoning":"Strong alternative with broad capabilities."}],"conversationId":"550e8400-e29b-41d4-a716-446655440000","adeDecisionId":"ade_abc123","isManualSelection":false}
```

| Field | Type | Description |
|---|---|---|
| `modelId` | string | Selected model ID (from ADE's `primaryModel.id`) |
| `modelName` | string | Human-readable name (from ADE's `primaryModel.name`) |
| `provider` | enum | `anthropic`, `openai`, `google`, `perplexity` |
| `score` | number \| null | ADE confidence (0–1), null if manual selection |
| `reasoning` | string | ADE reasoning summary (from `primaryModel.reasoning.summary`), empty string if manual |
| `alternateModels` | array | Backup models (from ADE's `backupModels`, remapped) |
| `alternateModels[].modelId` | string | From `backupModels[].id` |
| `alternateModels[].modelName` | string | From `backupModels[].name` |
| `alternateModels[].provider` | string | From `backupModels[].provider` |
| `alternateModels[].score` | number | From `backupModels[].score` |
| `alternateModels[].reasoning` | string | From `backupModels[].reasoning.summary` |
| `conversationId` | string | UUID of the conversation (new or existing) |
| `adeDecisionId` | string \| null | ADE's `decisionId` for feedback, null if manual |
| `isManualSelection` | boolean | True if `modelId` was specified in the request |

#### Event 2+: `thinking` (zero or more, before/during text)

Only emitted when extended thinking, reasoning, or Gemini thinking is active.

```
event: thinking
data: {"content":"Let me analyze this step by step. First, I need to consider..."}
```

| Field | Type | Description |
|---|---|---|
| `content` | string | Chunk of thinking/reasoning text |

**When thinking events are emitted:**
- Anthropic: When `extendedThinking: true` — thinking content blocks with `type: "thinking"`
- OpenAI o-series: When reasoning is active — `response.reasoning_summary_text.delta` events
- Gemini: When `googleThinking: true` — parts with `thought: true`
- Perplexity `sonar-reasoning-pro`: Content inside `<think>...</think>` tags (stripped from main text)

#### Event 3+: `delta` (one or more — the main AI response)

```
event: delta
data: {"content":"Here is "}
```

```
event: delta
data: {"content":"the answer to "}
```

```
event: delta
data: {"content":"your question."}
```

| Field | Type | Description |
|---|---|---|
| `content` | string | A chunk of the AI's response text. Concatenate all chunks to form the full response. |

#### Event 4 (optional): `citations` (zero or one)

Only emitted when the AI used web search (Perplexity always, OpenAI/Gemini/Anthropic when web search tools are active).

```
event: citations
data: {"citations":[{"title":"Wikipedia: Quantum Computing","url":"https://en.wikipedia.org/wiki/Quantum_computing","snippet":"Quantum computing is a type of computation..."},{"title":"IBM Quantum","url":"https://www.ibm.com/quantum","snippet":"IBM Quantum leads the world..."}]}
```

| Field | Type | Description |
|---|---|---|
| `citations` | array | List of sources used by the AI |
| `citations[].title` | string | Source page title |
| `citations[].url` | string | Source URL |
| `citations[].snippet` | string | Relevant excerpt from the source |

**Citation sources by provider:**
- **Perplexity**: Top-level `citations[]` and `search_results[]` in the response. Text uses `[1]`, `[2]` references (0-indexed into the array).
- **OpenAI**: `output[].content[].annotations[]` with `url`, `title`, `start_index`, `end_index` when `web_search_preview` tool is used.
- **Gemini**: `groundingMetadata.groundingChunks` with title/URI when `googleSearch` tool is used.
- **Anthropic**: Tool use blocks when `web_search` tool is used.

#### Event 5: `done` (sent last, exactly once)

```
event: done
data: {"messageId":"550e8400-e29b-41d4-a716-446655440001","usage":{"inputTokens":150,"outputTokens":430,"cost":0.0023},"thinkingData":{"routingDuration":"45","thinkingDuration":"2100","totalDuration":"5400"}}
```

| Field | Type | Description |
|---|---|---|
| `messageId` | string | UUID of the saved assistant message in the database |
| `usage.inputTokens` | number | Input tokens consumed |
| `usage.outputTokens` | number | Output tokens generated |
| `usage.cost` | number | Estimated cost in USD |
| `thinkingData.routingDuration` | string | ADE routing time in ms |
| `thinkingData.thinkingDuration` | string | Extended thinking time in ms (0 if not used) |
| `thinkingData.totalDuration` | string | Total request time in ms |

#### Error Event (replaces `done` on failure)

```
event: error
data: {"message":"Rate limit exceeded. Try again in 5 seconds.","code":"RATE_LIMIT","retryAfter":5}
```

| Field | Type | Description |
|---|---|---|
| `message` | string | Human-readable error |
| `code` | enum | `VALIDATION_ERROR`, `ADE_ERROR`, `PROVIDER_ERROR`, `RATE_LIMIT`, `TIMEOUT`, `INTERNAL_ERROR` |
| `retryAfter` | number? | Seconds to wait before retrying (only for `RATE_LIMIT`) |

### Internal Pipeline

```
Request → Validate → Route (ADE) → Persist (DB) → Stream (Provider) → Complete (DB)
```

1. **Validate**: Check required fields, sanitize input
2. **Route**: If `modelId` is null → call ADE `POST /api/v1/route` with `{ prompt, modality: "text" }`. If `modelId` is set → skip ADE, resolve provider from model config
3. **Persist**: Create conversation if new, save user message to `messages` table
4. **Stream**: Initialize provider SDK → stream SSE events to client. Emit `routing` first, then `thinking`/`delta`/`citations` as they arrive
5. **Complete**: On stream end → save assistant message, save to `usage_logs` (fire-and-forget, don't block)

---

## B2. POST `/api/v1/chat/stop` — Cancel Streaming

Aborts an in-flight streaming response.

### Request

```
POST /api/v1/chat/stop
Content-Type: application/json
```

```json
{
  "conversationId": "string (REQUIRED)",
  "messageId": "string (REQUIRED)"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `conversationId` | string | **YES** | UUID of the conversation |
| `messageId` | string | **YES** | UUID of the assistant message being generated |

### Response — `200 OK`

```json
{
  "success": true,
  "messageId": "550e8400-e29b-41d4-a716-446655440001",
  "partialContent": "The response so far before cancell..."
}
```

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Whether the abort was processed |
| `messageId` | string | The aborted message ID |
| `partialContent` | string | The content that was streamed before abort |

### Side Effects

- Triggers `AbortController.abort()` on the provider SDK call
- Saves the partial response content to the database
- Updates the `usage_logs` entry with partial token counts

### Errors

| Status | Condition |
|---|---|
| `400` | Missing `conversationId` or `messageId` |
| `404` | Conversation or message not found |
| `409` | Message is not currently streaming |
| `500` | Internal error |

---

## B3. POST `/api/v1/chat/retry` — Retry Message

Deletes the previous assistant response and re-runs the pipeline, optionally with a different model.

### Request

```
POST /api/v1/chat/retry
Content-Type: application/json
```

```json
{
  "conversationId": "string (REQUIRED)",
  "messageId": "string (REQUIRED)",
  "modelId": "string or null"
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `conversationId` | string | **YES** | — | UUID of the conversation |
| `messageId` | string | **YES** | — | UUID of the assistant message to replace |
| `modelId` | string \| null | no | null | Override model. Null = re-route via ADE |

### Response — `200 OK` (SSE Stream)

Same SSE stream format as `POST /api/v1/chat`. The old assistant message is deleted and a new one is created.

### Side Effects

- Deletes the previous assistant message from the `messages` table
- Deletes the associated `usage_logs` entry
- Creates a new assistant message and usage log
- The user message that preceded the deleted message is preserved

### Errors

| Status | Condition |
|---|---|
| `400` | Missing required fields |
| `404` | Conversation or message not found |
| `409` | Message is not an assistant message |
| `500` | Internal error |

---

## B4. GET `/api/v1/conversations` — List Conversations

Returns paginated list of conversations, newest first.

### Request

```
GET /api/v1/conversations?limit=20&offset=0&archived=false
```

| Query Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 20 | Max results (1–100) |
| `offset` | number | 0 | Skip N results |
| `archived` | boolean | false | Include archived conversations |

### Response — `200 OK`

```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Help me write a sorting algorithm",
      "model_id": "claude-opus-4-6",
      "provider": "anthropic",
      "created_at": "2026-02-21T14:30:00.000Z",
      "updated_at": "2026-02-21T14:35:00.000Z",
      "is_archived": false,
      "message_count": 4,
      "last_message_preview": "Here is an optimized quicksort..."
    }
  ],
  "total": 47,
  "limit": 20,
  "offset": 0
}
```

| Field | Type | Description |
|---|---|---|
| `conversations` | array | List of conversations |
| `conversations[].id` | string | UUID |
| `conversations[].title` | string | Conversation title (auto-generated from first message or user-set) |
| `conversations[].model_id` | string | Last used model ID |
| `conversations[].provider` | string | Last used provider |
| `conversations[].created_at` | string | ISO 8601 |
| `conversations[].updated_at` | string | ISO 8601 |
| `conversations[].is_archived` | boolean | Whether archived |
| `conversations[].message_count` | number | Total messages in conversation |
| `conversations[].last_message_preview` | string | Truncated last assistant message |
| `total` | number | Total matching conversations |
| `limit` | number | Applied limit |
| `offset` | number | Applied offset |

---

## B5. GET `/api/v1/conversations/:id` — Get Conversation with Messages

Returns a single conversation with all its messages.

### Request

```
GET /api/v1/conversations/550e8400-e29b-41d4-a716-446655440000
```

### Response — `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Help me write a sorting algorithm",
  "model_id": "claude-opus-4-6",
  "provider": "anthropic",
  "created_at": "2026-02-21T14:30:00.000Z",
  "updated_at": "2026-02-21T14:35:00.000Z",
  "is_archived": false,
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "user",
      "content": "Write me a quicksort in Python",
      "model_id": null,
      "model_name": null,
      "provider": null,
      "score": null,
      "reasoning": null,
      "thinking_data": null,
      "is_manual_selection": null,
      "alternate_models": null,
      "tokens_input": null,
      "tokens_output": null,
      "cost": null,
      "created_at": "2026-02-21T14:30:00.000Z"
    },
    {
      "id": "msg-002",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "assistant",
      "content": "Here's an optimized quicksort implementation...",
      "model_id": "claude-opus-4-6",
      "model_name": "Claude Opus 4.6",
      "provider": "anthropic",
      "score": 0.943,
      "reasoning": "Claude Opus 4.6 excels at complex reasoning tasks...",
      "thinking_data": {
        "routingDuration": "45",
        "thinkingDuration": "0",
        "totalDuration": "3200"
      },
      "is_manual_selection": false,
      "alternate_models": [
        {
          "modelId": "gpt-5.2",
          "modelName": "GPT-5.2",
          "provider": "openai",
          "score": 0.912,
          "reasoning": "Strong alternative..."
        }
      ],
      "tokens_input": 150,
      "tokens_output": 430,
      "cost": 0.0023,
      "created_at": "2026-02-21T14:30:05.000Z"
    }
  ]
}
```

### Errors

| Status | Condition |
|---|---|
| `404` | Conversation not found |

---

## B6. PATCH `/api/v1/conversations/:id` — Update Conversation

Update a conversation's title or archive status.

### Request

```
PATCH /api/v1/conversations/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
  "title": "Sorting Algorithms Discussion",
  "is_archived": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | no | New title |
| `is_archived` | boolean | no | Archive/unarchive |

At least one field must be provided.

### Response — `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Sorting Algorithms Discussion",
  "model_id": "claude-opus-4-6",
  "provider": "anthropic",
  "created_at": "2026-02-21T14:30:00.000Z",
  "updated_at": "2026-02-21T14:40:00.000Z",
  "is_archived": false
}
```

### Errors

| Status | Condition |
|---|---|
| `400` | No fields provided or invalid types |
| `404` | Conversation not found |

---

## B7. DELETE `/api/v1/conversations/:id` — Delete Conversation

Deletes a conversation and all its messages and usage logs.

### Request

```
DELETE /api/v1/conversations/550e8400-e29b-41d4-a716-446655440000
```

### Response — `200 OK`

```json
{
  "success": true,
  "deletedConversationId": "550e8400-e29b-41d4-a716-446655440000",
  "deletedMessageCount": 12
}
```

### Errors

| Status | Condition |
|---|---|
| `404` | Conversation not found |

---

## B8. GET `/api/v1/conversations/:id/messages` — Get Messages (Paginated)

Returns paginated messages for a conversation, oldest first.

### Request

```
GET /api/v1/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50&offset=0
```

| Query Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 50 | Max results (1–100) |
| `offset` | number | 0 | Skip N results |

### Response — `200 OK`

```json
{
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "user",
      "content": "Write me a quicksort in Python",
      "model_id": null,
      "model_name": null,
      "provider": null,
      "score": null,
      "reasoning": null,
      "thinking_data": null,
      "is_manual_selection": null,
      "alternate_models": null,
      "tokens_input": null,
      "tokens_output": null,
      "cost": null,
      "created_at": "2026-02-21T14:30:00.000Z"
    },
    {
      "id": "msg-002",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "assistant",
      "content": "Here's an optimized quicksort implementation...",
      "model_id": "claude-opus-4-6",
      "model_name": "Claude Opus 4.6",
      "provider": "anthropic",
      "score": 0.943,
      "reasoning": "Claude Opus 4.6 excels at complex reasoning...",
      "thinking_data": { "routingDuration": "45", "thinkingDuration": "0", "totalDuration": "3200" },
      "is_manual_selection": false,
      "alternate_models": [{ "modelId": "gpt-5.2", "modelName": "GPT-5.2", "provider": "openai", "score": 0.912, "reasoning": "..." }],
      "tokens_input": 150,
      "tokens_output": 430,
      "cost": 0.0023,
      "created_at": "2026-02-21T14:30:05.000Z"
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

### Errors

| Status | Condition |
|---|---|
| `404` | Conversation not found |

---

## B9. GET `/api/v1/models` — Get All Available Models

Returns all models the backend supports, with capabilities the backend tracks beyond what ADE exposes.

### Request

```
GET /api/v1/models
```

No request body. No query parameters.

### Response — `200 OK`

```json
{
  "models": [
    {
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6",
      "provider": "anthropic",
      "description": "Latest flagship model with exceptional reasoning.",
      "pricing": {
        "inputPer1M": 5.00,
        "outputPer1M": 25.00
      },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 64000,
        "supportsStreaming": true,
        "supportsVision": true,
        "supportsExtendedThinking": true,
        "supportsReasoning": false,
        "supportsWebSearch": false,
        "thinkingMode": "adaptive"
      },
      "available": true
    },
    {
      "id": "gpt-5.2",
      "name": "GPT-5.2",
      "provider": "openai",
      "description": "OpenAI flagship model.",
      "pricing": {
        "inputPer1M": 1.75,
        "outputPer1M": 14.00
      },
      "capabilities": {
        "maxInputTokens": 272000,
        "maxOutputTokens": 128000,
        "supportsStreaming": true,
        "supportsVision": true,
        "supportsExtendedThinking": false,
        "supportsReasoning": true,
        "supportsWebSearch": true,
        "thinkingMode": null
      },
      "available": true
    },
    {
      "id": "sonar-pro",
      "name": "Sonar Pro",
      "provider": "perplexity",
      "description": "Advanced search-augmented model.",
      "pricing": {
        "inputPer1M": 3.00,
        "outputPer1M": 15.00,
        "searchPer1K": 5.00
      },
      "capabilities": {
        "maxInputTokens": 200000,
        "maxOutputTokens": 8000,
        "supportsStreaming": true,
        "supportsVision": false,
        "supportsExtendedThinking": false,
        "supportsReasoning": false,
        "supportsWebSearch": true,
        "thinkingMode": null
      },
      "available": true
    }
  ],
  "count": 32
}
```

| Field | Type | Description |
|---|---|---|
| `models[].capabilities.supportsExtendedThinking` | boolean | Anthropic extended thinking support |
| `models[].capabilities.supportsReasoning` | boolean | OpenAI reasoning (o-series, gpt-5.x) |
| `models[].capabilities.supportsWebSearch` | boolean | Built-in web search capability |
| `models[].capabilities.thinkingMode` | string \| null | `adaptive` (Anthropic 4.6), `budget` (older Anthropic), null (others) |
| `models[].pricing.searchPer1K` | number? | Only for Perplexity — cost per 1K search requests |

---

## B10. GET `/api/v1/usage` — Usage Statistics

Returns aggregated usage statistics.

### Request

```
GET /api/v1/usage?period=week
```

| Query Param | Type | Default | Description |
|---|---|---|---|
| `period` | enum | `day` | `day`, `week`, `month` — time range |

### Response — `200 OK`

```json
{
  "period": "week",
  "startDate": "2026-02-14T00:00:00.000Z",
  "endDate": "2026-02-21T23:59:59.999Z",
  "totals": {
    "conversations": 23,
    "messages": 142,
    "inputTokens": 45230,
    "outputTokens": 187450,
    "totalCost": 4.56
  },
  "byProvider": {
    "anthropic": {
      "messages": 67,
      "inputTokens": 20100,
      "outputTokens": 89000,
      "cost": 2.45
    },
    "openai": {
      "messages": 45,
      "inputTokens": 15000,
      "outputTokens": 62000,
      "cost": 1.34
    },
    "google": {
      "messages": 20,
      "inputTokens": 8000,
      "outputTokens": 28000,
      "cost": 0.52
    },
    "perplexity": {
      "messages": 10,
      "inputTokens": 2130,
      "outputTokens": 8450,
      "cost": 0.25
    }
  },
  "byModel": [
    {
      "modelId": "claude-opus-4-6",
      "modelName": "Claude Opus 4.6",
      "provider": "anthropic",
      "messages": 34,
      "inputTokens": 12000,
      "outputTokens": 52000,
      "cost": 1.56
    }
  ]
}
```

---

## B11. GET `/api/v1/health` — Backend Health Check

### Request

```
GET /api/v1/health
```

### Response — `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2026-02-21T14:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "supabase": "connected",
    "ade": "connected",
    "openai": "configured",
    "anthropic": "configured",
    "gemini": "configured",
    "perplexity": "configured"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `status` | enum | `healthy`, `degraded`, `unhealthy` |
| `services.supabase` | enum | `connected`, `disconnected` — tested with a simple query |
| `services.ade` | enum | `connected`, `disconnected` — tested by calling ADE `/health` |
| `services.openai` | enum | `configured` (API key present), `not_configured` |
| `services.anthropic` | enum | `configured`, `not_configured` |
| `services.gemini` | enum | `configured`, `not_configured` |
| `services.perplexity` | enum | `configured`, `not_configured` |

---

# PART C: DATABASE SCHEMA

For reference — this is what the Supabase tables look like and how the API maps to them.

## `conversations` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `user_id` | uuid | YES | Null until auth is added |
| `title` | text | YES | Auto-generated or user-set |
| `model_id` | text | YES | Last used model |
| `provider` | text | YES | Last used provider |
| `created_at` | timestamptz | NO | Auto-set |
| `updated_at` | timestamptz | NO | Auto-updated |
| `is_archived` | boolean | NO | Default false |

## `messages` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `conversation_id` | uuid | NO (FK) | References `conversations.id` |
| `role` | text | NO | `user` or `assistant` |
| `content` | text | NO | Message text |
| `model_id` | text | YES | Null for user messages |
| `model_name` | text | YES | Null for user messages |
| `provider` | text | YES | Null for user messages |
| `score` | numeric | YES | ADE score, null for user or manual |
| `reasoning` | text | YES | ADE reasoning summary string |
| `thinking_data` | jsonb | YES | `{ routingDuration, thinkingDuration, totalDuration }` |
| `is_manual_selection` | boolean | YES | Null for user messages |
| `alternate_models` | jsonb | YES | Array of `{ modelId, modelName, provider, score, reasoning }` |
| `tokens_input` | integer | YES | Null for user messages |
| `tokens_output` | integer | YES | Null for user messages |
| `cost` | numeric | YES | Null for user messages |
| `created_at` | timestamptz | NO | Auto-set |

## `usage_logs` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `user_id` | uuid | YES | Null until auth |
| `conversation_id` | uuid | YES | FK to conversations |
| `message_id` | uuid | YES | FK to messages |
| `provider` | text | NO | Provider name |
| `model_id` | text | NO | Model used |
| `tokens_input` | integer | YES | Input tokens |
| `tokens_output` | integer | YES | Output tokens |
| `cost` | numeric | YES | Estimated cost USD |
| `duration_ms` | integer | YES | Total request duration |
| `created_at` | timestamptz | NO | Auto-set |

## `user_preferences` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `user_id` | uuid | YES | Null until auth |
| `default_model_id` | text | YES | User's preferred model |
| `theme` | text | YES | UI theme preference |
| `extended_thinking_enabled` | boolean | YES | Default thinking toggle state |
| `deep_research_enabled` | boolean | YES | Default deep research toggle |
| `google_thinking_enabled` | boolean | YES | Default Gemini thinking toggle |
| `mode` | text | YES | Default mode (`auto`, `code`, `write`) |
| `created_at` | timestamptz | NO | Auto-set |
| `updated_at` | timestamptz | NO | Auto-updated |

## `profiles` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `user_id` | uuid | YES | |
| `display_name` | text | YES | |
| `avatar_url` | text | YES | |
| `created_at` | timestamptz | NO | Auto-set |
| `updated_at` | timestamptz | NO | Auto-updated |

## `api_keys` table

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | uuid | NO (PK) | Auto-generated |
| `user_id` | uuid | YES | |
| `provider` | text | NO | `anthropic`, `openai`, `google`, `perplexity` |
| `api_key_encrypted` | text | NO | Encrypted API key |
| `is_active` | boolean | NO | Default true |
| `created_at` | timestamptz | NO | Auto-set |
| `updated_at` | timestamptz | NO | Auto-updated |

---

# PART D: ENUM REFERENCE

All valid enum values used across ADE and the backend.

| Enum | Values |
|---|---|
| **Provider** | `anthropic`, `openai`, `google`, `perplexity` |
| **Modality** | `text`, `image`, `voice`, `text+image`, `text+voice` |
| **Intent** | `coding`, `creative`, `analysis`, `factual`, `conversation`, `task`, `brainstorm`, `translation`, `summarization`, `extraction` |
| **Domain** | `technology`, `business`, `health`, `legal`, `finance`, `education`, `science`, `creative_arts`, `lifestyle`, `general` |
| **Complexity** | `quick`, `standard`, `demanding` |
| **Tone** | `casual`, `focused`, `curious`, `frustrated`, `urgent`, `playful`, `professional` |
| **Mood** | `happy`, `neutral`, `stressed`, `frustrated`, `excited`, `tired`, `anxious`, `calm` |
| **EnergyLevel** | `low`, `moderate`, `high` |
| **Weather** | `sunny`, `cloudy`, `rainy`, `stormy`, `snowy`, `hot`, `cold` |
| **Location** | `home`, `office`, `commute`, `travel`, `other` |
| **ResponseStyle** | `concise`, `detailed`, `conversational`, `formal`, `casual` |
| **ResponseLength** | `short`, `medium`, `long` |
| **FeedbackSignal** | `positive`, `neutral`, `negative` |
| **FactorImpact** | `positive`, `neutral`, `negative` |
| **Mode** (frontend) | `auto`, `code`, `write` |
| **SSE Event Type** | `routing`, `thinking`, `delta`, `citations`, `done`, `error` |
| **Error Code** | `VALIDATION_ERROR`, `ADE_ERROR`, `PROVIDER_ERROR`, `RATE_LIMIT`, `TIMEOUT`, `INTERNAL_ERROR` |
