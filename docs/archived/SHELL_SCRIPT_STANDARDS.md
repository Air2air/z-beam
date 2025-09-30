# Z-Beam Shell Script and VS Code Configuration Standards

## Shell Script Standards

### File Structure
All shell scripts should follow this structure:

```bash
#!/bin/bash
# =============================================================================
# Script Name and Purpose
# =============================================================================
# Purpose: Brief description
# Usage: ./script-name.sh [arguments]
# Author: Z-Beam Development Team
# Last Modified: YYYY-MM-DD
# =============================================================================

# Strict error handling
set -euo pipefail

# Configuration constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
```

### Logging Standards
Use these standardized logging functions:

```bash
log_info() { echo "ℹ️  [INFO] $*" >&2; }
log_success() { echo "✅ [SUCCESS] $*" >&2; }
log_warning() { echo "⚠️  [WARNING] $*" >&2; }
log_error() { echo "❌ [ERROR] $*" >&2; }
log_progress() { echo "🔄 [PROGRESS] $*" >&2; }
```

### Error Handling
Always include proper error handling:

```bash
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Script failed with exit code: $exit_code"
    fi
    exit $exit_code
}

trap cleanup EXIT
trap 'log_error "Script interrupted"; exit 130' INT TERM
```

### Naming Conventions
- Use kebab-case for script names: `stop-dev-server.sh`
- Use snake_case for functions and variables: `check_prerequisites`
- Use SCREAMING_SNAKE_CASE for constants: `PROJECT_ROOT`

### Best Practices
1. Always use `set -euo pipefail` for strict error handling
2. Make scripts executable: `chmod +x script-name.sh`
3. Include usage/help functions
4. Validate prerequisites before execution
5. Use readonly for constants
6. Quote variables to prevent word splitting
7. Use `[[ ]]` instead of `[ ]` for tests

## VS Code Configuration Standards

### Settings Organization
The `.vscode/settings.json` is organized into logical sections:

1. **Python-specific settings** - Formatter, linting, paths
2. **Global editor settings** - Format on save, code actions
3. **TypeScript/JavaScript settings** - Memory limits, validation
4. **File management** - Exclusions for performance
5. **Development preferences** - Confirmations, git settings
6. **Terminal settings** - Default shell configuration

### Key Settings Explained

#### Performance Optimization
```json
{
  "typescript.tsserver.maxTsServerMemory": 4096,
  "typescript.tsserver.watchOptions": {
    "watchFile": "useFsEvents",
    "watchDirectory": "useFsEvents",
    "fallbackPolling": "dynamicPriorityPolling"
  }
}
```

#### File Exclusions
```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/.git": true,
    "**/*.backup": true,
    "**/tsconfig.tsbuildinfo": true
  }
}
```

### Tasks Configuration
Tasks are organized by purpose:

1. **Development tasks** - Start, stop, clean start dev server
2. **Build tasks** - Production builds, analysis
3. **Test tasks** - Component audits, comprehensive testing
4. **Utility tasks** - Safe component creation and extension

### Task Best Practices
1. Use descriptive labels
2. Set appropriate problem matchers
3. Configure presentation options for user experience
4. Use background tasks for long-running processes
5. Include proper error handling in shell commands

## Current Status

### ✅ Standardized Components
- Stop dev server script (uses template standards)
- VS Code settings (organized and optimized)
- Tasks configuration (properly structured)
- ESLint configuration (appropriate rules)

### 🔄 Needs Standardization
1. **Legacy shell scripts** should be updated to use the template
2. **Consistent logging** across all scripts
3. **Error handling** standardization in older scripts
4. **Documentation** levels need to be consistent

### 📋 Recommended Actions
1. Update existing shell scripts to follow the template
2. Add `--help` flags to all scripts
3. Implement consistent error handling
4. Add prerequisite checks to all scripts
5. Consider adding a `scripts/lint-scripts.sh` to validate script standards

## Script Template Usage

Copy `/scripts/script-template.sh` as a starting point for new scripts:

```bash
cp scripts/script-template.sh scripts/new-script-name.sh
chmod +x scripts/new-script-name.sh
# Edit the script to implement your specific functionality
```

The template includes:
- Proper error handling
- Logging functions
- Argument parsing
- Prerequisites checking
- Usage documentation
- Cleanup functions
