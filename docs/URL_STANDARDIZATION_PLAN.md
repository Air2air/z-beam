# URL Standardization Plan - z-beam.com

## Standardized URL Structure

### **Analysis Pages** (Scientific/Technical Content)
- **Pattern**: `z-beam.com/analysis/{material-name}`
- **Purpose**: Detailed scientific analysis with microscopic images, technical data
- **Files**: Caption YAML files in `content/components/caption/`
- **Examples**:
  - `z-beam.com/analysis/oak-laser-cleaning`
  - `z-beam.com/analysis/aluminum-laser-cleaning`
  - `z-beam.com/analysis/stainless-steel-laser-cleaning`

### **Materials Pages** (General Information)
- **Pattern**: `z-beam.com/{material-name}`
- **Purpose**: General material information, processing guides
- **Files**: Metatag MD files in `content/components/metatags/`
- **Examples**:
  - `z-beam.com/oak-laser-cleaning`
  - `z-beam.com/aluminum-laser-cleaning`
  - `z-beam.com/stainless-steel-laser-cleaning`

## Implementation Requirements

### 1. **URL Formatting Rules**
- All material names use kebab-case (hyphens, no spaces)
- Multi-word materials: `stainless-steel`, `fused-silica`, `lead-crystal`
- Complex composites: `carbon-fiber-reinforced-polymer`, `glass-fiber-reinforced-polymers-gfrp`

### 2. **File Type Mapping**
```
Caption Files (YAML) → /analysis/{material}
Metatag Files (MD)   → /{material}
```

### 3. **Navigation Structure**
```
/materials/           # Materials overview page
├── /oak             # Material processing guide
├── /aluminum        # Material processing guide
└── /stainless-steel # Material processing guide

/analysis/           # Analysis overview page  
├── /oak             # Scientific analysis
├── /aluminum        # Scientific analysis
└── /stainless-steel # Scientific analysis
```

## Benefits of Standardization
1. **Clear Content Separation**: Analysis vs General Material Info
2. **SEO Optimization**: Logical URL hierarchy
3. **User Experience**: Predictable navigation patterns
4. **Technical Benefits**: Easier routing and content management

## Implementation Priority
1. **HIGH**: Fix URLs with spaces (breaks functionality)
2. **MEDIUM**: Ensure consistent /analysis/ prefix for caption files
3. **LOW**: Update generators and documentation
