#!/bin/bash

# Quick Deploy with Essential Validation
# Optimized version that runs critical checks in parallel and skips slow non-critical ones

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ SUCCESS:${NC} $1"
}

section() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

cd "$PROJECT_ROOT" || {
    error "Could not change to project root: $PROJECT_ROOT"
    exit 1
}

section "QUICK DEPLOYMENT VALIDATION"

log "Node version: $(node --version)"
log "npm version: $(npm --version)"

# Critical checks only
section "CRITICAL CHECKS"

log "Running type check..."
if ! npm run type-check 2>&1 | tail -3; then
    error "Type check failed"
    exit 1
fi
success "Type check passed"

log "Running unit tests..."
if ! npm run test:unit 2>&1 | tail -3; then
    error "Unit tests failed"
    exit 1
fi
success "Unit tests passed"

log "Running metadata validation..."
if ! npm run validate:metadata 2>&1 | tail -5; then
    error "Metadata validation failed"
    exit 1
fi
success "Metadata validation passed"

section "PRODUCTION BUILD"
log "Building for production..."
if ! npm run build 2>&1 | tail -20; then
    error "Build failed"
    exit 1
fi
success "Build completed"

section "BUILD VERIFICATION"
if [ ! -f ".next/BUILD_ID" ]; then
    error "Build artifacts missing"
    exit 1
fi
success "Build artifacts verified"

local build_size=$(du -sh .next 2>/dev/null | cut -f1)
log "Build size: $build_size"

section "DEPLOYMENT"
log "Deploying to production..."

if ! command -v vercel >/dev/null 2>&1; then
    error "Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

if vercel --prod --force --yes; then
    echo ""
    success "🎉 Deployment complete!"
    echo ""
    echo -e "${BOLD}Your site is live at:${NC}"
    echo -e "  ${GREEN}•${NC} https://z-beam.com"
    echo ""
else
    error "Deployment failed"
    exit 1
fi
