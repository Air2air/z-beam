# Z-Beam Project Guide

> **Development Workflow & Implementation Guide: Prioritizing Small Codebase & Component Reuse**

**CORE MANDATE:** This project has a ZERO-TOLERANCE policy for codebase expansion, strictly prioritizing maintaining the smallest possible codebase by extending existing components rather than creating new ones. All development MUST follow the "MODIFY BEFORE CREATE" principle without exception. Creating new components instead of extending existing ones is a direct violation of the project's core requirements.

## 1. Project Structure

```
/
├── app/                    # Next.js application
│   ├── components/        # React components
│   ├── materials/         # Material pages
│   ├── css/              # Global styles
│   ├── utils/            # Utility functions
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── public/                # Next.js static assets
│   └── images/           # Image assets
├── docs/                  # Documentation
├── REQUIREMENTS.md       # Core architecture principles
├── PROJECT_GUIDE.md      # This development guide
├── package.json          # Next.js dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 2. Development Workflow

### Essential Commands

```bash
# Start development
npm run dev          # Start dev server with health checks
npm run dev:fast     # Skip checks for faster startup
npm run ready        # Just run health checks

# Development Tools
npm run enforce-components  # Check component rules
npm run webpack:check       # Check webpack health
npm run webpack:repair      # Auto-repair webpack issues
npm run kill-port           # Free port 3000 if busy

# Production
npm run build               # Full build with all checks
```

### Component Development Process

1. **Analyze needs** - What functionality is required?
2. **MANDATORY: Find existing components** - Which components MUST be extended? (REQUIRED)
3. **MANDATORY: Modify existing code** - Add props to existing components (DEFAULT AND REQUIRED APPROACH)
4. **STRICT PROHIBITION: Never create new components** - Unless every possible extension option has been exhausted and documented
5. **MANDATORY: Enforce patterns** - Run enforcement checks after changes
6. **MANDATORY: Validate changes** - Ensure build passes with modifications
7. **MANDATORY: Verify size reduction** - Changes MUST maintain or reduce codebase size
8. **MANDATORY: Document extension** - Document how the extension was implemented for future reference

## 3. Component Examples

### Proper Usage Patterns

```typescript
// SmartTagList
<SmartTagList 
  tags={['laser', 'cleaning']} 
  variant="compact" 
  onClick={handleTagClick} 
/>

// Button with variants
<Button 
  variant="secondary" 
  size="small"
  onClick={handleClick}
>
  Click Me
</Button>

// AuthorCard with layout options
<AuthorCard 
  author={author} 
  layout="compact" 
  showTags={false} 
/>
```

### Common Anti-Patterns to Avoid

```typescript
// ❌ STRICTLY PROHIBITED: Creating new component files
// NEVER create: TagList.tsx, BadgeComponent.tsx, ButtonSecondary.tsx
// This violates the core "modify before create" principle

// ❌ STRICTLY PROHIBITED: Hardcoded styles
<div className="px-4 py-2 bg-blue-500 text-white rounded">Button</div>

// ❌ STRICTLY PROHIBITED: Duplicating functionality
const MyCustomButton = () => <button className="btn">Click me</button>;

// ✅ REQUIRED APPROACH: Extend existing components with props
<Button variant="primary" size="medium">Button</Button>
<SmartTagList tags={tags} variant="compact" />
<Container size="small" hasBorder={true}>Content</Container>
```

> **⚠️ ZERO TOLERANCE:** Creating new components instead of extending existing ones is a SEVERE violation of the project's core principle of maintaining the smallest possible codebase. All changes MUST prioritize code reuse over creation. Violating this principle is grounds for immediate rejection of any pull request.

### Strict Anti-Pattern Warning

**PROHIBITED BEHAVIOR: COMPONENT CREATION**

This project has a strict anti-component creation policy. The following actions are explicitly prohibited:

1. **Creating new component files** without exhausting all extension options
2. **Duplicating existing functionality** in any form
3. **Adding new UI patterns** instead of using existing ones
4. **Increasing codebase size** when an extension would work

Before considering a new component, you MUST:
- Document all existing components evaluated
- Demonstrate why extension is impossible
- Get explicit approval from project maintainers
- Prove the absolute necessity of the new component

## 4. Troubleshooting Guide

### Build Error Quick Fixes

| Error | Solution |
|-------|----------|
| Component violations | `npm run enforce-components` |
| TypeScript errors | `npx tsc --noEmit` |
| Webpack cache issues | `npm run webpack:repair` |
| Next.js page errors | Check async params usage |
| CSS not loading | `npm run ready` and check CSS section |
| Port 3000 busy | `npm run kill-port` |

### Common Next.js 15 Issues

- **Missing async params**: Ensure `const { slug } = await params`
- **SSR errors with dynamic components**: Use proper client components
- **React version conflicts**: Check package overrides in package.json
- **Image optimization failures**: Verify next.config.js settings

### React Component Errors

- **"Multiple instances of React"**: Fix with npm overrides
- **"Invalid hook call"**: Check React import consistency
- **"Cannot find module"**: Run `npm run webpack:repair`

## 5. Development Tools

### Modify-First Development Tools

| Tool | Command | Purpose |
|------|---------|---------|
| Component Finder | `node find-component-to-extend.js <pattern>` | Find extendable components |
| Safe Creation | `node safe-component-creation.js <name>` | Create compliant components |
| Enforcement Check | `npm run enforce-components` | Validate component compliance |

### Project Health Tools

| Check | Purpose |
|-------|---------|
| `npm run ready` | Full health check (CSS, TypeScript, components) |
| `npm run webpack:check` | Diagnose webpack issues |
| `npm run webpack:repair` | Automatic cache/conflict resolution |
| `npm run validate:guide` | Ensure documentation integrity |

## 6. Dynamic Component Development

### Feature Addition Process

1. **Define requirements** clearly before starting
2. **MANDATORY: Search ALL existing components** for similar functionality using component discovery tools
3. **MANDATORY: Extend existing components** - Adding new components is STRICTLY PROHIBITED unless ALL extension options have been completely exhausted
4. **MANDATORY: Identify extension points** in current components, prioritizing the most used components
5. **MANDATORY: Create props interface** for configuration, ensuring backward compatibility
6. **MANDATORY: Add conditional rendering** based on props to extend functionality
7. **MANDATORY: Test across all variants** to ensure compatibility with existing usage
8. **MANDATORY: Document all extension attempts** - Keep a record of all components evaluated for extension
9. **EXCEPTIONAL CASE ONLY: Prove absolute necessity** - If proposing a new component (which should be extremely rare), you must:
   - Document all existing components evaluated for extension
   - Provide technical proof that extension is impossible
   - Get explicit sign-off from at least two senior team members
   - Create an extension plan to ensure the component is extensible for future needs

### Component File Structure

```typescript
// Recommended component file structure
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  // Additional props
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  ...props
}: ButtonProps) {
  // Implementation with conditional classes
  return (
    <button
      className={`btn ${variant} ${size}`}
      {...props}
    />
  );
}
```

---

## Document Relationship

**This guide is designed to work alongside [REQUIREMENTS.md](./REQUIREMENTS.md)**:
- **REQUIREMENTS.md**: Core architecture principles (WHAT to build)
- **PROJECT_GUIDE.md** (this document): Development workflow (HOW to build it)

Both documents enforce the same core principle: **MODIFY BEFORE CREATE**

## For AI Assistants

> **Important guidance for AI Assistants processing this codebase:**

1. **Core Principle**: Always prioritize extending existing components through props and configuration rather than creating new components.

2. **Document Navigation**:
   - **REQUIREMENTS.md**: Contains architectural principles and component standards
   - **PROJECT_GUIDE.md** (this document): Contains development workflow and implementation details

3. **Component Modification Flow**:
   - First, identify relevant existing components (SmartTagList, Button, AuthorCard, Container)
   - Analyze their props and extension points
   - Use conditional rendering and prop variations to adapt them
   - NEVER suggest creating new component files unless absolutely necessary

4. **Anti-Pattern Detection**:
   - If asked to create a new component, first suggest extending an existing one
   - Always reference the "MODIFY BEFORE CREATE" principle when making recommendations
   - Highlight when a proposed approach might violate the codebase minimalism principle

5. **Decision Hierarchy**:
   - Extend existing components (FIRST CHOICE)
   - Modify existing components (SECOND CHOICE)
   - Create new components (LAST RESORT, requires justification)

The project enforces strict codebase minimalism and prohibits component duplication.

---
