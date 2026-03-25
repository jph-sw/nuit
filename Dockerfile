# ── deps ──────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json     ./apps/web/
RUN bun install --frozen-lockfile

# ── web builder ───────────────────────────────────────────────────────────────
FROM deps AS web-builder
COPY apps/web ./apps/web
RUN bun run --filter @nuit/web build

# ── runner ────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Shared node_modules (workspace root)
COPY --from=deps /app/node_modules ./node_modules

# Server
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY apps/server ./apps/server

# Web (built output only — no src or dev deps needed)
COPY --from=web-builder /app/apps/web/.output ./apps/web/.output

# Persistent data directory (mount a volume here for SQLite)
RUN mkdir -p /app/data

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000 3001

VOLUME ["/app/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
