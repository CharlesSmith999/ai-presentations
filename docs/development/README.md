# Development Guide

## Setup

```bash
cp .env.example .env.local   # fill in real values — see the comments in that file
npm install
npm run db:generate          # generate the Prisma client
npm run db:push              # push the (currently model-less) schema to Postgres
npm run dev
```

Once running, `GET /api/health` should return:

```json
{ "data": { "status": "ok", "environment": "development", "database": { "ok": true }, "timestamp": "..." } }
```

If it doesn't, check `.env.local` first — `src/config/env.ts` will throw
a descriptive error at boot listing exactly which variable is missing or
malformed.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Regenerate the Prisma client after a schema change |
| `npm run db:migrate` | Create and apply a tracked migration (use in team/production workflows) |
| `npm run db:push` | Push the schema directly, no migration file (fine for early local iteration) |
| `npm run db:studio` | Open Prisma Studio |

## Adding a shadcn/ui component

```bash
npx shadcn@latest add <component-name>
```

This reads `components.json` and lands the file in `src/components/ui/`,
using the `cn()` helper already configured at `@/shared/utils/cn`.

## Conventions

- **No `any`.** Enforced by ESLint; use `unknown` + narrowing (typically
  a Zod schema) instead.
- **No direct `process.env` access** outside `src/config/env.ts`.
- **No raw `console.log`.** Import `logger` or `createLogger(moduleName)`
  from `@/shared/logging/logger`.
- **No hand-rolled API response shapes.** Use `apiSuccess` / `apiError`
  from `@/shared/api/response` in every Route Handler.
- **Route handlers stay thin.** Parse input, resolve identity, call one
  application service method, return its result through `apiSuccess`;
  catch anything thrown and pass it to `apiError`. Orchestration logic
  belongs in the application/domain layers, not the route file.
- **New feature? Start in `src/features/<name>/`,** following the
  four-layer shape documented in `src/features/README.md` and
  `/docs/architecture/README.md`. Don't add feature-specific logic to
  `src/shared`, `src/lib`, or `src/services`.

## Path aliases

Configured in `tsconfig.json`:

| Alias | Points to |
|---|---|
| `@/*` | `src/*` |
| `@/ai/*` | `src/ai/*` |
| `@/presentation-engine/*` | `src/presentation-engine/*` |
| `@/renderer/*` | `src/renderer/*` |
| `@/features/*` | `src/features/*` |
| `@/components/*` | `src/components/*` |
| `@/services/*` | `src/services/*` |
| `@/shared/*` | `src/shared/*` |
| `@/lib/*` | `src/lib/*` |
| `@/config/*` | `src/config/*` |
| `@/di/*` | `src/di/*` |
