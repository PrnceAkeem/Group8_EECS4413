#!/bin/bash
cd "$(dirname "$0")"
docker compose down --remove-orphans 2>/dev/null
docker compose up --build -d
echo "Waiting for server..."
until curl -s http://localhost:5050/health | grep -q "ok"; do sleep 1; done
open http://localhost:5050
