# Deployment Guide

This app has no live deployment yet — publishing it requires your own
accounts (hosting, database, auth, storage, AI providers). This document
is the exact sequence to go from this repo to a live URL.

## 1. Accounts you'll need

| Service | Used for | Free tier available |
|---|---|---|
| [Vercel](https://vercel.com) | Hosting the Next.js app | Yes |
| [Neon](https://neon.tech) or [Supabase](https://supabase.com) | PostgreSQL | Yes |
| [Supabase](https://supabase.com) | File storage (the generated `.pptx` files) | Yes |
| [Clerk](https://clerk.com) | Authentication | Yes |
| [Anthropic](https://console.anthropic.com) and/or [OpenAI](https://platform.openai.com) | The AI layer | Pay-as-you-go |

(If you use Supabase for both database and storage, that's one account
covering two rows above.)

## 2. Provision each service

**Database (Neon or Supabase):** create a Postgres project, copy the
connection string(s) into `DATABASE_URL` (pooled) and `DIRECT_URL`
(direct/unpooled — Prisma needs this for migrations).

**Storage (Supabase):** create a project, create a **private** bucket
named `presentations` (or change `SUPABASE_STORAGE_BUCKET`), copy the
project URL into `SUPABASE_URL` and the **service role** key (Settings →
API) into `SUPABASE_SERVICE_ROLE_KEY`. The service role key is
server-only — it must never reach the client bundle.

**Auth (Clerk):** create an application, copy the publishable key into
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and the secret key into
`CLERK_SECRET_KEY`. Under Webhooks, add an endpoint pointing at
`https://<your-domain>/api/webhooks/clerk` subscribed to `user.*` and
`session.created`, then copy its signing secret into
`CLERK_WEBHOOK_SECRET`.

**AI providers:** create API keys for whichever provider(s)
`AI_DEFAULT_PROVIDER` will use; both keys are required by `env.ts`
regardless (see `src/config/env.ts`) even if only one is the default.

## 3. Push the code to GitHub

```bash
git init
git add .
git commit -m "AI Presentation Consultant"
git remote add origin <your-repo-url>
git push -u origin main
```

`.github/workflows/ci.yml` will run lint + typecheck on every push —
confirm it's green before deploying.

## 4. Run the database migration once, from your machine

```bash
cp .env.example .env.local   # fill in the real values from step 2
npm install
npm run db:push              # or `npm run db:migrate` for a tracked migration history
```

## 5. Deploy to Vercel

1. [Import the GitHub repo](https://vercel.com/new) into Vercel.
2. Framework preset: Next.js (auto-detected).
3. Add every variable from `.env.example` under Project Settings →
   Environment Variables, with the real values from step 2.
4. Deploy.

Vercel builds and runs the app directly — you do not need the
`Dockerfile` for a Vercel deployment; it's provided for deploying to
any other container host (Fly.io, Render, Railway, AWS ECS, etc.)
instead. If you use it, the same environment variables from step 2
must be supplied to the container at runtime.

## 6. Point Clerk at the real domain

Back in the Clerk dashboard, update the webhook endpoint URL (step 2)
to your actual Vercel domain if you used a placeholder, and add the
domain under Clerk's allowed origins/redirect URLs.

## 7. Verify

- `https://<your-domain>/api/health` → `{ "data": { "status": "ok", ... } }`
- `https://<your-domain>/sign-in` → Clerk sign-in renders
- Sign in → `/dashboard/consultations` → create one → generate outline
  → generate presentation → download link works

If `/api/health` reports `database.ok: false`, re-check `DATABASE_URL`
first — `checkDatabaseConnection()` (`src/lib/db/database.service.ts`)
is exactly what that field reflects.

## Container deployment (alternative to Vercel)

```bash
docker build -t ai-presentation-consultant .
docker run -p 3000:3000 --env-file .env.local ai-presentation-consultant
```

The Dockerfile uses Next.js's `output: "standalone"` mode
(`next.config.ts`), so the runtime image contains only the compiled
server and its production dependencies — no source, no devDependencies,
no build cache.
