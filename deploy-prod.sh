#!/bin/bash

# Simple production deployment script
# This script commits changes, pushes to git, and deploys to production

set -e

echo "🚀 Starting production deployment..."

# Check if there are any uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Production deployment $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push to main branch
echo "⬆️  Pushing to main branch..."
git push origin main

# Deploy to production
echo "🏭 Deploying to production..."
bash scripts/deployment/prod-deploy.sh

echo "✅ Production deployment completed!"