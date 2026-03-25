# ── web builder ───────────────────────────────────────────────────────────────
# Built independently so it uses apps/web/bun.lock rather than the workspace root lockfile.
FROM oven/bun:1 AS web-builder
WORKDIR /app

COPY apps/web/package.json ./
RUN bun install

COPY apps/web .
RUN bun run build


# ── server deps ───────────────────────────────────────────────────────────────
FROM oven/bun:1 AS server-deps
WORKDIR /app

COPY apps/server/package.json ./
RUN bun install --production

# ── runner ────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production

# API server
COPY --from=server-deps /app/node_modules ./apps/server/node_modules
COPY apps/server ./apps/server

# Web SSR server — TanStack Start outputs to dist/
COPY --from=web-builder /app/dist         ./apps/web/dist
COPY --from=web-builder /app/node_modules ./apps/web/node_modules
COPY apps/web/server.ts                   ./apps/web/server.ts

# Persistent data directory for SQLite — mount a volume here
RUN mkdir -p /app/data

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000 3001

VOLUME ["/app/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
