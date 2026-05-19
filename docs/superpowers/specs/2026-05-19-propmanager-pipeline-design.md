# PropManager — Pipeline & Implementation Design

**Date:** 2026-05-19  
**Status:** Approved  
**Scope:** CI/CD pipeline setup and milestone execution strategy for converting the Lovable mock UI into a production-ready property management platform.

---

## Background

The repository (`remix-of-dream-weaver-hub-13`) is a Vite + React 18 + TypeScript SPA with shadcn/ui, TailwindCSS, React Query, and React Router. All data is currently static mock data in `src/data/mockData.ts`. The `milestones.pdf` spec defines a 6-milestone, 3-month roadmap to replace all mock data with a live Supabase backend.

This design covers how we build and validate that transition — the pipeline, testing strategy, and implementation order.

---

## Section 1: CI/CD Pipeline

### GitHub Actions

Every push to any branch triggers a single workflow (`.github/workflows/ci.yml`) with four sequential jobs:

```
typecheck → lint → test → build
```

| Job | Command | Purpose |
|-----|---------|---------|
| typecheck | `tsc --noEmit` | Catch type errors before anything else |
| lint | `eslint .` | Fast code quality gate |
| test | `vitest run --coverage` | Run all Vitest tests with coverage summary |
| build | `vite build` | Confirm production bundle compiles cleanly |

All four jobs must pass for a PR to be merge-eligible. Branch protection on `main` enforces this.

### Vercel Preview Deployments

Vercel is connected to the GitHub repo. On every branch push:
- Vercel runs `vite build` independently
- A preview URL is posted as a PR comment
- Preview deployments are the visual review checkpoint before merge

On merge to `main`, Vercel deploys to production automatically.

Vite + Vercel is zero-config — no `vercel.json` needed.

### Environment Variables

| Location | Purpose |
|----------|---------|
| GitHub Actions secrets | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for CI build/test |
| Vercel environment variables | Same keys for preview and production deployments |
| `.env.local` (gitignored) | Local development |
| `.env.local.example` (committed) | Documents required vars for new contributors |

---

## Section 2: Testing Strategy

Tests are written alongside feature code in the same PR — not after. Three layers:

### Layer 1 — Unit Tests (Vitest)

Pure functions and hooks with no DOM or network:
- Utility functions: date calculations, currency formatting, CPI index math, traffic light logic
- Custom React hooks wrapping Supabase queries (mocked Supabase client)
- Zod form validation schemas

Convention: colocated `*.test.ts` files next to the file under test.  
Speed: <1s total, run on every save via `vitest --watch` locally.

### Layer 2 — Integration Tests (Vitest + React Testing Library)

Component trees rendered against a mocked Supabase client. Covers:
- Key screens: Login, Properties list, Property detail tabs, Rent Roll grid
- User interactions: form submissions, tab switching, marking cells paid/unpaid
- Error states: failed Supabase calls, empty states, loading skeletons

Supabase mocked with `vi.mock` — no real network calls in CI.

Convention: `src/__tests__/` directory for integration tests.

### Layer 3 — Build + Type Safety

Covered by `tsc --noEmit` and `vite build` in CI. Catches:
- Broken imports
- Missing env var references
- Type mismatches between Supabase-generated types (`src/types/supabase.ts`) and consuming components

### Out of scope for V1

- E2E tests against a real Supabase test project
- Visual regression snapshots
- Accessibility audits

---

## Section 3: Implementation Order

### M0 — Pipeline Setup (before any feature code)

Goal: every subsequent line of milestone code has CI running against it from the start.

Deliverables:
- `.github/workflows/ci.yml` — full CI workflow
- Vitest config with coverage enabled
- Vercel project connected to repo (dashboard action, 2 clicks)
- Supabase project created, full schema migrated (all tables from milestones.pdf spec)
- RLS policies applied (all tables filtered by `company_id`)
- Supabase-generated TypeScript types committed to `src/types/supabase.ts`
- `.env.local.example` documenting required env vars
- Existing mock-data Vitest scaffold confirmed passing in CI

### M1–M6 — Feature Milestones

Follow exactly as specced in `milestones.pdf`. Each milestone:
- Feature branch → PR → CI green → Vercel preview review → merge to `main`
- Tests written alongside feature code in the same PR
- Visual review checkpoint: preview URL confirmed before milestone marked complete

| Milestone | Scope | Weeks |
|-----------|-------|-------|
| M1 | Auth & Supabase setup | 1–2 |
| M2 | Properties, Landlord tab, Tenancies | 3–4 |
| M3 | Rent Roll, Dashboard KPIs, Utilities | 5–6 |
| M4 | Documents, Arrears & Contract Expiry automation | 7–8 |
| M5 | Expenses, Rent Roll proof of payment, Payouts | 9–10 |
| M6 | Vacant module, Agents directory, Pipeline tab | 11–12 |

### Supabase Schema Management

Schema SQL and migration files are version-controlled in `supabase/migrations/`. Applied to the live Supabase project via the Supabase dashboard SQL editor or CLI. Credentials stay out of the codebase.

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Pipeline-first (M0 before M1) | Every milestone lands with CI already running; prevents retrofitting tests later |
| Vitest + RTL only (no Playwright) | Covers business logic and component correctness without E2E infrastructure complexity |
| Vercel for previews | Zero-config with Vite; preview URL per branch makes visual review frictionless |
| Supabase JS client direct from browser | No backend proxy needed; RLS handles multi-tenancy at the DB layer |
| Supabase-generated types in `src/types/supabase.ts` | Single source of truth for DB types; tsc catches mismatches automatically |

---

## Open Questions

1. **Vercel project name / domain** — what URL should the production deployment use? (can be set after first deploy)
2. **RF payment reference code format** — needed before M5 (owner: Antonis, per milestones.pdf)
3. **Document storage preference** — Supabase Storage vs Google Drive API for direct upload, needed before M4 (owner: Sofia, per milestones.pdf)
