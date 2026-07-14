# Architecture

## Clean Architecture, applied literally

Every feature (once built) will be organized as:

```
src/features/<feature-name>/
  domain/           entities, repository INTERFACES, use-cases
  application/       DTOs + services orchestrating use-cases
  infrastructure/     concrete repository implementations, mappers
  presentation/        server actions, hooks, components
```

The Dependency Rule is enforced by **what each layer is allowed to
import**, not just by convention:

- `domain/` never imports `@prisma/client`, `next`, `@clerk/nextjs`, or
  any SDK. It only knows its own entities and the repository
  **interfaces** it depends on — never a concrete implementation.
- `infrastructure/` is the only place allowed to import `@prisma/client`
  for that feature. If the ORM or schema changes, domain code is
  untouched.
- `presentation/` is the only place allowed to import React/Next.js
  primitives for that feature.

This is why a use-case will be unit-testable with an in-memory fake
repository and a mocked AI client — it has no idea a database or an
HTTP framework exists.

## Feature-based folders, not layer-based folders, at the top level

Everything for one feature lives under one folder, with Clean
Architecture layers *inside* it — rather than one global `controllers/`,
`services/`, `models/` split across the whole app. See
`src/features/README.md`.

## Why `ai/`, `presentation-engine/`, and `renderer/` are three separate top-level folders

This split is the direct architectural expression of the product
principle "the presentation is the output, the intelligence is the
product":

| Folder | Responsibility | Depends on |
|---|---|---|
| `src/ai` | Talk to LLM providers, enforce structured JSON, own prompts/schemas | Nothing product-specific |
| `src/presentation-engine` | Turn a strategic outline into a concrete, ordered slide plan | `ai`'s output types only |
| `src/renderer` | Turn a slide plan into actual bytes (`.pptx` today) | `presentation-engine`'s output types only |

A feature's use-case will only ever talk to `ai/`. A separate route will
sequence `presentation-engine/` → `renderer/` → storage. Neither layer
knows the others exist beyond the plain data type passed between them.
This means: adding a PDF or Google Slides output later is a new file in
`renderer/` implementing `DeckRenderer` — nothing else changes. See
`/docs/ai/README.md` and `/docs/presentation-engine/README.md` for each
layer's current (Sprint 0) status.

## Errors

`shared/errors/app-error.ts` defines one base class (`AppError`) and a
closed set of subclasses (`ValidationError`, `NotFoundError`,
`AiProviderError`, etc.), each with a fixed HTTP status and a machine
`code`. Every layer throws one of these instead of a raw `Error` or a
library-specific exception — infrastructure adapters catch the
low-level error and re-throw the typed one. `shared/api/response.ts`'s
`apiError` is the single funnel every Route Handler uses to turn any
thrown error into a consistent JSON response.

## Configuration

Two files, two jobs, so "no hardcoded values" doesn't conflate *inputs*
with *decisions*:

- `config/env.ts` — a single Zod schema validates `process.env` once, at
  import time, and throws immediately if anything required is missing.
  Nowhere else in the codebase reads `process.env` directly.
- `config/app-config.ts` — named, documented constants derived from
  `env` (timeouts, retry counts, pagination sizes). Anything that looks
  like a magic number in feature code should be a named entry here
  instead.

## Composition root

`src/di/container.ts` constructs every concrete infrastructure class
(currently: `PrismaConsultationRepository`) and injects it into
application services (`ConsultationService`) through their
constructors. Route handlers and server actions call
`getContainer().consultationService`, never
`new PrismaConsultationRepository(...)` directly.

## Strict TypeScript, no `any`

`tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, and
`noImplicitOverride`. `.eslintrc.json` turns
`@typescript-eslint/no-explicit-any` into a hard error and additionally
bans the `any` keyword at the syntax level, so it fails lint even in
positions the plugin rule might not catch. Where a type is genuinely
unknown (e.g. a raw AI response before validation, in a later sprint),
code uses `unknown` and narrows it with a Zod schema — never `any`.
