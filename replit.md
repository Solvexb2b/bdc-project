# SolveX Platform

A comprehensive B2B enterprise software marketplace and problem-solving platform for Tier-1 financial institutions. Merges four projects: solvex-platform, solvex-marketplace, solvex-enterprise, solvex-paradox-box.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite

## Where things live

- `artifacts/api-server/src/` — Express API server
  - `routes/` — all route handlers (auth, products, orders, vault, library, problems, solutions, escrow, crawler, notifications, earnings, offers, owner)
  - `seed.ts` — all 29 exact products from InitialCatalog.kt
  - `app.ts` — Express app with session middleware
- `artifacts/solvex/src/` — React frontend
  - `pages/` — all pages (Marketplace, Product, Problems, Solver, Portal, Owner, Analytics, Library, Login)
  - `components/` — DashboardLayout, shared UI components
- `lib/db/src/schema/` — Drizzle ORM schemas
  - users, products, orders, vault, purchases, problems, solutions, escrow, crawler, social (notifications, earnings, offers)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- **29 exact products** from enterprise `InitialCatalog.kt`: 6 ZK-Privacy + 6 HFT + 6 Security + 5 IAM + 5 AI Governance + 1 Master Apex Bundle. These IDs are canonical (SOLVEX-ZK-01 through SOLVEX-MASTER-29).
- **Vault hold model**: all orders go through 72-hour hold period before funds become available; `/api/vault/process` releases expired holds.
- **Session auth**: express-session with SESSION_SECRET env var; routes use `(req.session as any)?.userId` with fallback to userId=1 for unauthenticated requests.
- **Single-tier seeding**: products seeded once via `POST /api/owner/seed-products`; idempotent (no-ops if already seeded).
- **Problem marketplace**: three-sided (clients post problems, solvers submit solutions, AI verifies and releases escrow).

## Product

- **Paradox Vault**: 29 Tier-1 enterprise cryptographic/financial/compliance solutions purchasable via ETH, USDC, or BTC
- **Problem Bounties**: crawler discovers unsolved problems from Reddit/StackOverflow/etc.; clients post with payment escrow; solvers earn by solving
- **Owner Dashboard**: full vault management, withdrawal, system stats, audit log
- **Library**: purchased solutions unlocked and accessible after delivery

## User preferences

_None recorded yet._

## Gotchas

- Never use `console.log` in server code — use `req.log` in route handlers, `logger` singleton elsewhere
- `pnpm --filter @workspace/db run push` must be run before the API server starts on a fresh DB
- `nanoid` and `express-session` must be in `api-server`'s `dependencies` (not root)
- Do NOT run `pnpm dev` at workspace root — each artifact runs via its own workflow

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
