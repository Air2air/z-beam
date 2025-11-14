#!/bin/bash

# Deploy with Full Lifecycle Validation
# Includes pre-deployment validation + deployment + post-deployment validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://www.z-beam.com}"
PROPAGATION_WAIT=30  # Seconds to wait for deployment propagation
POST_DEPLOY_RETRIES=3
POST_DEPLOY_RETRY_DELAY=10

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

# Run deployment with pre-validation
deploy_with_prevalidation() {
    section "PHASE 1: PRE-DEPLOYMENT VALIDATION & DEPLOY"
    
    log "Running deploy-with-validation.sh..."
    
    # Pass all arguments to the deployment script
    "$SCRIPT_DIR/deploy-with-validation.sh" "$@"
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        error "Deployment failed with exit code $exit_code"
        return $exit_code
    fi
    
    success "Deployment completed successfully"
    return 0
}

# Wait for deployment to propagate
wait_for_propagation() {
    section "PHASE 2: DEPLOYMENT PROPAGATION"
    
    log "Waiting ${PROPAGATION_WAIT} seconds for deployment to propagate globally..."
    log "URL: $PRODUCTION_URL"
    
    for ((i=1; i<=PROPAGATION_WAIT; i++)); do
        echo -ne "\r${BLUE}⏳ ${i}/${PROPAGATION_WAIT}s${NC}"
        sleep 1
    done
    echo ""
    
    success "Propagation wait complete"
}

# Validate production deployment
validate_production() {
    section "PHASE 3: POST-DEPLOYMENT VALIDATION"
    
    log "Running production validation against: $PRODUCTION_URL"
    
    local attempt=1
    while [ $attempt -le $POST_DEPLOY_RETRIES ]; do
        log "Validation attempt $attempt of $POST_DEPLOY_RETRIES..."
        
        # Run production validation
        cd "$PROJECT_ROOT"
        node scripts/validation/post-deployment/validate-production.js \
            --url="$PRODUCTION_URL" \
            --report=console \
            --verbose
        
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            success "Production validation PASSED"
            return 0
        fi
        
        warning "Validation attempt $attempt failed"
        
        if [ $attempt -lt $POST_DEPLOY_RETRIES ]; then
            log "Waiting ${POST_DEPLOY_RETRY_DELAY}s before retry..."
            sleep $POST_DEPLOY_RETRY_DELAY
        fi
        
        ((attempt++))
    done
    
    error "Production validation FAILED after $POST_DEPLOY_RETRIES attempts"
    return 1
}

# Generate HTML report
generate_report() {
    section "PHASE 4: VALIDATION REPORT"
    
    log "Generating HTML validation report..."
    
    cd "$PROJECT_ROOT"
    node scripts/validation/post-deployment/validate-production.js \
        --url="$PRODUCTION_URL" \
        --report=html \
        --output=production-validation-report.html
    
    if [ $? -eq 0 ]; then
        success "Report generated: production-validation-report.html"
        
        # Try to open report in browser (macOS/Linux)
        if command -v open &> /dev/null; then
            log "Opening report in browser..."
            open production-validation-report.html &> /dev/null || true
        elif command -v xdg-open &> /dev/null; then
            log "Opening report in browser..."
            xdg-open production-validation-report.html &> /dev/null || true
        fi
    else
        warning "Report generation failed"
    fi
}

# Show summary
show_summary() {
    section "DEPLOYMENT SUMMARY"
    
    echo -e "${BOLD}Timeline:${NC}"
    echo -e "  1. ✅ Pre-deployment validation"
    echo -e "  2. ✅ Deployment to production"
    echo -e "  3. ⏳ Propagation wait (${PROPAGATION_WAIT}s)"
    echo -e "  4. 🔍 Post-deployment validation"
    
    if [ "$1" = "success" ]; then
        echo ""
        echo -e "${GREEN}${BOLD}🎉 Deployment fully validated and operational!${NC}"
        echo -e "${GREEN}   Production URL: $PRODUCTION_URL${NC}"
    else
        echo ""
        echo -e "${RED}${BOLD}⚠️  Deployment completed but validation found issues${NC}"
        echo -e "${YELLOW}   Review the validation output above${NC}"
        echo -e "${YELLOW}   Check: $PRODUCTION_URL${NC}"
    fi
    
    echo ""
}

# Show help
show_help() {
    echo "Deploy with Full Lifecycle Validation"
    echo "======================================"
    echo ""
    echo "Runs complete deployment lifecycle:"
    echo "  1. Pre-deployment validation (20+ checks)"
    echo "  2. Deploy to Vercel production"
    echo "  3. Wait for global propagation"
    echo "  4. Post-deployment production validation"
    echo "  5. Generate validation report"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-validation    Skip pre-deployment validations"
    echo "  --skip-postvalidation Skip post-deployment validation"
    echo "  --no-report          Don't generate HTML report"
    echo "  --auto-confirm, -y   Skip deployment confirmation"
    echo "  --url=<url>          Override production URL (default: https://www.z-beam.com)"
    echo "  --wait=<seconds>     Override propagation wait time (default: 30)"
    echo "  --help, -h           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                   # Full lifecycle with all validations"
    echo "  $0 -y                # Auto-confirm, no prompts"
    echo "  $0 --wait=60         # Wait 60s for propagation"
    echo "  $0 --no-report       # Skip HTML report generation"
    echo ""
    echo "Environment Variables:"
    echo "  PRODUCTION_URL       Override production URL"
    echo "  PROPAGATION_WAIT     Override propagation wait time"
    echo ""
}

# Parse arguments
SKIP_POSTVALIDATION=false
GENERATE_REPORT=true

for arg in "$@"; do
    case $arg in
        --help|-h)
            show_help
            exit 0
            ;;
        --skip-postvalidation)
            SKIP_POSTVALIDATION=true
            shift
            ;;
        --no-report)
            GENERATE_REPORT=false
            shift
            ;;
        --url=*)
            PRODUCTION_URL="${arg#*=}"
            shift
            ;;
        --wait=*)
            PROPAGATION_WAIT="${arg#*=}"
            shift
            ;;
    esac
done

# Main execution
main() {
    section "DEPLOY WITH FULL LIFECYCLE VALIDATION"
    
    log "Target: $PRODUCTION_URL"
    log "Propagation wait: ${PROPAGATION_WAIT}s"
    
    # Phase 1: Deploy with pre-validation
    if ! deploy_with_prevalidation "$@"; then
        show_summary "failed"
        exit 1
    fi
    
    # Phase 2: Wait for propagation
    wait_for_propagation
    
    # Phase 3: Post-deployment validation
    local validation_passed=true
    if [ "$SKIP_POSTVALIDATION" = false ]; then
        if ! validate_production; then
            validation_passed=false
        fi
    else
        warning "Skipping post-deployment validation (--skip-postvalidation)"
    fi
    
    # Phase 4: Generate report
    if [ "$GENERATE_REPORT" = true ] && [ "$SKIP_POSTVALIDATION" = false ]; then
        generate_report
    fi
    
    # Summary
    if [ "$validation_passed" = true ]; then
        show_summary "success"
        exit 0
    else
        show_summary "warning"
        exit 1
    fi
}

# Run main
main "$@"
