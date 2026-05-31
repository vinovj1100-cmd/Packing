#!/bin/bash
set -e

echo "📦 Building Posting Timestamp..."
npm install
npm run build

echo "🐳 Building Docker image..."
docker build -t posting-timestamp:latest .

echo "🚀 Starting container on http://localhost:8080"
docker run -d --name posting-timestamp -p 8080:80 --restart unless-stopped posting-timestamp:latest

echo "✅ Done! Open http://localhost:8080"