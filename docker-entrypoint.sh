#!/bin/sh
set -e

# Start the API server
bun run apps/server/src/index.ts &
API_PID=$!

# Start the web server (TanStack Start output)
bun run apps/web/dist/server/server.js &
WEB_PID=$!

# Forward signals to both children
trap "kill $API_PID $WEB_PID 2>/dev/null; exit 0" TERM INT

# Wait for either process to exit; if one dies, kill the other
wait $API_PID $WEB_PID
