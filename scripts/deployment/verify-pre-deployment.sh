#!/bin/bash

# Pre-Deployment Verification Script
# Comprehensive build verification before deployment
# Can be run standalone or integrated into deployment pipeline
# Catches build errors that exit codes alone would miss

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

section() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Track verification results
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNED=0

# Temporary files for build output
BUILD_OUTPUT_FILE=$(mktemp)
BUILD_ERROR_REPORT=$(mktemp)

# Cleanup on exit
cleanup() {
    rm -f "$BUILD_OUTPUT_FILE" "$BUILD_ERROR_REPORT"
}
trap cleanup EXIT

# Run a check step
run_check() {
    local check_name="$1"
    local command="$2"
    local is_critical="${3:-true}"
    
    local start_time=$(date +%s)
    log "🔍 Checking: $check_name"
    
    if eval "$command" >/dev/null 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        success "$check_name (${duration}s)"
        ((CHECKS_PASSED++))
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        if [ "$is_critical" = "true" ]; then
            error "$check_name FAILED (${duration}s)"
            ((CHECKS_FAILED++))
            return 1
        else
            warning "$check_name (non-critical, ${duration}s)"
            ((CHECKS_WARNED++))
            return 0
        fi
    fi
}

# Build verification with comprehensive error checking
verify_build() {
    section "BUILD VERIFICATION"
    
    cd "$PROJECT_ROOT" || {
        error "Could not change to project root: $PROJECT_ROOT"
        return 1
    }
    
    log "📦 Starting production build..."
    log "Working directory: $(pwd)"
    
    # Capture full build output
    if npm run build >"$BUILD_OUTPUT_FILE" 2>&1; then
        BUILD_EXIT_CODE=0
        log "Build command exit code: 0"
    else
        BUILD_EXIT_CODE=$?
        log "Build command exit code: $BUILD_EXIT_CODE"
    fi
    
    # Parse build output for critical errors
    log "🔎 Scanning build output for TypeScript errors..."
    
    local ts_errors=$(grep -c "error TS[0-9]" "$BUILD_OUTPUT_FILE" || true)
    local ts_error_lines=$(grep "error TS[0-9]" "$BUILD_OUTPUT_FILE" || true)
    
    # Check for JSX/component errors
    local jsx_errors=$(grep -c "error.*JSX\|Expected corresponding JSX closing tag" "$BUILD_OUTPUT_FILE" || true)
    local jsx_error_lines=$(grep "Expected corresponding JSX closing tag" "$BUILD_OUTPUT_FILE" || true)
    
    # Check for other critical errors
    local generic_errors=$(grep -c "^\s*ERROR:" "$BUILD_OUTPUT_FILE" || true)
    
    # Verify expected build artifacts
    log "🔍 Checking build artifacts..."
    
    # Check for successful page generation count
    local pages_generated=$(grep -o "Generated [0-9]* pages" "$BUILD_OUTPUT_FILE" || echo "0")
    
    # Build results summary
    {
        echo "═══════════════════════════════════════════════════════"
        echo "BUILD VERIFICATION REPORT"
        echo "═══════════════════════════════════════════════════════"
        echo ""
        echo "BUILD STATUS:"
        echo "  Exit Code: $BUILD_EXIT_CODE"
        echo "  Pages Generated: $pages_generated"
        echo ""
        echo "ERROR ANALYSIS:"
        echo "  TypeScript Errors: $ts_errors"
        echo "  JSX/Component Errors: $jsx_errors"
        echo "  Generic Errors: $generic_errors"
        echo "  Total Errors: $((ts_errors + jsx_errors + generic_errors))"
        echo ""
        
        if [ -n "$ts_error_lines" ]; then
            echo "TypeScript Error Details:"
            echo "$ts_error_lines" | sed 's/^/  /'
            echo ""
        fi
        
        if [ -n "$jsx_error_lines" ]; then
            echo "JSX/Component Error Details:"
            echo "$jsx_error_lines" | sed 's/^/  /'
            echo ""
        fi
    } > "$BUILD_ERROR_REPORT"
    
    # Check results
    local total_errors=$((ts_errors + jsx_errors + generic_errors))
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        error "Build command failed with exit code $BUILD_EXIT_CODE"
        ((CHECKS_FAILED++))
        
        log ""
        log "BUILD FAILURE DETAILS:"
        tail -50 "$BUILD_OUTPUT_FILE" | sed 's/^/  /'
        
        return 1
    fi
    
    if [ $total_errors -gt 0 ]; then
        error "Build succeeded but contains $total_errors critical error(s)"
        ((CHECKS_FAILED++))
        
        log ""
        cat "$BUILD_ERROR_REPORT" | sed 's/^/  /'
        
        return 1
    fi
    
    success "Build completed successfully with zero TypeScript errors"
    ((CHECKS_PASSED++))
    
    # Log build artifacts
    log "Build artifacts:"
    log "  $pages_generated"
    
    return 0
}

# Verify Node.js version
verify_node_version() {
    section "ENVIRONMENT VERIFICATION"
    
    local node_version=$(node --version 2>/dev/null || echo "not found")
    local npm_version=$(npm --version 2>/dev/null || echo "not found")
    
    log "Node version: $node_version"
    log "npm version: $npm_version"
    
    if [ "$node_version" = "not found" ]; then
        error "Node.js not found"
        ((CHECKS_FAILED++))
        return 1
    fi
    
    success "Environment verified"
    ((CHECKS_PASSED++))
    return 0
}

# Verify dependencies
verify_dependencies() {
    section "DEPENDENCY VERIFICATION"
    
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        warning "node_modules not found, installing dependencies..."
        
        if npm install --legacy-peer-deps >/dev/null 2>&1; then
            success "Dependencies installed"
            ((CHECKS_PASSED++))
            return 0
        else
            error "Failed to install dependencies"
            ((CHECKS_FAILED++))
            return 1
        fi
    fi
    
    success "Dependencies verified"
    ((CHECKS_PASSED++))
    return 0
}

# Verify TypeScript configuration
verify_typescript_config() {
    section "TYPESCRIPT CONFIGURATION"
    
    if [ ! -f "$PROJECT_ROOT/tsconfig.json" ]; then
        error "tsconfig.json not found"
        ((CHECKS_FAILED++))
        return 1
    fi
    
    log "tsconfig.json found"
    
    # Check for strict mode
    if grep -q '"strict":\s*true' "$PROJECT_ROOT/tsconfig.json"; then
        success "TypeScript strict mode enabled"
        ((CHECKS_PASSED++))
        return 0
    else
        warning "TypeScript strict mode not enabled"
        ((CHECKS_WARNED++))
        return 0
    fi
}

# Test TypeScript compilation
test_typescript_compilation() {
    section "TYPESCRIPT COMPILATION TEST"
    
    log "Running TypeScript type check..."
    
    if npm run type-check >/dev/null 2>&1; then
        success "TypeScript compilation successful"
        ((CHECKS_PASSED++))
        return 0
    else
        error "TypeScript compilation failed"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Show final summary
show_summary() {
    section "VERIFICATION SUMMARY"
    
    echo -e "  ${GREEN}✅ Passed:${NC}   $CHECKS_PASSED"
    echo -e "  ${RED}❌ Failed:${NC}   $CHECKS_FAILED"
    echo -e "  ${YELLOW}⚠️  Warnings:${NC}  $CHECKS_WARNED"
    echo ""
    
    local total_checks=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNED))
    echo "Total checks: $total_checks"
    echo ""
    
    if [ $CHECKS_FAILED -gt 0 ]; then
        error "Pre-deployment verification FAILED!"
        echo ""
        echo "❌ Cannot proceed with deployment"
        echo ""
        echo "Please fix the errors above before deploying:"
        echo "1. Review error messages"
        echo "2. Fix issues in source code"
        echo "3. Run this script again to verify"
        echo ""
        return 1
    else
        success "All pre-deployment checks PASSED! ✨"
        
        if [ $CHECKS_WARNED -gt 0 ]; then
            warning "Some non-critical checks had warnings"
        fi
        
        echo ""
        echo "✅ Ready for deployment!"
        echo ""
        return 0
    fi
}

# Main execution
main() {
    section "PRE-DEPLOYMENT VERIFICATION"
    
    log "Starting comprehensive pre-deployment verification..."
    log "Project root: $PROJECT_ROOT"
    log "Timestamp: $(date)"
    echo ""
    
    # Run all verifications
    verify_node_version || true
    verify_dependencies || true
    verify_typescript_config || true
    test_typescript_compilation || true
    verify_build || true
    
    echo ""
    
    # Show summary and exit with appropriate code
    show_summary
    local exit_code=$?
    
    # Provide additional guidance
    if [ $exit_code -eq 0 ]; then
        echo "📝 Next steps:"
        echo "   1. Deploy with: ./scripts/deployment/deploy-with-validation.sh"
        echo "   2. Or use: ./scripts/deployment/deploy-and-validate.sh"
        echo ""
    fi
    
    return $exit_code
}

# Show usage information
show_usage() {
    cat <<EOF
Pre-Deployment Verification Script

USAGE:
    $0 [OPTIONS]

DESCRIPTION:
    Comprehensive verification script that checks:
    - Environment (Node.js, npm)
    - Dependencies (node_modules)
    - TypeScript configuration
    - TypeScript compilation
    - Production build (with detailed error detection)

    This script can be run:
    - Standalone: ./scripts/deployment/verify-pre-deployment.sh
    - From deploy pipeline: (called by deploy-with-validation.sh)
    - As pre-commit hook: (integrated into git workflow)

OPTIONS:
    --help       Show this help message
    --verbose    Show full build output
    --report     Generate detailed report file

EXIT CODES:
    0   All verifications passed, ready to deploy
    1   Verification failed, do not deploy

EXAMPLES:
    # Run verification
    ./scripts/deployment/verify-pre-deployment.sh

    # Show help
    ./scripts/deployment/verify-pre-deployment.sh --help

INTEGRATION:
    This script is called by:
    - deploy-with-validation.sh (pre-deployment stage)
    - deploy-and-validate.sh (pre-deployment stage)

    Can be used as git pre-commit hook:
    1. Create .git/hooks/pre-commit
    2. Add: ./scripts/deployment/verify-pre-deployment.sh
    3. Make executable: chmod +x .git/hooks/pre-commit

EOF
}

# Handle arguments
case "${1:-}" in
    --help|-h)
        show_usage
        exit 0
        ;;
    *)
        main
        exit $?
        ;;
esac
