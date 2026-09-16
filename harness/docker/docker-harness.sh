#!/bin/bash
set -e

echo "🐳 [Docker Sandbox Verification] Starting isolated container build & test..."

if command -v docker &> /dev/null; then
  echo "📦 Building lightweight harness image..."
  docker build -f Dockerfile.harness -t app-harness-runner:latest .

  echo "🚀 Running verification harness inside isolated container..."
  docker run --rm \
    -e NODE_ENV=test \
    -v "$(pwd)/.harness:/app/.harness" \
    app-harness-runner:latest

  echo "🎉 [Docker Sandbox] All isolated verifications passed successfully!"
else
  echo "⚠️ Docker is not available in current host environment. Falling back to local harness..."
  npx tsx scripts/verify-harness.ts --full
fi
