# Z-Beam Naming Conventions
**Quick Reference Guide for Developers**

---

## TL;DR - Essential Rules

```typescript
// ✅ Components: PascalCase
export function MaterialDetail() { ... }

// ✅ Props: Named interfaces
export interface MaterialDetailProps { ... }

// ✅ Data: Use 'metadata' consistently
article.metadata.title  // NOT article.frontmatter.title

// ✅ Booleans: is*, has*, can* prefixes
isLoading, hasSettings, canEdit

// ✅ Handlers: handle* prefix
const handleClick = () => { ... }
```

---

## 1. Components

### Files & Exports
```typescript
// ✅ File: PascalCase.tsx
MaterialDetail.tsx

// ✅ Export: Same name as file
export function MaterialDetail() { ... }
export default MaterialDetail;
```

### Props Interfaces
```typescript
// ✅ Pattern: <ComponentName>Props
export interface MaterialDetailProps {
  metadata: ArticleMetadata;
  isLoading: boolean;
  onClose: () => void;
}

// ✅ Export props for testing
export type { MaterialDetailProps };
```

### Folder Structure
```
// ✅ Multi-file component
Micro/
├── index.tsx        (re-exports)
├── Micro.tsx        (main component)
├── MicroContent.tsx (sub-component)
└── MicroHeader.tsx  (sub-component)

// ✅ Single-file component
Badge.tsx

// ✅ Related components
Heatmap/
├── BaseHeatmap.tsx
├── MaterialSafetyHeatmap.tsx
└── ProcessEffectivenessHeatmap.tsx
```

---

## 2. Data Structures

### Standard Terminology
```typescript
// ✅ USE: metadata (everywhere)
article.metadata.title
settings.metadata.machineSettings
material.metadata.description

// ❌ AVOID: frontmatter, data (ambiguous)
article.frontmatter.title  // NO
data.title  // NO
```

### Type Definitions
```typescript
// ✅ Centralized types only
import type { Author, CardProps } from '@/types';

// ❌ Never create local duplicates
// NO: interface Author { ... } in component files
```

---

## 3. Functions

### Naming Patterns
```typescript
// Retrieval
get*()     // getUser(), getSettings()
find*()    // findMaterial(), findById()
fetch*()   // fetchArticle(), fetchData()
load*()    // loadConfig(), loadFile()
read*()    // readFile(), readMetadata()

// Transformation
convert*()   // convertToJSON()
transform*() // transformData()
prepare*()   // prepareForDisplay()
parse*()     // parseYAML()
format*()    // formatDate()

// Creation
create*()    // createUser()
build*()     // buildQuery()
generate*()  // generateReport()
make*()      // makeRequest()

// Validation
validate*()  // validateInput()
check*()     // checkExists()
verify*()    // verifyAuth()
has*()       // hasPermission()
is*()        // isValid()

// Mutations
set*()       // setState()
update*()    // updateRecord()
modify*()    // modifyConfig()
```

### Examples
```typescript
// ✅ Good: Clear action verb
function getUserById(id: string): User { ... }
function validateEmail(email: string): boolean { ... }
function transformArticleData(raw: RawData): Article { ... }

// ❌ Bad: Unclear action
function user(id: string): User { ... }  // What does this do?
function email(value: string): boolean { ... }  // Check? Set? Get?
```

---

## 4. Props & Parameters

### Boolean Props
```typescript
// ✅ State checks
isLoading: boolean
isVisible: boolean
isActive: boolean
hasError: boolean
hasData: boolean
canEdit: boolean
canDelete: boolean
shouldValidate: boolean

// ✅ Configuration flags
enableCaching: boolean
allowOverride: boolean
showHeader: boolean
hideFooter: boolean

// ❌ Avoid ambiguous
loading: boolean     // Use isLoading
disabled: boolean    // Use isDisabled
visible: boolean     // Use isVisible
```

### Collection Props
```typescript
// ✅ Plural for arrays
materials: Material[]
categories: Category[]
authors: Author[]

// ✅ Singular for single item
material: Material
selectedCategory: Category
activeAuthor: Author

// ✅ Specific over generic
materials: Material[]  // NOT data: any[]
userList: User[]       // NOT items: any[]
```

### Event Handlers
```typescript
// ✅ Pattern: on* (prop) → handle* (function)
interface ButtonProps {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
}

function MyComponent({ onClick, onSubmit }: ButtonProps) {
  const handleClick = () => {
    // logic
    onClick();
  };
  
  const handleFormSubmit = (data: FormData) => {
    // logic
    onSubmit(data);
  };
  
  return (
    <button onClick={handleClick}>
    <form onSubmit={handleFormSubmit}>
  );
}
```

---

## 5. Files & Folders

### Components
```
app/components/
├── [PascalCase]/          # Component folder
│   └── Component.tsx      # Main file
├── [PascalCase]s/         # Related components (plural)
│   ├── VariantA.tsx
│   └── VariantB.tsx
└── Component.tsx          # Standalone component
```

### Utilities
```
app/utils/
├── [camelCase].ts         # Utility file
└── [camelCase]/           # Utility folder
    ├── helper.ts
    └── validator.ts
```

### Tests
```
tests/
├── components/
│   ├── Component.test.tsx           # Unit test
│   └── Component.accessibility.test.tsx  # Aspect test
├── integration/
│   └── feature-integration.test.ts
└── unit/
    └── function.test.ts
```

---

## 6. Constants & Configuration

### Naming Style
```typescript
// ✅ Immutable: SCREAMING_SNAKE_CASE
export const SITE_CONFIG = {
  name: 'Z-Beam',
  url: 'https://www.z-beam.com'
} as const;

export const MAX_RETRIES = 3 as const;
export const API_TIMEOUT_MS = 5000 as const;

// ✅ Mutable instances: camelCase
export const badgeCache = new PerformanceCache(...);
export const sessionManager = new SessionManager(...);

// ✅ Enums: PascalCase
export enum HttpStatus {
  OK = 200,
  NotFound = 404
}
```

---

## 7. TypeScript Types & Interfaces

### Interface Naming
```typescript
// ✅ PascalCase, no I-prefix
export interface User { ... }
export interface ArticleMetadata { ... }
export interface CardProps { ... }

// ❌ Avoid I-prefix (outdated convention)
export interface IUser { ... }  // NO
```

### Type Aliases
```typescript
// ✅ PascalCase
export type ContentType = 'materials' | 'contaminants';
export type StatusCode = 200 | 404 | 500;

// ✅ Descriptive union types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

### Generic Parameters
```typescript
// ✅ Single letter for simple generics
function identity<T>(value: T): T { ... }
Array<T>
Map<K, V>

// ✅ Descriptive for complex generics
function processArticles<ArticleType extends BaseArticle>(...) { ... }
```

---

## 8. URLs & Routes

### URL Structure
```
✅ Pattern: /<type>/<category>/<subcategory>/<slug>

/materials/metal/ferrous/steel-laser-cleaning
/contaminants/organic/oil/oil-contamination
/settings/metal/ferrous/steel-settings
```

### Slug Conventions
```
✅ kebab-case
✅ descriptive-suffixes
✅ consistent-within-type

materials:     *-laser-cleaning
contaminants:  *-contamination
settings:      *-settings
```

---

## 9. Git Commit Messages

### Format
```
<type>(<scope>): <subject>

feat(component): add MaterialDetail component
fix(api): resolve dataset loading issue
docs(naming): add naming conventions guide
refactor(layout): standardize metadata references
test(integration): add dataset validation tests
```

### Types
```
feat:     New feature
fix:      Bug fix
docs:     Documentation
refactor: Code restructuring
test:     Test changes
chore:    Maintenance
perf:     Performance improvement
```

---

## 10. Comments & Documentation

### JSDoc Comments
```typescript
/**
 * Retrieves user data by ID
 * 
 * @param id - User identifier
 * @returns User object or null if not found
 * @throws {NotFoundError} When user doesn't exist
 * 
 * @example
 * const user = getUserById('123');
 */
export function getUserById(id: string): User | null {
  // Implementation
}
```

### Inline Comments
```typescript
// ✅ Explain WHY, not WHAT
// Retry failed requests to handle transient network issues
if (error.isRetryable) { ... }

// ❌ Don't state the obvious
// Set loading to true
setLoading(true);
```

---

## 11. Import Organization

### Order
```typescript
// 1. External packages
import React from 'react';
import { render } from '@testing-library/react';

// 2. Internal absolute imports
import { Author } from '@/types';
import { getUserData } from '@/utils/api';

// 3. Relative imports
import { Button } from '../Button';
import styles from './Component.module.css';
```

### Naming
```typescript
// ✅ Named exports (preferred)
import { User, getUser } from '@/utils/user';

// ✅ Default exports (when needed)
import MaterialDetail from './MaterialDetail';

// ✅ Type imports
import type { User, UserProps } from '@/types';
```

---

## 12. Quick Decision Tree

### "What should I name this?"

```
Is it a React component?
├─ YES → PascalCase: MyComponent
└─ NO → Is it a function?
    ├─ YES → camelCase with verb: getUserData()
    └─ NO → Is it a constant?
        ├─ YES → Is it immutable?
        │   ├─ YES → SCREAMING_SNAKE_CASE: API_KEY
        │   └─ NO → camelCase: userCache
        └─ NO → Is it a type/interface?
            └─ YES → PascalCase: UserData
```

### "Where should this go?"

```
Is it a React component?
├─ YES → app/components/[Component]/
└─ NO → Is it a utility function?
    ├─ YES → app/utils/[utility].ts
    └─ NO → Is it a type definition?
        ├─ YES → types/centralized.ts
        └─ NO → Is it configuration?
            └─ YES → app/config/[config].ts
```

---

## 13. Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Ambiguous data references
article.frontmatter.title  // Use metadata
data.author                // Use metadata.author

// Missing Props interface
export function MyComponent({ title }: { title: string }) { ... }

// Unclear boolean prop
disabled: boolean  // Use isDisabled

// Generic collection name
items: any[]  // Use specific: materials, users, etc.

// Redundant folder/file
MaterialsLayout/MaterialsLayout.tsx

// I-prefix on interfaces
interface IUser { ... }
```

### ✅ Do This Instead
```typescript
// Clear data references
article.metadata.title
article.metadata.author

// Named Props interface
export interface MyComponentProps {
  title: string;
}
export function MyComponent({ title }: MyComponentProps) { ... }

// Clear boolean prop
isDisabled: boolean

// Specific collection name
materials: Material[]

// Clean structure
MaterialsLayout/
├── index.tsx
└── MaterialsLayout.tsx

// Standard interface
interface User { ... }
```

---

## 14. Enforcement

### Pre-commit Checklist
- [ ] All components have Props interfaces
- [ ] No `article.frontmatter` references (use `article.metadata`)
- [ ] Boolean props use `is*`, `has*`, or `can*` prefixes
- [ ] Functions use clear verb prefixes
- [ ] No duplicate type definitions (use `@/types`)

### ESLint Rules
```json
{
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"]
    },
    {
      "selector": "typeAlias",
      "format": ["PascalCase"]
    }
  ]
}
```

---

## 15. When in Doubt

### Principles
1. **Clarity over brevity**: `isUserAuthenticated` > `auth`
2. **Consistency over personal preference**: Follow existing patterns
3. **Semantics over syntax**: Name reveals purpose
4. **Standards over invention**: Use industry conventions

### Ask Yourself
- Would another developer understand this name immediately?
- Does this name reveal its purpose at a glance?
- Is this consistent with similar code in the project?
- Would I be able to find this easily if searching?

---

## 16. Resources

- **Full Audit**: `docs/reference/SEMANTIC_NAMING_AUDIT.md`
- **Type System**: `types/centralized.ts`
- **AI Instructions**: `.github/copilot-instructions.md`
- **Style Guide**: Follow TypeScript + React best practices

---

*Remember: Naming is communication. Choose names that help your future self and your teammates.*

