# Utility Functions Documentation

This document outlines the organization and usage of utility functions in the Z-Beam website project.

## 📁 Organization

Utilities are organized into domain-specific modules for better maintainability:

### `/app/utils/`
- **`utils.ts`** - Main entry point that re-exports all utilities
- **`formatting.ts`** - Text and date formatting functions
- **`validation.ts`** - Form and data validation helpers
- **`helpers.ts`** - Common React and UI helper functions
- **`metadata.ts`** - MDX frontmatter and metadata parsing
- **`mdx.ts`** - MDX file reading and processing
- **`constants.ts`** - Application constants and configuration

## 🛠️ Available Functions

### Formatting (`formatting.ts`)

```typescript
// Date formatting
formatDate(date: string): string
formatRelativeDate(date: string): string

// Text formatting
slugify(str: string): string
truncateText(text: string, maxLength: number): string
capitalizeFirst(str: string): string
kebabToTitle(kebabStr: string): string
toSentenceCase(str: string): string
stripHtml(html: string): string

// Utility functions
isValidUrl(string: string): boolean
formatFileSize(bytes: number): string
```

### Validation (`validation.ts`)

```typescript
// Basic validation
isValidEmail(email: string): boolean
isRequired(value: string | null | undefined): boolean
hasMinLength(value: string, minLength: number): boolean
hasMaxLength(value: string, maxLength: number): boolean
isPositiveNumber(value: string | number): boolean
isInRange(value: number, min: number, max: number): boolean
isValidSlug(slug: string): boolean

// Advanced validation
validateField(value: any, rules: ValidationRule[]): ValidationResult
ValidationRules.required(fieldName: string): ValidationRule
ValidationRules.email(): ValidationRule
// ... and more rule creators
```

### Helpers (`helpers.ts`)

```typescript
// CSS and styling
cn(...classes): string  // Classname utility (like clsx)
getVariantClasses(variant, size): string  // Component variant styles

// React utilities
generateMaterialAltText(materialName, context): string
safeGet(obj, path, defaultValue): T
debounce(func, delay): Function
throttle(func, limit): Function
delay(ms: number): Promise<void>

// Browser utilities
isBrowser(): boolean
prefersReducedMotion(): boolean
generateId(prefix?: string): string
fileToBase64(file: File): Promise<string>
getContrastRatio(hex1: string, hex2: string): number
```

### MDX and Metadata (`mdx.ts`, `metadata.ts`)

```typescript
// MDX operations
getMaterialList(): Promise<MaterialPost[]>
getMDXFiles(dir: string): string[]
readMDXFile(filePath: string): Promise<string>
getMDXData(dir: string): Promise<MaterialPost[]>

// Metadata parsing
parseFrontmatter(content: string): { metadata: Metadata; content: string }
extractFirstImage(content: string): string | null
```

### Chart Utilities (`chart.ts`)

```typescript
// Color generation
generateChartColors(length?: number): string[]
generateChartBorderColors(length?: number): string[]

// Dataset creation  
createChartDataset(label: string, data: number[], length?: number)
createChartData(labels: string[], datasets: Array<{label: string, data: number[]}>)

// Pre-built chart types
createEffectivenessChart(customData?: number[])
createRiskComparisonChart(customData?: number[])
createContaminantImpactChart(labels: string[], data: number[], yAxisTitle?: string)

// Standard configurations
CHART_DEFAULTS.colors
CHART_DEFAULTS.options
CLEANING_COMPARISON_DATA
```

## 🎯 Usage Examples

### Using the `cn` helper for conditional classes:

```typescript
import { cn } from '../utils/helpers';

function Button({ variant, disabled, className }) {
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded",
        variant === 'primary' && "bg-blue-500 text-white",
        variant === 'secondary' && "bg-gray-200 text-gray-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    />
  );
}
```

### Using validation with forms:

```typescript
import { validateField, ValidationRules } from '../utils/validation';

const emailRules = [
  ValidationRules.required('Email'),
  ValidationRules.email()
];

const result = validateField(email, emailRules);
if (!result.isValid) {
  console.log(result.errors); // ["Email is required", "Please enter a valid email"]
}
```

### Using formatting utilities:

```typescript
import { formatDate, slugify, truncateText } from '../utils/formatting';

const slug = slugify("My Article Title!"); // "my-article-title"
const shortText = truncateText("Long description...", 50); // "Long description..."
const formattedDate = formatDate("2023-12-25"); // "December 25, 2023"
```

### Using chart utilities to eliminate code duplication:

```typescript
import { generateChartColors, createContaminantImpactChart } from '../utils/chart';

// Before: 120+ characters of duplicated color logic
// After: Clean, reusable functions

// Simple color generation
const colors = generateChartColors(4);

// Pre-built chart configuration
const chartConfig = createContaminantImpactChart(
  ["Tin Oxide", "Machining Oils", "Fingerprints", "Atmospheric Dust"],
  [80, 60, 40, 20],
  'Impact on Performance'
);

// Use in MDX
<ChartComponent chartId="example" chartType="bar" {...chartConfig} />
```

## 🔄 Migration from Old Utils

The old monolithic `utils.ts` has been refactored into organized modules. For backward compatibility, all functions are still available through the main `utils.ts` entry point:

```typescript
// Both work the same:
import { formatDate } from '../utils/formatting';  // Direct import
import { formatDate } from '../utils/utils';       // Main entry point
```

## 🎨 Component Integration

Components now use base interfaces from `/app/types/index.ts` and utility functions for consistent behavior:

```typescript
import { BaseImageProps, ComponentVariant } from '../types';
import { cn, getVariantClasses } from '../utils/helpers';

interface ButtonProps extends BaseInteractiveProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
}

function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(getVariantClasses(variant, size), className)}
      {...props}
    />
  );
}
```

## 📚 Best Practices

1. **Import from specific modules** when you only need a few functions
2. **Use the main entry point** for broader utility usage
3. **Leverage base interfaces** for consistent component props
4. **Use validation helpers** for form handling
5. **Apply `cn()` utility** for conditional class names
6. **Utilize helper functions** for common React patterns

This organization provides better tree-shaking, clearer dependencies, and improved maintainability while maintaining backward compatibility.
