# Z-Beam Project Requirements

> **Core Architecture Principles & Technical Standards**

## 1. Core Principles

### Simplicity First
- **Optimize before creating** - Extend existing code first
- **Zero component duplication** - Each UI pattern exists once
- **Smallest codebase wins** - Fewer files, less complexity, easier maintenance

### Anti-Bloat Mandate
- Reuse components through props and composition
- No duplicate styling patterns across components
- Centralize shared logic in utilities

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

**For development workflow and implementation details, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).**
