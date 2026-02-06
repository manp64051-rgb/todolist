#!/bin/bash

# Wait for postgres to be ready
echo "Waiting for postgres..."
for i in {1..30}; do
  if node -e "const net = require('net'); const socket = net.createConnection({ host: 'postgres', port: 5432 }); socket.on('error', () => process.exit(1)); socket.on('connect', () => { socket.destroy(); process.exit(0); });" 2>/dev/null; then
    echo "Postgres is up"
    break
  fi
  echo "Postgres is unavailable - sleeping ($i/30)"
  sleep 1
done

echo "Running migrations"
npx prisma db push --skip-generate

echo "Starting application"
npm start
