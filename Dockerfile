# ── web builder ───────────────────────────────────────────────────────────────
FROM oven/bun:1 AS web-builder
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/web/package.json       ./apps/web/package.json
COPY apps/server/package.json    ./apps/server/package.json
RUN bun install

COPY packages/types ./packages/types
COPY apps/web       ./apps/web
RUN bun run --filter '@nuit/web' build


# ── server deps ───────────────────────────────────────────────────────────────
FROM oven/bun:1 AS server-deps
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/web/package.json       ./apps/web/package.json
COPY apps/server/package.json    ./apps/server/package.json
RUN bun install --production --no-save


# ── runner ────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Shared packages
COPY packages/types ./packages/types

# API server
COPY --from=server-deps /app/node_modules          ./node_modules
COPY --from=server-deps /app/apps/server/node_modules ./apps/server/node_modules
COPY apps/server ./apps/server

# Web SSR server — TanStack Start outputs to dist/
COPY --from=web-builder /app/apps/web/dist         ./apps/web/dist
COPY --from=web-builder /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web/server.ts                            ./apps/web/server.ts

# Persistent data directory for SQLite — mount a volume here
RUN mkdir -p /app/data

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000 3001

VOLUME ["/app/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
