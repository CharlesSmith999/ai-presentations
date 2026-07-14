# AI Presentation Consultant

> Not a slide generator — a strategist. The presentation file is the
> *output*. The product is the reasoning that decides what the
> presentation needs to argue, for whom, and why.

A working portal is implemented end-to-end: sign in → start a
consultation (goal, audience, context, constraints) → the AI layer
produces a structured narrative strategy → review it → generate and
download a `.pptx` built from that strategy.

## Run it

```bash
cp .env.example .env.local   # fill in real values — see comments in that file
npm install
npm run db:generate
npm run db:push
npm run dev
```

Then visit `/` → sign in → **Open the portal**, or go straight to
`/dashboard/consultations`.

`GET /api/health` still works as a plain infrastructure check
(config → database → response envelope), independent of the feature.

## The portal, end to end

| Step | UI route | Server Action / API | Layer(s) touched |
|---|---|---|---|
| Sign in | `/sign-in` | Clerk | `lib/auth`, `middleware.ts` |
| Start a consultation | `/dashboard/consultations/new` | `createConsultationAction` | `features/presentation-consulting/domain` (use-case) → `infrastructure` (Prisma) |
| Generate the strategy | `/dashboard/consultations/[id]` | `generateOutlineAction` | `ai/` (structured completion) → `domain` use-case → `infrastructure` |
| Generate the deck | same page | `generatePresentationAction` | `presentation-engine/` (slide plan) → `renderer/` (pptxgenjs) → `lib/storage` (Supabase) |

The same operations are also exposed as a versioned JSON API under
`/api/v1/consultations` and `/api/v1/presentations`, built on the exact
same application services — the portal UI and the API are two
presentation-layer clients of one set of use-cases, never two
implementations of the same logic.

## Architecture

Every structural decision — why `ai/`, `presentation-engine/`, and
`renderer/` are three separate layers; why errors are typed; why
`env.ts` and `app-config.ts` are split; why the DI container exists;
why `any` is banned — is documented in `/docs/architecture/README.md`,
written to explain itself to the next engineer, not just to describe
what the code does.

| Doc | Covers |
|---|---|
| [`docs/architecture`](./docs/architecture/README.md) | Clean Architecture rules, errors, config, DI, strict TypeScript |
| [`docs/ai`](./docs/ai/README.md) | The AI layer: providers, prompts, schemas, the structured-completion client |
| [`docs/presentation-engine`](./docs/presentation-engine/README.md) | The outline → slide-plan transformation |
| [`docs/development`](./docs/development/README.md) | Setup, scripts, conventions, path aliases |
| [`src/features/README.md`](./src/features/README.md) | The feature-folder pattern, with `presentation-consulting` as the worked example |

## What's deliberately still out of scope

- A second feature (e.g. team collaboration, brand kits) — the pattern
  is proven with one feature; replicate it per `src/features/README.md`
  when the next one is needed.
- The Clerk webhook handler body (folder exists, logic doesn't).
- Automated tests — the architecture is test-friendly by construction
  (interfaces at every boundary via the DI container), but no suite has
  been written yet.
- Rate limiting, multi-tenant/organization scoping beyond the
  `OrganizationId` branded type, and billing.
