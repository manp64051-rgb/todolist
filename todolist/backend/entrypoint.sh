#!/bin/bash
set -e

# Wait for postgres to be ready
echo "Waiting for postgres..."
for i in {1..30}; do
  if node -e "const net = require('net'); const socket = net.createConnection({ host: 'postgres', port: 5432 }); socket.on('error', () => process.exit(1)); socket.on('connect', () => { socket.destroy(); process.exit(0); });" 2>/dev/null; then
    echo "✓ Postgres is ready"
    break
  fi
  echo "Postgres unavailable - retrying ($i/30)"
  sleep 1
done

# Run Prisma migrations with data loss if needed
echo "Running Prisma migrations..."
npx prisma db push --skip-generate --accept-data-loss || echo "Migration failed, continuing..."

# Start  the application
echo "Starting backend..."
npm start
