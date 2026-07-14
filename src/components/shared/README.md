# `src/components/shared` — Reusable Application Components

Empty in Sprint 0. Reserved for components reused across multiple
features (e.g. a page header, an empty-state, a confirmation dialog) —
as opposed to `src/components/ui`, which holds only shadcn/ui primitives
added via the shadcn CLI, and a feature's own
`features/<feature>/presentation/components/`, which holds components
specific to that one feature.

Rule of thumb: if a component is used by two or more features, it
belongs here. If it's used by one feature, it belongs in that feature's
own `presentation/components/` folder. If it's an unmodified shadcn/ui
primitive, it belongs in `src/components/ui`.
