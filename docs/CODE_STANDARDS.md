# Code Standards & Best Practices

**Last Updated**: October 30, 2025

This document outlines the enforced code standards for the Z-Beam project.

---

## 🎯 Import Path Standards

### ESLint Enforcement

Import paths are **strictly enforced** by ESLint. The following rules will cause build failures:

### ✅ Correct Usage

```typescript
// Always use @/ path aliases for app/ and types/
import { Component } from '@/app/components/Component';
import { Layout } from '@/app/components/Layout/Layout';
import { getArticle } from '@/app/utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { ENV, isProduction } from '@/app/config/env';
```

### ❌ Incorrect Usage (Will Fail)

```typescript
// ❌ Relative imports for app/ directory
import { Component } from '../../app/components/Component';
import { Layout } from '../../../app/components/Layout/Layout';

// ❌ Relative imports for types/
import { ArticleMetadata } from '../../types';
```

### Configuration

ESLint rule in `.eslintrc.json`:
```json
{
  "no-restricted-imports": ["error", {
    "patterns": [{
      "group": ["../**/app/**", "../../app/**", "../../../app/**"],
      "message": "Use @/ path aliases instead of relative imports for app directory"
    }, {
      "group": ["../**/types/**", "../../types/**"],
      "message": "Use @/types instead of relative imports for types"
    }]
  }]
}
```

---

## 🔐 Environment Variables

### Centralized Configuration

All environment variables are managed through `app/config/env.ts`:

### ✅ Correct Usage

```typescript
import { ENV, isProduction, isDevelopment } from '@/app/config/env';

// Access environment variables
const baseUrl = ENV.BASE_URL;
const gaTag = ENV.GA_MEASUREMENT_ID;

// Environment checks
if (isProduction()) {
  console.log('Running in production');
}

// Server-side only variables
if (ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD) {
  // Configure email
}
```

### ❌ Discouraged Usage

```typescript
// Not enforced, but discouraged - use ENV config instead
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const nodeEnv = process.env.NODE_ENV;
```

### Available Environment Variables

```typescript
ENV.NODE_ENV              // 'development' | 'production' | 'test'
ENV.BASE_URL              // 'https://www.z-beam.com'
ENV.GA_MEASUREMENT_ID     // Google Analytics tag
ENV.GMAIL_USER            // Email user (server-side)
ENV.GMAIL_APP_PASSWORD    // Email password (server-side)
ENV.PORT                  // Optional port number
ENV.LOG_LEVEL             // Optional log level
ENV.NEXT_PUBLIC_VERSION   // Build version
```

### Helper Functions

```typescript
isProduction()   // Returns true in production
isDevelopment()  // Returns true in development
isTest()         // Returns true in test environment
getEnvironment() // Returns current environment name
```

---

## 📘 TypeScript Standards

### Strict Mode Configuration

Current `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "strict": false,              // Being migrated incrementally
    "strictNullChecks": true,     // ✅ Enabled
    "noImplicitAny": true,        // ✅ Enabled
    "strictFunctionTypes": true,  // ✅ Enabled
  }
}
```

### Type Safety Requirements

**All new code must:**
- Explicitly type function parameters
- Avoid `any` types (enforced by ESLint)
- Use type annotations for variables when types can't be inferred
- Handle null/undefined cases explicitly

### ✅ Correct Usage

```typescript
// Explicit parameter types
function processArticle(article: ArticleMetadata): string {
  return article.title;
}

// Explicit variable types when needed
const results: SearchResultItem[] = [];

// Type-safe object access
interface FormErrors {
  name?: string;
  email?: string;
}
if (errors[fieldName as keyof FormErrors]) {
  // Handle error
}

// Type-safe variant lookups
type SizeVariant = 'small' | 'medium' | 'large';
const variant = value in sizeConfig ? (value as SizeVariant) : 'medium';
```

### ❌ Incorrect Usage

```typescript
// ❌ Implicit any (will fail TypeScript)
function processArticle(article) {
  return article.title;
}

// ❌ Untyped arrays
const results = [];

// ❌ Unsafe property access
if (errors[fieldName]) {  // fieldName is string, errors is typed object
  // Error: string can't index typed object
}
```

---

## ⚡ ESLint Rules

### Error-Level Rules (Build Failures)

These rules are set to `"error"` and will fail CI/CD:

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "prefer-const": "error",
  "no-restricted-imports": "error"
}
```

### Rule Explanations

**`@typescript-eslint/no-explicit-any`**
- Prevents use of `any` type
- Forces explicit type declarations
- Use `unknown` for truly unknown types, then narrow with type guards

**`@typescript-eslint/no-unused-vars`**
- No unused variables or imports
- Keeps codebase clean
- Helps identify dead code

**`prefer-const`**
- Use `const` for variables that aren't reassigned
- Prevents accidental mutations
- Makes intent clearer

**`no-restricted-imports`**
- Enforces `@/` path aliases
- Prevents relative imports for app/ and types/
- Ensures consistent import patterns

### Running ESLint

```bash
npm run lint           # Check for violations
npm run lint:fix       # Auto-fix what's possible
```

---

## 📁 Script Organization

### Directory Structure

Scripts are organized by purpose:

```
scripts/
├── deployment/           # Deployment scripts
│   ├── smart-deploy.sh  # Main deployment script
│   └── deploy-prod.sh   # Direct production deploy
└── validation/          # Validation scripts
    └── validate-jsonld-cleanup.js
```

### Using Scripts

**Via NPM Scripts** (Recommended):
```bash
npm run deploy          # Uses scripts/deployment/smart-deploy.sh
npm run deploy:monitor  # Deploy and monitor
```

**Direct Execution**:
```bash
./scripts/deployment/smart-deploy.sh deploy
./scripts/validation/validate-jsonld-cleanup.js
```

---

## 🧪 Test Standards

### Import Standardization

All test files use `@/` path aliases:

```typescript
// ✅ Correct test imports
import { Card } from '@/app/components/Card/Card';
import { SITE_CONFIG } from '@/app/utils/constants';
import { ArticleMetadata } from '@/types';

// ❌ Old style (updated in all tests)
import { Card } from '../../app/components/Card/Card';
```

### Test Organization

```
tests/
├── accessibility/        # Accessibility tests
├── app/                 # Application tests
├── components/          # Component tests
├── integration/         # Integration tests
├── pages/               # Page tests
├── standards/           # Standards compliance
├── types/               # Type tests
└── utils/               # Utility tests
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:components  # Component tests only
```

---

## 🚀 Migration Guide

### For Existing Code

If you encounter ESLint errors in existing code:

1. **Fix imports automatically** (where possible):
   ```bash
   npm run lint:fix
   ```

2. **Manual fixes** for remaining issues:
   - Replace `../../app/` with `@/app/`
   - Replace `../../types` with `@/types`
   - Add explicit types where `noImplicitAny` fails
   - Remove `any` types, use specific types or `unknown`

### For New Code

Always follow these standards from the start:
- ✅ Use `@/` imports for app/ and types/
- ✅ Import ENV from `@/app/config/env`
- ✅ Explicitly type all function parameters
- ✅ Avoid `any` types
- ✅ Use `const` for non-reassigned variables

---

## 📊 Compliance Verification

### Pre-Commit Checks

The following checks run automatically:
- ESLint validation
- TypeScript type checking
- Test suite (fast tests only)

### CI/CD Checks

The following checks run on every push:
- Full ESLint validation
- Complete TypeScript compilation
- Full test suite
- Build verification

### Manual Verification

```bash
# Check everything
npm run validate

# Individual checks
npm run lint
npm run type-check
npm test
npm run build
```

---

## 🔄 Future Improvements

### Planned Enhancements

1. **Full TypeScript Strict Mode**
   - Currently: 3/7 strict flags enabled
   - Goal: Enable all strict flags
   - Timeline: Incremental migration

2. **Import Sorting**
   - Auto-sort imports by category
   - Alphabetize within groups
   - Enforce via ESLint plugin

3. **Component Organization**
   - Group related components
   - Standardize component structure
   - Enforce naming conventions

---

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules Reference](https://eslint.org/docs/latest/rules/)
- [Next.js Path Aliases](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases)
- [STANDARDIZATION_SUMMARY.md](../STANDARDIZATION_SUMMARY.md) - Full implementation details

---

**Questions?** Check the main [README.md](../README.md) or [STANDARDIZATION_SUMMARY.md](../STANDARDIZATION_SUMMARY.md)
