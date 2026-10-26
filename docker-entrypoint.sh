#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to accept connections..."
until node -e "
const net = require('net');
const url = new URL(process.env.DATABASE_URL);
const socket = net.createConnection({ host: url.hostname, port: url.port || 5432 }, () => {
  socket.end();
  process.exit(0);
});
socket.on('error', () => process.exit(1));
setTimeout(() => { socket.destroy(); process.exit(1); }, 2000);
" 2>/dev/null; do
  echo "PostgreSQL is not ready yet - sleeping 2s..."
  sleep 2
done

echo "✅ PostgreSQL is accepting connections!"

# Run Prisma schema push if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🔄 Synchronizing database schema with Prisma..."
  pnpm prisma db push

  echo "🌱 Running database seeds..."
  pnpm db:seed
fi

echo "🚀 Executing command: $@"
exec "$@"
