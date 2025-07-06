# Z-Beam Laser Cleaning Project

## 📋 Documentation

**⚠️ IMPORTANT:** All project documentation has been consolidated into a single source of truth.

**👉 READ THIS FIRST:** [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)

The PROJECT_GUIDE.md contains:
- Core Architecture Principles
- Development Workflow  
- Claude AI Compliance
- Quick Reference

## Previous Documentation

Archived documentation can be found in `docs/archived/` for reference only.

## Quick Start

```bash
# Start development with automatic health checks
npm run dev

# Just run health checks (without starting server)
npm run ready

# Start dev server without checks (if you need to bypass)
npm run dev:direct
```

**When you run `npm run dev`, it will:**
1. ✅ Check CSS & Tailwind configuration
2. ✅ Validate component system health  
3. ✅ Confirm dependencies are installed
4. ✅ Verify TypeScript compilation
5. ✅ Check port availability
6. 🚀 Start the development server

**If any issues are found, the script will:**
- ❌ Stop before starting the server
- 🔧 Show specific fix instructions
- 💡 Guide you through resolving issues

# Build for production
npm run build
```

For detailed workflow and component usage, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).
