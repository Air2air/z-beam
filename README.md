# Z-Beam Project

A Next.js application for laser cleaning materials content with robust component architecture and automated enforcement.

## 🚨 CRITICAL DOCUMENTATION FOR CLAUDE AI 🚨

**Claude MUST read these documents in this specific order:**

1. **[CLAUDE_COMPLIANCE.md](./CLAUDE_COMPLIANCE.md)** 🔥 **START HERE** - Quick reference checklist for every task
2. **[REQUIREMENTS.md](./REQUIREMENTS.md)** ⭐ Core architectural principles, anti-bloat mandate, zero duplication policy
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** ⭐ Development workflow, enforcement procedures, detailed tooling

**All three documents contain mandatory procedures that MUST be followed. NO EXCEPTIONS.**

## Additional Documentation

- **[docs/](./docs/)** - Detailed technical documentation
- **[content/README.md](./content/README.md)** - Content architecture documentation

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run enforcement checks
npm run enforce-components

# Build for production
npm run build
```

## Key Features

- **Zero Duplication Policy** - Automated enforcement prevents component duplication
- **Optimization-First Architecture** - Extend existing components before creating new ones
- **Strict Type Safety** - TypeScript with explicit configurations, no fallbacks
- **Component Reusability** - Shared components for all UI patterns

## Architecture Highlights

- `SmartTagList` - Unified tag/badge component
- `Button` - Shared button component with variants
- `AuthorCard` - Flexible author display component
- `Container` - Consistent card/container styling

For detailed architectural principles and enforcement rules, see [REQUIREMENTS.md](./REQUIREMENTS.md).

For development workflow and tooling details, see [DEVELOPMENT.md](./DEVELOPMENT.md).
