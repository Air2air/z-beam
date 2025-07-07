# Z-Beam Project Guide

> **Development Workflow & Implementation Guide**

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
2. **Find existing components** - Which components could be extended?
3. **Modify first** - Add props to existing components when possible
4. **Enforce patterns** - Run enforcement checks after changes
5. **Validate changes** - Ensure build passes with modifications

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
// ❌ WRONG: Creating separate component files
// Do not create: TagList.tsx, BadgeComponent.tsx, ButtonSecondary.tsx

// ❌ WRONG: Hardcoded styles
<div className="px-4 py-2 bg-blue-500 text-white rounded">Button</div>

// ✅ CORRECT: Use shared components with props
<Button variant="primary" size="medium">Button</Button>
```

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
2. **Search existing components** for similar functionality
3. **Identify extension points** in current components
4. **Create props interface** for configuration
5. **Add conditional rendering** based on props
6. **Test across variants** to ensure compatibility

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

**This guide is designed to work alongside REQUIREMENTS.md. Refer to that document for core architecture principles and standards.**
