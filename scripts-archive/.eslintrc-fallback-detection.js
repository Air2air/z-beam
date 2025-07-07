// .eslintrc-fallback-detection.js
// ESLint configuration to detect and prevent fallback patterns and component duplication
// GLOBAL ENFORCEMENT: Zero tolerance for component duplication across the entire application

module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Detect potential fallback patterns
    'no-implicit-coercion': 'error',
    
    // Custom rules to detect common fallback patterns
    // Note: These would need custom ESLint plugins to implement fully
    
    // Detect || fallbacks in specific contexts
    'prefer-explicit-configuration': {
      // Would detect patterns like:
      // const value = config.property || 'default'
      // const color = config.color?.bg || 'bg-gray-500'
    },
    
    // Detect optional chaining with defaults
    'no-optional-chaining-fallbacks': {
      // Would detect patterns like:
      // config.color?.bg ?? 'default-color'
    },
    
    // Require explicit error handling
    'require-explicit-error-handling': {
      // Would enforce that missing configs throw errors instead of using defaults
    },
    
    // GLOBAL COMPONENT REUSABILITY ENFORCEMENT
    'no-hardcoded-styles': {
      // Would detect patterns like:
      // className="px-2 py-1 rounded-full bg-blue-100 text-blue-800"
      // When similar patterns exist elsewhere
    },
    
    'prefer-component-reuse': {
      // Would warn when creating new components similar to existing ones
      // Should check for duplicate className patterns, similar JSX structure
    },
    
    'no-duplicate-implementations': {
      // Would detect when the same UI pattern is implemented multiple times
      // Examples: buttons, cards, form inputs, badges, etc.
    },
    
    'require-component-audit': {
      // Would require documentation that component audit was performed
      // before creating new components
    }
  },
  
  // Example of what to look for in code review:
  overrides: [
    {
      files: ['app/utils/tagConfig.ts', 'app/components/SmartTagList.tsx'],
      rules: {
        // Extra strict rules for tag-related files
        'no-console': ['error', { allow: ['error'] }], // Only allow console.error, not console.warn
      }
    }
  ]
};

/* 
COMMON FALLBACK PATTERNS TO AVOID:

❌ BAD - Fallback patterns:
const displayName = config.displayName || tag;
const bgColor = config.color?.bg || 'bg-gray-500';
const priority = config.priority ?? 10;
const category = config.category || 'general';

✅ GOOD - Explicit error handling:
if (!config.displayName) {
  throw new Error('displayName is required');
}
const displayName = config.displayName;

if (!config.color?.bg) {
  throw new Error('color.bg is required');
}
const bgColor = config.color.bg;

// Or with TypeScript strict types:
interface RequiredTagConfig {
  displayName: string; // Required, no ?
  color: {
    bg: string;        // Required, no ?
    text: string;      // Required, no ?
  };
}

GLOBAL COMPONENT DUPLICATION PATTERNS TO AVOID:

❌ BAD - Any UI pattern implemented more than once:

// BADGES/TAGS/LABELS (Found in multiple components):
// AuthorSearchResults.tsx:
<span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
// AuthorSearch.tsx:  
<span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
// TagList.tsx:
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">

// BUTTONS (Scattered across components):
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
<Link className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg">

// CARDS (Multiple implementations):
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
<article className="bg-white border border-gray-200 rounded-lg p-4">

// FORM INPUTS (Duplicate styling):
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2">
<textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none">

✅ GOOD - Single implementation with variants:

// ONE Badge component handles all badge/tag/label needs:
<Badge variant="tag" color="blue" size="sm">{tag}</Badge>
<Badge variant="specialty" color="blue" size="md">{specialty}</Badge>
<Badge variant="skill" color="blue" size="xs">{skill}</Badge>

// ONE Button component handles all button needs:
<Button variant="primary" size="md">Primary Action</Button>
<Button variant="secondary" size="sm">Secondary</Button>
<Button variant="link" size="lg">Link Style</Button>

// ONE Card component handles all card needs:
<Card variant="feature" hover={true}>{content}</Card>
<Card variant="article" shadow="md">{content}</Card>
<Card variant="author" border={true}>{content}</Card>

// ONE Input component handles all input needs:
<Input variant="text" size="md" validation={true} />
<Input variant="textarea" size="lg" rows={4} />
<Input variant="select" options={options} />

GLOBAL AUDIT COMMANDS (Run these before ANY development):

# Find ALL component duplication patterns:
grep -r "className.*bg-.*text-" app/ | head -30
grep -r "px-.*py-.*rounded" app/ | head -30  
grep -r "hover:.*transition" app/ | head -30
grep -r "border.*shadow" app/ | head -30
grep -r "flex.*items-center" app/ | head -30

# Find specific UI pattern duplications:
grep -r "inline-block.*px-.*py-" app/  # Badge-like patterns
grep -r "bg-white.*rounded.*shadow" app/  # Card-like patterns  
grep -r "px-4.*py-2.*bg-blue" app/  # Button-like patterns
grep -r "w-full.*border.*rounded" app/  # Input-like patterns
grep -r "text-.*font-.*leading" app/  # Typography patterns

# Find logic duplication:
grep -r "map.*\(.*\) =>" app/ | head -20  # List rendering patterns
grep -r "useState.*\[.*," app/ | head -20  # State management patterns
grep -r "useEffect.*\[\]" app/ | head -20  # Effect patterns

# Find event handler duplication:
grep -r "onClick.*\(.*\) =>" app/ | head -20
grep -r "onSubmit.*\(.*\) =>" app/ | head -20
grep -r "onChange.*\(.*\) =>" app/ | head -20

ENFORCEMENT CHECKLIST:
□ No className patterns appear more than once
□ No similar JSX structures in multiple files
□ No duplicate event handling logic
□ No repeated styling patterns
□ All similar UI elements use the same component
□ Component variants handle different use cases
□ Props API is consistent across similar components
□ Documentation exists for component reuse guidelines
*/
