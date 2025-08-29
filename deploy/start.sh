#!/bin/sh
set -e

echo "🔄 Running database migrations..."
bun run db:migrate
bun ./scripts/seed-airports.ts

echo "🚀 Starting web application"
echo "Version $(bun -p "require('./package.json').version")"

bun --bun --smol node_modules/.bin/next start