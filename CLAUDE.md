# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuit is a file manager — upload, organize, and download files in a folder hierarchy. Full-stack monorepo with a Bun native server and a TanStack Start (SSR React) frontend.

## Commands

### Root
```bash
bun install          # Install all workspace dependencies
bun run dev          # Run all apps in parallel
```

### Server (apps/server/)
```bash
bun --hot src/index.ts     # Dev with hot reload
bun test                   # Run tests
```

### Web (apps/web/)
```bash
bun run dev          # TanStack Start dev server (port 3000)
bun run build        # Production build
bun run test         # Vitest
bun run check        # Biome format + lint
```

## Architecture

```
nuit/
├── apps/
│   ├── server/     # Bun native server (port 3001)
│   └── web/        # TanStack Start SSR frontend (port 3000)
└── packages/
    └── types/      # Shared types (File, Folder) defined with arktype
```

### Backend (apps/server/)

- **Framework:** `Bun.serve()` with native route objects — no Express, no Elysia
- **Entry:** `src/index.ts` — registers all routes, runs migrations on startup
- **Database:** `bun:sqlite` (not `better-sqlite3`). DB file at `data/database.sqlite` (relative to repo root)
- **Migrations:** `src/db/migrations.ts` — append-only array of SQL strings; the `migrate()` function applies only unapplied ones at startup via a `_migrations` table
- **Auth:** Custom token-based sessions. Token format: `{sessionId}.{secret}`. Session validated in `src/utils/auth.ts` via constant-time compare of SHA-256 hashed secret. Sessions expire after 24h.
- **Auth guard:** Every protected route calls `authenticate(req)` from `src/utils/request.ts` and returns 401 if it returns null
- **Route structure:** Each resource has separate files per operation under `src/routes/` (e.g., `file/upload.ts`, `file/rename.ts`)
- **Validation:** ArkType schemas in `packages/types` for shared types; routes validate inline

### Frontend (apps/web/)

- **Framework:** TanStack Start (SSR, not plain Vite SPA)
- **Routing:** TanStack Router file-based. Auto-generates `src/routeTree.gen.ts` — **do not edit**
- **Route layout:** `_authed.tsx` wraps all protected routes; redirects to `/login` if no user in context
- **Auth flow:** `src/lib/auth.ts` — `createServerFn` wrappers for sign-in/sign-up/sign-out/fetchUser. Session stored server-side via `@tanstack/react-start/server` `getSession`/`updateSession`; token forwarded to backend as `Authorization: Bearer`
- **API client:** `src/lib/api.ts` — `api()` and `apiBlob()` fetch wrappers that read the server-side session and inject the Bearer token. Run inside `createServerFn` handlers only (they use `getSession` which is server-only)
- **Data fetching:** Server functions in `src/data/files-actions.ts`, query options in `src/data/files-query-options.ts`. Pattern: `createServerFn` → `api()` call → `queryOptions` wrapping the server fn
- **Styling:** Tailwind CSS v4, `src/styles.css` is auto-generated — **do not edit**
- **UI:** Base UI (`@base-ui/react`) + HugeIcons. Path alias `#/*` → `./src/*`

## Environment

Required env vars (set in `.env` at repo root — Bun loads automatically):
- `API_URL` — URL of the backend, defaults to `http://localhost:3001`
- `SESSION_SECRET` — min 32 chars, used to encrypt TanStack Start sessions

## Code Style

- **Formatter/Linter:** Biome 2.x — tabs, double quotes
- **Runtime:** Use Bun APIs over Node.js equivalents (`bun:sqlite`, `Bun.file`, `Bun.$`)
