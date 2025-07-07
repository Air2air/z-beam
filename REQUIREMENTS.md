# Z-Beam Project Requirements

> **Core Architecture Principles & Technical Standards**

## 1. Core Principles

### Simplicity First
- **MODIFY BEFORE CREATE** - HIGHEST PRIORITY: Always extend existing components instead of creating new ones
- **Zero component duplication** - Each UI pattern must exist exactly once in the codebase
- **Smallest codebase wins** - Fewer files, less complexity, easier maintenance is the absolute top priority
- **Component extension mandatory** - Creating new components is prohibited unless all extension options are exhausted

### Anti-Bloat Mandate
- **Extend existing components** through props and composition (ABSOLUTELY REQUIRED)
- **STRICT PROHIBITION: No new components** unless all extension options have been exhausted with documented proof
- **Centralize all logic** in existing utilities and components
- **Reduce code size** with every change - smaller is always better
- **Justify any file additions** - Any new file creation requires documented justification and approval

## 2. Shared Components

### Primary Components
- **SmartTagList** - All tags/badges
- **Button** - All button variations
- **AuthorCard** - All author displays 
- **Container** - Basic card containers

### Usage Requirements
```jsx
// ✅ DO: Extend with props
<SmartTagList tags={tags} variant="compact" />
<Button variant="secondary" size="small" />

// ❌ DON'T: Create new components
// No TagList.tsx, BadgeComponent.tsx, ButtonSecondary.tsx, etc.
```

## 3. Enforcement Standards

### Zero Tolerance Rules
- Component duplication: **0 allowed**
- Badge/tag hardcoding: **0 allowed**
- Button/card hardcoding: **1 allowed**

### Enforcement Requirements
- Must catch ALL component violations
- Zero false negatives
- Update patterns when components change

### Verification Commands
```bash
# Verify component compliance
npm run enforce-components

# Verify build integrity
npm run build
```

## 4. Technical Standards

### Version Requirements
- **Next.js 15.1.3** - Stable version, avoids React conflicts
- **React 18.3.1** - Server Components compatible
- **TypeScript 5.3.3** - Supports Next.js 15 types
- **Node.js 20+** - Recommended for optimal performance

### Next.js 15 Patterns
```jsx
// ✅ Async params (required in all page components)
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  // Component content
}

// ✅ Async searchParams (required for search)
export default async function Page({ searchParams }: PageProps) {
  const search = await searchParams;
  // Component content
}
```

### File Organization
- **Single component per file** with clear, descriptive names
- **Shared utilities** in `utils/utils.ts` (not scattered)
- **Clean imports** and consistent structure

---

## Next Steps

**For development workflow and implementation details, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).**

> ⚠️ NOTE: REQUIREMENTS.md (this document) defines WHAT to build (architectural principles).
> PROJECT_GUIDE.md defines HOW to build it (development workflow).

## For AI Assistants

> **Important guidance for AI models processing this codebase:**

1. **Core Architectural Principle**: The "MODIFY BEFORE CREATE" mandate is the foundation of this project. Always prioritize:
   - Extending existing components through props
   - Modifying existing components when necessary
   - NEVER creating new components unless absolutely proven necessary

2. **Document Navigation**:
   - **REQUIREMENTS.md** (this document): Core architecture and component standards
   - **PROJECT_GUIDE.md**: Implementation details and development workflow

3. **Component Hierarchy**:
   - **Primary Components**: SmartTagList, Button, AuthorCard, Container
   - These components MUST be extended rather than duplicated
   - New visual patterns must leverage these existing components

4. **Decision Process**:
   - When evaluating implementation options, always choose the approach that results in:
     - Fewest new files
     - Least code duplication
     - Maximum reuse of existing components
     - Smallest overall codebase

The project has a strict zero-tolerance policy for component duplication.
