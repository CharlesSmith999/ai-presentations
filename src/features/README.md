# `src/features` — Feature Modules

One subfolder per business feature. Currently: `presentation-consulting`
— the first real feature, implemented end-to-end as the reference
example every future feature should follow.

## The pattern (see `presentation-consulting/` for a working example)

Each feature applies Clean Architecture *inside* itself:

```
features/<feature-name>/
  domain/           entities, repository INTERFACES, use-cases.
                    Zero framework imports (no Prisma, no Next.js, no SDKs).
  application/       DTOs + services that orchestrate use-cases for
                    the outside world (validates input shape, maps to
                    response DTOs).
  infrastructure/     concrete repository implementations (Prisma-backed),
                    and mappers between persistence records and domain
                    entities. The only layer allowed to import @prisma/client.
  presentation/        server actions, hooks, components — the only layer
                    allowed to import React/Next.js primitives.
```

The dependency rule: `domain` never imports from `infrastructure` or
`presentation`; `infrastructure` and `presentation` both depend on
`domain`'s interfaces, never the other way around. See
`/docs/architecture/README.md` for the full rationale.

## `presentation-consulting` at a glance

| Layer | File | Responsibility |
|---|---|---|
| domain | `entities/consultation.entity.ts` | The `Consultation` entity and its status transitions |
| domain | `repositories/consultation.repository.ts` | `ConsultationRepository` port |
| domain | `use-cases/create-consultation.use-case.ts` | Business-rule validation + creation |
| domain | `use-cases/generate-consultation-outline.use-case.ts` | Orchestrates the AI layer to produce a strategic outline |
| application | `dto/consultation.dto.ts` | Input/output DTOs, wire-shape validation |
| application | `services/consultation.service.ts` | Composes use-cases for routes/actions |
| infrastructure | `repositories/prisma-consultation.repository.ts` | Prisma-backed `ConsultationRepository` |
| infrastructure | `mappers/consultation.mapper.ts` | Prisma record ↔ domain entity |
| presentation | `actions/*.ts` | Server Actions backing the portal UI |
| presentation | `components/*.tsx` | The portal's consultation form, list, outline view, workflow panel |
| presentation | `hooks/use-generate-outline.ts` | Client-side loading/error state for outline generation |

Wired together via `src/di/container.ts` and exposed both as a portal UI
(`/dashboard/consultations`) and a versioned API (`/api/v1/consultations`,
`/api/v1/presentations`).
