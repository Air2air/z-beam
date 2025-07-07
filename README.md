# Z-Beam Laser Cleaning Project

## 📋 Documentation

**⚠️ IMPORTANT:** Project documentation is organized into two concise files that work together:

**👉 READ THESE FIRST (IN ORDER):**
1. [REQUIREMENTS.md](./REQUIREMENTS.md) - Architecture principles and standards (WHAT to build)
2. [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) - Development workflow and tools (HOW to build it)

**Document Relationship:**
- The documentation is deliberately split to separate concerns
- All documents enforce the exact same "MODIFY BEFORE CREATE" principle
- There is no contradicting information between documents

## For AI Assistants

> **Important guidance for AI models working with this codebase:**

This project has a strict "MODIFY BEFORE CREATE" policy that requires extending existing components rather than creating new ones. When assisting with this codebase:

1. **Always prioritize component extension** over creating new components
2. **Reference the appropriate documentation**:
   - For architectural principles: [REQUIREMENTS.md](./REQUIREMENTS.md)
   - For implementation workflow: [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)
3. **Key shared components** that must be extended:
   - SmartTagList (for all tags/badges)
   - Button (for all button variations)
   - AuthorCard (for all author displays)
   - Container (for card containers)
4. **Strictly avoid** suggesting new component creation

When in doubt, default to extending existing components through props and conditional rendering.

**PROJECT CORE MANDATE:**
- **MODIFY BEFORE CREATE** - STRICT ENFORCEMENT: Always extend existing components instead of creating new ones
- **Smallest codebase wins** - Prioritize code reuse and minimal file count at all costs
- **Zero component duplication** - Each UI pattern must exist exactly once in the codebase
- **Zero tolerance for new components** - New components are strictly prohibited unless absolutely necessary with justification

These documents enforce our core optimization principles:
- **Zero duplication** - Each concept documented in exactly one place
- **Concise content** - Brief, actionable guidance without verbosity
- **Clear structure** - Logical organization by importance and use frequency
- **Practical examples** - Concrete code samples for common patterns

## Codebase Extension Enforcement

**This project uses automated enforcement to ensure compliance with the "MODIFY BEFORE CREATE" principle:**

- **Pre-commit hooks** verify no new components are created without approval
- **CI pipeline checks** enforce component reuse and prevent duplication
- **Automated code reviews** flag any violations of the extension-first principle
- **Regular codebase audits** identify opportunities to further consolidate components

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
