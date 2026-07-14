# `src/ai` — AI Layer

Everything related to talking to an LLM provider lives here, and only
here. No other part of the codebase imports an AI SDK
(`openai`, `@anthropic-ai/sdk`) directly.

## Folders

- `providers/` — the `AiProvider` interface (contract) plus one adapter
  per vendor: `OpenAiProvider`, `AnthropicProvider`. Everything outside
  this folder depends on the interface, never a concrete adapter.
- `prompts/` — prompt templates, one per AI-driven capability
  (currently: `consultation-outline.prompt.ts`).
- `schemas/` — Zod schemas describing the exact structured-JSON shape
  each capability's output must match (currently:
  `consultation-outline.schema.ts`).
- `ai-client.ts` — the single entry point every feature calls:
  `getStructuredCompletion()`. It enforces the project rule "AI outputs
  structured JSON only" by:
  1. appending an explicit JSON-only instruction to the system prompt,
  2. `JSON.parse`-ing the raw response text,
  3. validating the parsed value against a caller-supplied Zod schema,
  4. retrying (with a corrective follow-up message) up to
     `appConfig.ai.maxRetries` times before throwing
     `AiInvalidResponseError`.

## Status

Implemented, backing the Presentation Consulting feature's outline
generation (`GenerateConsultationOutlineUseCase`). Feature code never
calls a provider directly and never trusts raw AI output without schema
validation — both are enforced by `ai-client.ts`.

## Adding a new AI capability

1. Define its output shape as a Zod schema in `schemas/`.
2. Write its prompt template in `prompts/`.
3. Call `getStructuredCompletion({ system, messages, schema })` from the
   use-case that needs it — do not add a new client or provider call
   site.
