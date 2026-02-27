#!/bin/bash
echo "Checking backend..."
curl -f http://localhost:8000/health || echo "BACKEND DOWN"

echo "Checking frontend..."
curl -f http://localhost:3000 || echo "FRONTEND DOWN"

echo "Checking MongoDB..."
docker exec radio-platform-mongo-1 mongosh --eval "db.adminCommand('ping')" --quiet || echo "MONGO DOWN"

echo "Checking Redis..."
docker exec radio-platform-redis-1 redis-cli ping || echo "REDIS DOWN"