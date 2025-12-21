#!/bin/bash
set -e

echo "📚 Documentation Consolidation Script"
echo "======================================"
echo ""

# Phase 1: Move redundant root directories
echo "Phase 1: Eliminating redundant root directories..."
echo ""

echo "📂 Moving SEO docs..."
mkdir -p docs/02-features/seo
[ -f docs/seo/GOOGLE_SHOPPING_SPEC.md ] && mv docs/seo/GOOGLE_SHOPPING_SPEC.md docs/02-features/seo/ && echo "  ✅ Moved GOOGLE_SHOPPING_SPEC.md"
[ -f docs/seo/SEO_INFRASTRUCTURE_E2E_AUDIT_DEC6_2025.md ] && mv docs/seo/SEO_INFRASTRUCTURE_E2E_AUDIT_DEC6_2025.md docs/archive/2025-11/ && echo "  ✅ Archived SEO_INFRASTRUCTURE_E2E_AUDIT"

echo "📂 Moving deployment docs..."
mkdir -p docs/02-features/deployment
[ -f docs/deployment/VALIDATION_GUIDE.md ] && mv docs/deployment/VALIDATION_GUIDE.md docs/02-features/deployment/ && echo "  ✅ Moved VALIDATION_GUIDE.md"

echo "📂 Moving Google Ads docs..."
[ -f docs/google-ads/README.md ] && mv docs/google-ads/README.md docs/02-features/seo/GOOGLE_ADS_SETUP.md && echo "  ✅ Moved Google Ads to GOOGLE_ADS_SETUP.md"

echo "📂 Moving reference docs..."
[ -f docs/reference/IMAGE_NAMING_CONVENTIONS.md ] && mv docs/reference/IMAGE_NAMING_CONVENTIONS.md docs/01-core/IMAGE_NAMING_CONVENTIONS.md && echo "  ✅ Moved IMAGE_NAMING_CONVENTIONS.md"

echo ""
echo "Phase 2: Reorganizing specs/ directory..."
echo ""

mkdir -p docs/01-core/frontmatter/examples
mkdir -p docs/02-features/content

[ -f docs/specs/COMPONENT_SUMMARY_GENERATION_PROMPT.md ] && mv docs/specs/COMPONENT_SUMMARY_GENERATION_PROMPT.md docs/02-features/content/ && echo "  ✅ Moved COMPONENT_SUMMARY_GENERATION_PROMPT.md"
[ -f docs/specs/CONTAMINATION_FRONTMATTER_IMPROVEMENTS.md ] && mv docs/specs/CONTAMINATION_FRONTMATTER_IMPROVEMENTS.md docs/archive/2025-11/ && echo "  ✅ Archived CONTAMINATION_FRONTMATTER_IMPROVEMENTS.md"
[ -f docs/specs/FRONTEND_INTEGRATION_GUIDE.md ] && mv docs/specs/FRONTEND_INTEGRATION_GUIDE.md docs/03-guides/ && echo "  ✅ Moved FRONTEND_INTEGRATION_GUIDE.md"
[ -f docs/specs/FRONTMATTER_EXAMPLE.yaml ] && mv docs/specs/FRONTMATTER_EXAMPLE.yaml docs/01-core/frontmatter/examples/ && echo "  ✅ Moved FRONTMATTER_EXAMPLE.yaml"
[ -f docs/specs/SERVICE_OFFERING_FRONTMATTER_SPEC.md ] && mv docs/specs/SERVICE_OFFERING_FRONTMATTER_SPEC.md docs/01-core/frontmatter/ && echo "  ✅ Moved SERVICE_OFFERING_FRONTMATTER_SPEC.md"

echo ""
echo "Phase 3: Organizing 04-reference/ subdirectories..."
echo ""

mkdir -p docs/04-reference/{api,scripts,build-deploy}

[ -f docs/04-reference/QUICK_REFERENCE_TYPE_JSONLD.md ] && mv docs/04-reference/QUICK_REFERENCE_TYPE_JSONLD.md docs/04-reference/api/ && echo "  ✅ Moved to api/"
[ -f docs/04-reference/GIT_HOOKS_QUICK_REF.md ] && mv docs/04-reference/GIT_HOOKS_QUICK_REF.md docs/04-reference/scripts/ && echo "  ✅ Moved GIT_HOOKS to scripts/"
[ -f docs/04-reference/PROCESS_MONITORING_QUICK_REF.md ] && mv docs/04-reference/PROCESS_MONITORING_QUICK_REF.md docs/04-reference/scripts/ && echo "  ✅ Moved PROCESS_MONITORING to scripts/"
[ -f docs/04-reference/BUILD_TIME_REQUIREMENTS.md ] && mv docs/04-reference/BUILD_TIME_REQUIREMENTS.md docs/04-reference/build-deploy/ && echo "  ✅ Moved BUILD_TIME to build-deploy/"
[ -f docs/04-reference/DEPLOYMENT_QUICK_REFERENCE.md ] && mv docs/04-reference/DEPLOYMENT_QUICK_REFERENCE.md docs/04-reference/build-deploy/ && echo "  ✅ Moved DEPLOYMENT_QUICK_REFERENCE to build-deploy/"
[ -f docs/04-reference/BREADCRUMB_STANDARD.md ] && mv docs/04-reference/BREADCRUMB_STANDARD.md docs/04-reference/build-deploy/ && echo "  ✅ Moved BREADCRUMB to build-deploy/"

echo ""
echo "Phase 4: Archiving historical analysis..."
echo ""

mkdir -p docs/archive/2025-11

# Archive all E2E analysis files
for file in docs/04-reference/E2E_*.md; do
  [ -f "$file" ] && mv "$file" docs/archive/2025-11/ && echo "  ✅ Archived $(basename $file)"
done

# Archive test-related historical files
[ -f docs/04-reference/FULL_TEST_RESULTS.md ] && mv docs/04-reference/FULL_TEST_RESULTS.md docs/archive/2025-11/ && echo "  ✅ Archived FULL_TEST_RESULTS.md"
[ -f docs/04-reference/TEST_FIXES_ACTION_PLAN.md ] && mv docs/04-reference/TEST_FIXES_ACTION_PLAN.md docs/archive/2025-11/ && echo "  ✅ Archived TEST_FIXES_ACTION_PLAN.md"
[ -f docs/04-reference/TEST_INFRASTRUCTURE_UPDATE.md ] && mv docs/04-reference/TEST_INFRASTRUCTURE_UPDATE.md docs/archive/2025-11/ && echo "  ✅ Archived TEST_INFRASTRUCTURE_UPDATE.md"
[ -f docs/04-reference/TEST_AND_DOCS_STATUS.md ] && mv docs/04-reference/TEST_AND_DOCS_STATUS.md docs/archive/2025-11/ && echo "  ✅ Archived TEST_AND_DOCS_STATUS.md"
[ -f docs/04-reference/TESTS_AND_DOCS_STATUS.md ] && mv docs/04-reference/TESTS_AND_DOCS_STATUS.md docs/archive/2025-11/ && echo "  ✅ Archived TESTS_AND_DOCS_STATUS.md (duplicate)"

# Archive other historical files
[ -f docs/04-reference/PROPERTY_BARS_MIGRATION_EXAMPLE.md ] && mv docs/04-reference/PROPERTY_BARS_MIGRATION_EXAMPLE.md docs/archive/2025-11/ && echo "  ✅ Archived PROPERTY_BARS_MIGRATION_EXAMPLE.md"
[ -f docs/04-reference/PREDEPLOY_CHECKS_EVALUATION.md ] && mv docs/04-reference/PREDEPLOY_CHECKS_EVALUATION.md docs/archive/2025-11/ && echo "  ✅ Archived PREDEPLOY_CHECKS_EVALUATION.md"
[ -f docs/04-reference/nested-search-verification.md ] && mv docs/04-reference/nested-search-verification.md docs/archive/2025-11/ && echo "  ✅ Archived nested-search-verification.md"
[ -f docs/04-reference/test-unorganized.md ] && mv docs/04-reference/test-unorganized.md docs/archive/2025-11/ && echo "  ✅ Archived test-unorganized.md"

echo ""
echo "Phase 5: Cleaning up empty directories..."
echo ""

rmdir docs/seo 2>/dev/null && echo "  ✅ Removed docs/seo/" || echo "  ℹ️  docs/seo/ not empty or already removed"
rmdir docs/deployment 2>/dev/null && echo "  ✅ Removed docs/deployment/" || echo "  ℹ️  docs/deployment/ not empty or already removed"
rmdir docs/google-ads 2>/dev/null && echo "  ✅ Removed docs/google-ads/" || echo "  ℹ️  docs/google-ads/ not empty or already removed"
rmdir docs/reference 2>/dev/null && echo "  ✅ Removed docs/reference/" || echo "  ℹ️  docs/reference/ not empty or already removed"

echo ""
echo "======================================"
echo "✅ Phase 1 Complete: Structural consolidation finished"
echo ""
echo "📊 Statistics:"
echo "  Total markdown files: $(find docs -name '*.md' -type f | wc -l | tr -d ' ')"
echo "  Archive files: $(find docs/archive -name '*.md' -type f | wc -l | tr -d ' ')"
echo "  Specs directory: $(find docs/specs -name '*.md' -type f | wc -l | tr -d ' ') schemas"
echo "  04-reference/ root: $(find docs/04-reference -maxdepth 1 -name '*.md' -type f | wc -l | tr -d ' ') files"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Update docs/README.md"
echo "  3. Commit changes: git add docs/ && git commit -m 'docs: Phase 1 consolidation complete'"
