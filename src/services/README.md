# `src/services` — Cross-Feature Application Services

Empty in Sprint 0. This folder is reserved for application services
that are genuinely cross-cutting — used by more than one feature — as
opposed to a single feature's own orchestration logic.

## Distinction from feature-scoped services

Most application services belong *inside* a feature, at
`features/<feature-name>/application/services/`, because they only
orchestrate that feature's own use-cases (see `/docs/architecture`).

A service only belongs in this top-level folder if it has no natural
single feature owner — for example, a future `notification.service.ts`
that multiple unrelated features need to call. Until such a need
exists, this folder stays empty rather than becoming a dumping ground.

`src/lib/db/database.service.ts` is a related but distinct concept: it
is infrastructure (a thin wrapper establishing the DB error-handling
pattern), not an application service, which is why it lives under
`src/lib` rather than here.
