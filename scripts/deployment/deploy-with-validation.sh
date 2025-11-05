#!/bin/bash

# Deploy with Pre-Deployment Validation
# Runs all validation checks before deploying to production

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

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  WARNING:${NC} $1"
}

info() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] ℹ️  INFO:${NC} $1"
}

section() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Track validation results
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0
VALIDATIONS_WARNED=0

# Run a validation step with timing
run_validation() {
    local step_name="$1"
    local command="$2"
    local is_critical="${3:-true}"  # Default to critical
    
    local start_time=$(date +%s)
    log "🔍 Running: $step_name"
    
    if eval "$command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        success "$step_name (${duration}s)"
        ((VALIDATIONS_PASSED++))
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        if [ "$is_critical" = "true" ]; then
            error "$step_name FAILED (${duration}s)"
            ((VALIDATIONS_FAILED++))
            return 1
        else
            warning "$step_name failed (non-critical, ${duration}s)"
            ((VALIDATIONS_WARNED++))
            return 0
        fi
    fi
}

# Show validation summary
show_summary() {
    section "VALIDATION SUMMARY"
    echo -e "  ${GREEN}✅ Passed:${NC}  $VALIDATIONS_PASSED"
    echo -e "  ${RED}❌ Failed:${NC}  $VALIDATIONS_FAILED"
    echo -e "  ${YELLOW}⚠️  Warnings:${NC} $VALIDATIONS_WARNED"
    echo ""
    
    if [ $VALIDATIONS_FAILED -gt 0 ]; then
        error "Pre-deployment validation FAILED!"
        echo ""
        echo "Please fix the errors above before deploying."
        return 1
    else
        success "All pre-deployment validations PASSED!"
        if [ $VALIDATIONS_WARNED -gt 0 ]; then
            warning "Some non-critical checks had warnings"
        fi
        return 0
    fi
}

# Main validation pipeline
run_pre_deployment_validations() {
    section "PRE-DEPLOYMENT VALIDATION PIPELINE"
    
    cd "$PROJECT_ROOT" || {
        error "Could not change to project root: $PROJECT_ROOT"
        return 1
    }
    
    info "Working directory: $(pwd)"
    info "Node version: $(node --version 2>/dev/null || echo 'not found')"
    info "npm version: $(npm --version 2>/dev/null || echo 'not found')"
    
    # 1. Git Status Check
    section "1. GIT STATUS"
    run_validation "Check git status" "git status --porcelain | head -10" false
    
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    info "Current branch: $current_branch"
    
    if [ "$current_branch" != "main" ]; then
        warning "Not on main branch"
    fi
    
    local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local commit_msg=$(git log -1 --pretty=%B 2>/dev/null | head -1 || echo "unknown")
    info "Current commit: $commit"
    info "Commit message: $commit_msg"
    
    # 2. File Naming Validation
    section "2. FILE NAMING CONVENTIONS"
    run_validation "Naming conventions" "npm run validate:naming" true
    
    # 3. Metadata Validation
    section "3. METADATA VALIDATION"
    run_validation "Metadata sync" "npm run validate:metadata" true
    
    # 4. TypeScript Type Checking
    section "4. TYPESCRIPT TYPE CHECKING"
    run_validation "Type check" "npm run type-check" true
    
    # 5. Linting
    section "5. CODE QUALITY (LINTING)"
    run_validation "ESLint" "npm run lint" false
    
    # 6. Sitemap Verification
    section "6. SITEMAP VERIFICATION"
    run_validation "Sitemap structure" "bash scripts/sitemap/verify-sitemap.sh" true
    
    # 7. Content Validation
    section "7. CONTENT VALIDATION"
    run_validation "Content integrity" "npm run validate:content" false
    run_validation "Startup validation" "npm run validate:startup" false
    
    # 8. JSON-LD Schema Validation
    section "8. JSON-LD SCHEMA VALIDATION"
    run_validation "JSON-LD architecture" "npm run validate:jsonld" true
    run_validation "JSON-LD rendering" "node scripts/validate-jsonld-rendering.js" true
    run_validation "JSON-LD syntax" "node scripts/validate-jsonld-syntax.js" true
    run_validation "JSON-LD URLs" "node scripts/validate-jsonld-urls.js" false
    
    # 9. Component Architecture
    section "9. COMPONENT ARCHITECTURE"
    run_validation "Component audit" "npm run audit:components" false
    run_validation "Grok validation" "npm run validate:grok" false
    
    # 10. Redirects Validation
    section "10. REDIRECTS & ROUTING"
    run_validation "Redirects validation" "npm run validate:redirects" false
    
    # 11. Unit Tests
    section "11. UNIT TESTS"
    run_validation "Unit tests" "npm run test:unit" true
    
    # 12. Integration Tests
    section "12. INTEGRATION TESTS"
    run_validation "Integration tests" "npm run test:integration" false
    
    # 13. Component Tests
    section "13. COMPONENT TESTS"
    run_validation "Component tests" "npm run test:components" false
    
    # 14. Sitemap Tests
    section "14. SITEMAP TESTS"
    run_validation "Sitemap tests" "npm run test:sitemap" true
    
    # 15. Deployment Tests
    section "15. DEPLOYMENT TESTS"
    run_validation "Deployment tests" "npm run test:deployment" true
    
    # 16. Production Build
    section "16. PRODUCTION BUILD"
    log "Building production bundle (this may take a few minutes)..."
    run_validation "Production build" "npm run build:fast" true
    
    # 17. Build Artifact Checks
    section "17. BUILD ARTIFACTS"
    if [ -d ".next" ]; then
        local build_size=$(du -sh .next 2>/dev/null | cut -f1)
        info "Build size: $build_size"
        
        # Check for critical files
        local critical_files=("BUILD_ID" "server" "static")
        local missing_files=()
        
        for file in "${critical_files[@]}"; do
            if [ ! -e ".next/$file" ] && [ ! -d ".next/$file" ]; then
                missing_files+=("$file")
            fi
        done
        
        if [ ${#missing_files[@]} -eq 0 ]; then
            success "Build artifacts complete"
            ((VALIDATIONS_PASSED++))
        else
            error "Missing build artifacts: ${missing_files[*]}"
            ((VALIDATIONS_FAILED++))
        fi
    else
        error "Build artifacts not found"
        ((VALIDATIONS_FAILED++))
    fi
    
    # 18. Post-Build URL Validation
    section "18. POST-BUILD VALIDATION"
    log "Running post-build URL validation..."
    run_validation "URL validation" "npm run validate:urls" true
    
    # 19. Dataset Generation Check
    section "19. DATASET GENERATION"
    if [ -d "public/datasets" ]; then
        local dataset_count=$(find public/datasets -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        info "Generated datasets: $dataset_count"
        success "Datasets generated"
        ((VALIDATIONS_PASSED++))
    else
        warning "Dataset directory not found (may be expected)"
        ((VALIDATIONS_WARNED++))
    fi
    
    # 20. Show final summary
    show_summary
    return $?
}

# Deploy to production
deploy_production() {
    section "PRODUCTION DEPLOYMENT"
    
    log "🚀 Starting production deployment..."
    
    # Check if vercel CLI is available
    if ! command -v vercel >/dev/null 2>&1; then
        error "Vercel CLI not found. Please install it:"
        echo "  npm i -g vercel"
        return 1
    fi
    
    info "Vercel CLI: $(vercel --version)"
    
    # Get current commit info
    local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local commit_msg=$(git log -1 --pretty=%B 2>/dev/null | head -1 || echo "unknown")
    
    info "Deploying commit: $commit"
    info "Commit message: $commit_msg"
    
    # Deploy with force flag
    log "⚡ Running: vercel --prod --force --yes"
    echo ""
    
    if vercel --prod --force --yes; then
        echo ""
        success "🎉 Production deployment complete!"
        echo ""
        echo -e "${BOLD}Your site is live at:${NC}"
        echo -e "  ${GREEN}•${NC} https://z-beam.com"
        echo -e "  ${GREEN}•${NC} https://z-beam-air2airs-projects.vercel.app"
        echo ""
        
        # Show recent deployments
        info "Recent deployments:"
        vercel ls 2>/dev/null | head -5
        
        return 0
    else
        error "Production deployment failed!"
        return 1
    fi
}

# Deploy with monitoring
deploy_with_monitoring() {
    if deploy_production; then
        echo ""
        log "🔍 Starting deployment monitoring..."
        "$SCRIPT_DIR/smart-deploy.sh" monitor
    fi
}

# Main execution
main() {
    local skip_validation=false
    local with_monitoring=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-validation)
                skip_validation=true
                shift
                ;;
            --monitor)
                with_monitoring=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║                                                       ║${NC}"
    echo -e "${BOLD}${CYAN}║          Z-BEAM DEPLOYMENT WITH VALIDATION            ║${NC}"
    echo -e "${BOLD}${CYAN}║                                                       ║${NC}"
    echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Run validations unless skipped
    if [ "$skip_validation" = false ]; then
        if ! run_pre_deployment_validations; then
            error "Validation failed. Deployment aborted."
            echo ""
            info "To skip validation and deploy anyway, use:"
            echo "  $0 --skip-validation"
            exit 1
        fi
    else
        warning "Skipping pre-deployment validations"
    fi
    
    # Ask for confirmation before deploying
    echo ""
    section "DEPLOYMENT CONFIRMATION"
    echo -e "${YELLOW}You are about to deploy to PRODUCTION.${NC}"
    echo ""
    read -p "Do you want to proceed? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        warning "Deployment cancelled by user"
        exit 0
    fi
    
    # Deploy
    if [ "$with_monitoring" = true ]; then
        deploy_with_monitoring
    else
        deploy_production
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        section "DEPLOYMENT COMPLETE"
        echo -e "${GREEN}${BOLD}All systems go! 🚀${NC}"
        echo ""
    else
        echo ""
        section "DEPLOYMENT FAILED"
        echo -e "${RED}${BOLD}Something went wrong. Check the errors above.${NC}"
        echo ""
    fi
    
    exit $exit_code
}

# Show help
show_help() {
    echo "Deploy with Pre-Deployment Validation"
    echo "======================================"
    echo ""
    echo "Runs comprehensive validation checks before deploying to production."
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-validation    Skip all pre-deployment validations (not recommended)"
    echo "  --monitor           Start monitoring after deployment"
    echo "  --help, -h          Show this help message"
    echo ""
    echo "Comprehensive Validation Pipeline (20 Steps):"
    echo ""
    echo "  FOUNDATION CHECKS:"
    echo "    1.  Git status & commit info"
    echo "    2.  File naming conventions"
    echo "    3.  Metadata synchronization"
    echo "    4.  TypeScript type checking"
    echo "    5.  Code quality (ESLint)"
    echo ""
    echo "  CONTENT & STRUCTURE:"
    echo "    6.  Sitemap verification"
    echo "    7.  Content validation"
    echo "    8.  JSON-LD schema validation (architecture)"
    echo "    9.  JSON-LD rendering validation"
    echo "    10. JSON-LD syntax validation"
    echo "    11. JSON-LD URL validation"
    echo ""
    echo "  ARCHITECTURE & ROUTING:"
    echo "    12. Component architecture audit"
    echo "    13. Grok validation"
    echo "    14. Redirects & routing validation"
    echo ""
    echo "  TEST SUITES:"
    echo "    15. Unit tests"
    echo "    16. Integration tests"
    echo "    17. Component tests"
    echo "    18. Sitemap tests"
    echo "    19. Deployment tests"
    echo ""
    echo "  BUILD & ARTIFACTS:"
    echo "    20. Production build"
    echo "    21. Build artifact verification"
    echo "    22. Post-build URL validation"
    echo "    23. Dataset generation check"
    echo ""
    echo "Critical Checks (abort on failure):"
    echo "  • Naming conventions, Metadata, Type checking"
    echo "  • Sitemap, JSON-LD (architecture, rendering, syntax)"
    echo "  • Unit tests, Sitemap tests, Deployment tests"
    echo "  • Production build, URL validation"
    echo ""
    echo "Non-Critical Checks (warnings only):"
    echo "  • Linting, Content validation, Component audit"
    echo "  • Integration tests, Component tests, Redirects"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run full validation and deploy"
    echo "  $0 --monitor            # Deploy with monitoring"
    echo "  $0 --skip-validation    # Deploy without validation (emergency only)"
    echo ""
    echo "Estimated time: 3-7 minutes for full validation"
    echo ""
}

# Run main function
main "$@"
