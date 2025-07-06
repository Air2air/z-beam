# Z-Beam Project

A Next.js application for laser cleaning materials content with robust component architecture and automated enforcement.

## Documentation

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Core architectural principles and component standards
- **[DEV_WORKFLOW.md](./DEV_WORKFLOW.md)** - Development workflow, tooling, and enforcement procedures
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

For development workflow and tooling details, see [DEV_WORKFLOW.md](./DEV_WORKFLOW.md).
