# Z-Beam Component Creation Guide

This guide explains how to safely create and extend components in the Z-Beam project.

## Safe Component Creation

Z-Beam uses a structured approach to component creation to ensure consistency and maintainability.

### Using the Safe Component Creation Script

The easiest way to create a new component is to use the provided script:

```bash
npm run create:component
# OR
npm run safe:component
```

This will prompt you for a component name and create the necessary files with proper structure.

### Manual Component Creation

If you prefer to create components manually, follow these steps:

1. Create a directory for your component in `/app/components/`
2. Create the following files:
   - `index.tsx` - Main component file
   - `styles.scss` - Component styles (if needed)
   - `types.ts` - TypeScript type definitions
   - `README.md` - Component documentation

#### Example Component Structure

```
app/components/MyComponent/
├── index.tsx        # Main component implementation
├── styles.scss      # Component-specific styles
├── types.ts         # TypeScript interfaces and types
└── README.md        # Documentation and usage examples
```

#### Basic Component Template

```tsx
// app/components/MyComponent/index.tsx
'use client';

import React from 'react';
import { MyComponentProps } from './types';
import './styles.scss';

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="my-component">
      <h2 className="my-component__title">{title}</h2>
      {description && (
        <p className="my-component__description">{description}</p>
      )}
      <div className="my-component__content">{children}</div>
    </div>
  );
};

export default MyComponent;
```

```ts
// app/components/MyComponent/types.ts
export interface MyComponentProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
```

```scss
// app/components/MyComponent/styles.scss
.my-component {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px;
  
  &__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  &__description {
    color: #666;
    margin-bottom: 16px;
  }
  
  &__content {
    // Content styles
  }
}
```

## Extending Existing Components

To create variations of existing components:

### Using the Component Extension Script

```bash
npm run Task: Safe Component Extension
# OR
node safe-component-extension.js
```

This script helps you create a new component that extends an existing one.

### Manual Component Extension

1. Find a component to extend using:
   ```bash
   npm run Task: Find Component to Extend
   ```

2. Create a new component directory with the same structure
3. Import and extend the base component

#### Example of Component Extension

```tsx
// app/components/SpecialCard/index.tsx
'use client';

import React from 'react';
import Card from '../Card';
import { SpecialCardProps } from './types';
import './styles.scss';

export const SpecialCard: React.FC<SpecialCardProps> = ({
  badge,
  ...cardProps
}) => {
  return (
    <div className="special-card">
      {badge && <span className="special-card__badge">{badge}</span>}
      <Card {...cardProps} />
    </div>
  );
};

export default SpecialCard;
```

## Component Rules and Best Practices

Z-Beam enforces certain rules for components to ensure consistency:

1. **Directory Structure**: Each component should be in its own directory with proper files
2. **Naming Convention**: Use PascalCase for component names and directories
3. **Type Definitions**: Always define props using TypeScript interfaces
4. **Documentation**: Include a README.md with usage examples
5. **CSS Methodology**: Use BEM naming convention for CSS classes
6. **Client Directive**: Add 'use client' directive for client components

## Validating Components

To ensure your components follow the project standards:

```bash
npm run enforce-components
# OR
npm run lint:components
```

This will check your components against the project's rules and provide feedback.

## Common Issues and Solutions

### "Component directory structure is invalid"

Ensure your component has all required files (index.tsx, types.ts, etc.).

### "Component is missing type definitions"

Create a types.ts file and define your component's props.

### "Component styles are not properly imported"

Ensure you're importing the styles.scss file in your component.

### "Client component directive is missing"

Add 'use client' at the top of your component file if it uses client-side features.
