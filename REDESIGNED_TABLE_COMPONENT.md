# Redesigned Table Component - Frontmatter Focus

## Overview
The Table component has been completely redesigned to work specifically with frontmatter data instead of complex YAML table structures. This makes it much more suitable for displaying structured metadata from article frontmatter.

## Key Features

### ✅ Frontmatter Data Support
- **Simple Fields**: name, category, subcategory, title, description, author_id
- **Array Fields**: applications, regulatoryStandards, environmentalImpact, applicationTypes, outcomeMetrics
- **Object Fields**: author_object (displays author name and details)
- **Smart Formatting**: Automatically formats different data types (strings, numbers, arrays, objects)

### ✅ Configuration Options
- `includedFields`: Array of specific fields to include
- `excludedFields`: Array of fields to exclude
- `tableType`: 'auto', 'frontmatter', or 'legacy'
- `variant`: 'default', 'sectioned', or 'compact'

### ✅ Display Modes
- **Default**: Shows Property, Value, and Description columns
- **Compact**: Shows only Property and Value columns
- **Responsive**: Mobile-friendly with overflow handling

### ✅ Data Handling
- **Smart Value Formatting**: Handles null/undefined, booleans, numbers, arrays, and nested objects
- **Array Summarization**: Shows count for arrays (e.g., "4 applications", "3 standards")
- **Object Summarization**: Shows property count for complex objects
- **Legacy Fallback**: Still supports existing YAML table content

## What It Can Handle from Frontmatter

### ✅ Simple Values:
```yaml
name: Copper
category: Metal
title: Copper Laser Cleaning
author_id: 4
```

### ✅ Arrays:
```yaml
applications:
  - 'Electronics: Precision cleaning'
  - 'Aerospace: Component cleaning'
regulatoryStandards:
  - FDA 21 CFR 1040.10
  - ANSI Z136.1
```

### ✅ Simple Objects:
```yaml
author_object:
  id: 4
  name: Todd Dunning
  country: United States
```

### ❌ Complex Nested Objects (Not Recommended):
```yaml
materialProperties:  # Too complex for this component
  density:
    value: 8.96
    unit: g/cm³
    confidence: 99
```

## Usage Examples

### Basic Usage:
```tsx
<Table 
  content={content} 
  config={{
    variant: 'default',
    caption: 'Material Information'
  }}
  frontmatterData={frontmatter}
/>
```

### Filtered Fields:
```tsx
<Table 
  frontmatterData={frontmatter}
  config={{
    includedFields: ['name', 'category', 'applications'],
    variant: 'compact',
    caption: 'Key Information'
  }}
/>
```

### Excluded Fields:
```tsx
<Table 
  frontmatterData={frontmatter}
  config={{
    excludedFields: ['author_id', 'description'],
    variant: 'default'
  }}
/>
```

## Benefits

1. **Simplified Data Structure**: No need for complex YAML table definitions
2. **Type Safety**: Proper TypeScript integration with frontmatter types
3. **Flexible Configuration**: Control which fields to show/hide
4. **Responsive Design**: Mobile-friendly table layout
5. **Legacy Compatible**: Still works with existing YAML table files as fallback
6. **Smart Formatting**: Automatic handling of different data types

## Recommended Use Cases

- **Material Overview Tables**: Basic material properties and metadata
- **Article Summary Tables**: Key article information and metrics
- **Author Information**: Display author details and credentials
- **Application Listings**: Show supported applications and standards
- **Metric Summaries**: Display counts and basic statistics

For complex material properties and machine settings, use dedicated components like DataMetrics or MetricsCard instead.