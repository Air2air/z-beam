---
title: "Component Rules & Development Standards"
category: "Development"
difficulty: "Intermediate"
lastUpdated: "2025-09-11"
relatedDocs: ["coding-standards.md", "testing-framework.md", "component-system.md"]
copilotTags: ["components", "rules", "standards", "development", "react"]
---

# Component Rules & Development Standards

> **Quick Reference**: Essential rules for component development in Z-Beam. **MODIFY BEFORE CREATE** - Always extend existing components.

## 🎯 Core Principles

### **1. 🛡️ MODIFY BEFORE CREATE**
- **Always extend existing components** before creating new ones
- New components are **strictly prohibited** unless all extension options are exhausted
- Smallest codebase wins - fewer files, less complexity, maximum reuse

### **2. 🚫 Zero Component Duplication**
- Each UI pattern must exist **exactly once**
- No duplicate functionality across components
- Consolidate similar components whenever possible

### **3. ⚡ Fail-Fast Architecture**
- Components must fail early with clear error messages
- No silent failures or fallback renders
- Explicit error boundaries where needed

## 🔧 Component Development Workflow

### **Before Creating Any Component**

1. **📖 Audit Existing Components**
   ```bash
   # Search for similar patterns
   find app/components -name "*.tsx" -exec grep -l "pattern" {} \;
   
   # Run component analysis
   npm run enforce-components
   ```

2. **🔍 Check Extension Possibilities**
   - Can the existing component accept new props?
   - Can it be made more generic with conditional rendering?
   - Can the layout be extended with composition?

3. **📋 Document Justification**
   - Why can't existing components be extended?
   - What makes this component unique?
   - How does it reduce overall complexity?

### **Component Creation Process**

```bash
# Only if absolutely necessary
npm run create:component ComponentName

# This will:
# 1. Check for existing similar components
# 2. Guide you through extension options
# 3. Create component only if justified
```

## 🏗️ Component Architecture Standards

### **File Structure**
```
app/components/
├── ComponentName/
│   ├── ComponentName.tsx     # Main component
│   ├── ComponentName.test.tsx # Tests
│   ├── index.ts              # Exports
│   └── types.ts              # TypeScript types
```

### **Component Template**
```tsx
// app/components/ComponentName/ComponentName.tsx
'use client';

import { ComponentNameProps } from './types';

export function ComponentName({ 
  children,
  className = '',
  ...props 
}: ComponentNameProps) {
  return (
    <div className={`component-name ${className}`} {...props}>
      {children}
    </div>
  );
}

export default ComponentName;
```

### **Props Interface**
```typescript
// app/components/ComponentName/types.ts
import { ReactNode, HTMLAttributes } from 'react';

export interface ComponentNameProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
```

## ✅ Component Quality Checklist

### **Before Submission**
- [ ] **Reusability**: Can be used in multiple contexts
- [ ] **Accessibility**: Proper ARIA labels and keyboard navigation
- [ ] **TypeScript**: Full type safety with interfaces
- [ ] **Testing**: Unit tests with good coverage
- [ ] **Documentation**: Clear JSDoc comments
- [ ] **Performance**: Optimized rendering and props
- [ ] **Consistency**: Follows existing patterns

### **Testing Requirements**
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders children correctly', () => {
    render(<ComponentName>Test content</ComponentName>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ComponentName className="custom">Content</ComponentName>);
    expect(screen.getByText('Content')).toHaveClass('custom');
  });
});
```

## 🚫 Prohibited Practices

### **❌ Never Do This**
```tsx
// ❌ Creating duplicate functionality
export function NewButton() { /* ... */ }  // Use existing Button
export function CustomList() { /* ... */ }  // Extend existing List

// ❌ Hard-coded values
export function Banner() {
  return <div style={{ color: 'red' }}>...</div>;
}

// ❌ Missing error handling
export function DataDisplay({ data }) {
  return <div>{data.items.map(...)}</div>; // No null check
}
```

### **✅ Do This Instead**
```tsx
// ✅ Extend existing components
<Button variant="custom" className="special-button">

// ✅ Use CSS classes
<div className="banner banner--error">

// ✅ Proper error handling
export function DataDisplay({ data }: DataDisplayProps) {
  if (!data?.items) {
    throw new Error('DataDisplay requires data.items array');
  }
  return <div>{data.items.map(...)}</div>;
}
```

## 🔍 Component Enforcement

### **Automatic Checks**
```bash
# Run before every commit
npm run enforce-components

# Quick audit
npm run component-audit

# Find unused components
npm run find-dead-components
```

### **Build-Time Validation**
- Components are checked for duplicates during build
- TypeScript compilation enforces type safety
- ESLint rules enforce naming and structure
- Tests must pass for all components

## 🔗 Related Documentation

- [Coding Standards](./coding-standards.md) - General code quality rules
- [Testing Framework](./testing-framework.md) - Testing strategies and tools
- [Component Architecture](../architecture/component-system.md) - System overview
- [Project Overview](../architecture/project-overview.md) - High-level context

## 🚨 Emergency Recovery

If you accidentally create duplicate components:

```bash
# Analyze impact
git status
npm run component-audit

# Restore if needed
git checkout HEAD -- path/to/component

# Check for conflicts
npm run enforce-components
```

---

**Remember**: The goal is the smallest, most maintainable codebase possible. Every component addition should **reduce** overall complexity, not increase it.
