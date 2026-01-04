# Frontend Required Frontmatter Fields

**Date**: January 4, 2026  
**Purpose**: Document all frontmatter fields required by the Next.js frontend components  
**Audience**: Backend/Python developers generating frontmatter YAML files

---

## 🚨 **CRITICAL: Naming Convention**

**ALL frontmatter fields MUST use camelCase** (JavaScript/TypeScript industry standard)

- ✅ `pageDescription` (CORRECT)
- ❌ `page_description` (WRONG - Python snake_case)
- ❌ `page-description` (WRONG - kebab-case)
- ❌ `PageDescription` (WRONG - PascalCase)

**Enforcement**: Run `node scripts/standardize-frontmatter-naming.js` to convert all fields

---

## 🚫 **FAIL-FAST POLICY**

**Components MUST fail immediately if required frontmatter fields are missing.**

```typescript
// ✅ CORRECT - Fail fast, no fallbacks
function Component({ frontmatter }) {
  if (!frontmatter.pageDescription) {
    throw new Error('pageDescription is required in frontmatter');
  }
  return <div>{frontmatter.pageDescription}</div>;
}

// ❌ WRONG - Silent fallback hides missing data
function Component({ frontmatter }) {
  const desc = frontmatter.pageDescription || frontmatter.description || 'Default text';
  return <div>{desc}</div>;
}
```

**Why Fail-Fast**:
1. **Catches errors early** in development, not production
2. **Forces backend fixes** instead of hiding problems
3. **Prevents data inconsistency** across components
4. **No silent degradation** - missing data is a bug, not a feature

---

## 🎯 **Critical Fields Overview**

The frontend expects **specific camelCase fields** in frontmatter YAML files. Missing or incorrectly named fields will cause:
- Component rendering failures
- Missing metadata in SEO
- Broken breadcrumb navigation
- Accessibility issues

---

## 📝 **Data Source Policy**

**CRITICAL**: All frontmatter fields come ONLY from:
1. **Backend generation** (Python scripts in `yaml-processor/`)
2. **Manual editing** (direct YAML file edits)

**FORBIDDEN**:
- ❌ AI-generated content (no GPT/Claude/LLM generating pageDescription)
- ❌ Component-level fallbacks (no `|| 'default'` logic)
- ❌ Runtime data synthesis (no building data on-the-fly)
- ❌ Silent degradation (no hiding missing fields)

**Fields like `pageDescription`, `metaDescription`, `title` MUST:**
- Exist in frontmatter YAML files before page render
- Be written by backend scripts OR humans
- Never be generated, inferred, or defaulted by frontend
- Cause immediate error if missing (fail-fast)

---

## 📋 **Required Fields by Component**

### 1. **Core Identification** (All Files)

```yaml
id: aluminum-settings                    # REQUIRED: Unique identifier
slug: aluminum-settings                  # REQUIRED: URL slug
contentType: setting                     # REQUIRED: Type (material, setting, contaminant, compound)
schemaVersion: 5.0.0                     # REQUIRED: Schema version
```

### 2. **Metadata Fields** (All Files)

```yaml
# Dates (ISO 8601 format)
datePublished: '2026-01-04T23:22:12.273852Z'  # REQUIRED
dateModified: '2026-01-04T23:22:12.273852Z'   # REQUIRED
lastModified: '2026-01-04T15:22:12.273883'    # REQUIRED

# Titles and Descriptions
title: Aluminum                                # REQUIRED: Display title
pageTitle: Aluminum Settings                   # REQUIRED: Browser tab title (can match title)

# ⚠️ CRITICAL: Two DIFFERENT description fields are required
pageDescription: Aluminum Settings laser cleaning...   # REQUIRED: PageTitle component subtitle
metaDescription: Aluminum Settings laser cleaning...  # REQUIRED: <meta name="description"> (120-155 chars)

# URL Path
fullPath: /settings/metal/non-ferrous/aluminum-settings  # REQUIRED: Full URL path
```

### 3. **Breadcrumbs Navigation** (All Files)

```yaml
breadcrumbs:                             # REQUIRED: Array of breadcrumb items
  - label: Home                          # REQUIRED: Breadcrumb text
    href: /                              # REQUIRED: Link URL
  - label: Settings                      
    href: /settings
  - label: Aluminum                      # Last item
    href: ''                             # Empty string for current page
```

**Frontend Component**: `app/components/Navigation/breadcrumbs.tsx`  
**Fallback**: Generates from URL if missing, but explicit is preferred

### 4. **Author Information** (All Content Files)

```yaml
author:
  id: 4                                  # REQUIRED: Author ID
  name: Todd Dunning                     # REQUIRED: Full name
  country: United States                 # REQUIRED: Country
  country_display: United States         # REQUIRED: Display name
  title: MA                              # REQUIRED: Degree/title
  sex: m                                 # REQUIRED: Gender (m/f)
  jobTitle: Junior Optical Materials Specialist  # REQUIRED
  expertise:                             # REQUIRED: Array of expertise areas
    - Optical Materials for Laser Systems
  affiliation:
    name: Coherent Inc.                  # REQUIRED: Organization
    type: Organization                   # REQUIRED: Type
  credentials:                           # REQUIRED: Array of credentials
    - BA Physics, UC Irvine, 2017
    - MA Optics and Photonics, UC Irvine, 2019
  email: info@z-beam.com                 # REQUIRED
  image: /images/author/todd-dunning.jpg # REQUIRED: Author photo
  imageAlt: Todd Dunning, MA, Junior...  # REQUIRED: Image alt text
  url: https://z-beam.com/authors/todd-dunning  # REQUIRED: Author page
  sameAs:                                # OPTIONAL: Social profiles
    - https://linkedin.com/in/...
  bio: Todd Dunning holds a MA degree... # REQUIRED: Short bio
  slug: todd-dunning                     # REQUIRED: URL slug
```

### 5. **Images** (All Content Files)

```yaml
images:
  hero:
    url: /images/settings/aluminum-settings-hero.jpg    # REQUIRED
    alt: Aluminum laser cleaning visualization...        # REQUIRED (WCAG)
    width: 1200                                          # REQUIRED
    height: 630                                          # REQUIRED
  micro:
    url: /images/settings/aluminum-settings-micro.jpg   # REQUIRED
    alt: Aluminum microscopic detail view...            # REQUIRED (WCAG)
    width: 800                                           # REQUIRED
    height: 600                                          # REQUIRED
```

### 6. **Card Display** (Settings Files)

```yaml
card:
  default:
    heading: Laser Cleaning Settings           # REQUIRED: Card title
    subtitle: Machine Settings                 # REQUIRED: Card subtitle
    badge:
      text: Optimized                          # REQUIRED: Badge text
      variant: success                         # REQUIRED: Badge color
    metric:
      value: 100-300                           # REQUIRED: Metric value
      unit: W                                  # REQUIRED: Unit
      legend: Power Range                      # REQUIRED: Metric label
    severity: low                              # REQUIRED: Severity level
    icon: settings                             # REQUIRED: Icon name
```

### 7. **Component Summaries** (Settings Files)

```yaml
component_summaries:
  technical_specs:
    section_title: Technical Specifications    # REQUIRED
    description: Comprehensive specs...        # REQUIRED
  usage_tips:
    section_title: Usage Tips                  # REQUIRED
    description: Practical guidance...         # REQUIRED
  parameter_relationships:
    section_title: Parameter Relationships     # REQUIRED
    description: Parameter interactions...     # REQUIRED

component_summary: The 1064 nm wavelength...   # REQUIRED: Short summary
```

### 8. **Relationships** (All Content Files)

```yaml
relationships:
  safety:
    regulatory_standards:
      presentation: card                       # REQUIRED: Display type
      items:                                   # REQUIRED: Array of items
        - type: regulatory_standards
          id: osha-ppe-requirements
        - type: regulatory_standards
          id: ansi-z136-1-laser-safety
      _section:
        title: Regulatory Standards            # REQUIRED
        description: Safety and compliance...  # REQUIRED
        icon: shield-check                     # REQUIRED
        order: 1                               # REQUIRED
        variant: default                       # REQUIRED
  interactions:
    removes_contaminants:
      presentation: card
      items:
        - id: rust-oxidation-contamination
          effectiveness: high                  # REQUIRED: Effectiveness level
        - id: adhesive-residue-contamination
          effectiveness: medium
      _section:
        title: Removes Contaminants            # REQUIRED
        description: Types of contamination... # REQUIRED
        icon: droplet-off                      # REQUIRED
        order: 1                               # REQUIRED
        variant: default                       # REQUIRED
```

---

## ⚠️ **Common Mistakes to Avoid**

### ❌ **Mistake 1: Using snake_case Instead of camelCase**

```yaml
# ❌ WRONG (backend Python naming)
page_title: Aluminum Settings
meta_description: Aluminum Settings laser...
full_path: /settings/metal/non-ferrous/aluminum-settings
content_type: setting

# ✅ CORRECT (frontend JavaScript naming)
pageTitle: Aluminum Settings
metaDescription: Aluminum Settings laser...
fullPath: /settings/metal/non-ferrous/aluminum-settings
contentType: setting
```

### ❌ **Mistake 2: Confusing pageDescription and metaDescription**

These are **TWO DIFFERENT FIELDS** with **DIFFERENT PURPOSES**:

```yaml
# pageDescription: Used by PageTitle component as subtitle below H1
# - Source: Backend generation or manual editing (NOT AI-generated)
# - Length: 150-200 characters (more descriptive)
# - Displayed: Visually on page below title
# - Purpose: Engage users with context
pageDescription: Aluminum Settings laser cleaning parameters for contamination removal. Industrial-grade settings preserve substrate integrity. Optimized for precision applications.

# metaDescription: Used in <meta name="description"> tag
# - Source: Backend generation or manual editing (NOT AI-generated)
# - Length: 120-155 characters (SEO optimal)
# - Displayed: Hidden (only in HTML head for search engines)
# - Purpose: Search result snippet
metaDescription: Aluminum Settings laser cleaning parameters for contamination removal. Industrial-grade settings preserve substrate integrity.
```

**Component Usage**:
- `pageDescription` → `app/components/Title/PageTitle.tsx` (line 25)
- `metaDescription` → `app/metadata.ts` (SEO metadata generation)

**⚠️ IMPORTANT**: Both fields come from frontmatter YAML files, NOT from AI content generation

### ❌ **Mistake 3: Missing Required Fields**

```yaml
# ❌ WRONG: Missing pageDescription
title: Aluminum
metaDescription: Aluminum Settings...
# Result: PageTitle component shows no subtitle

# ✅ CORRECT: Both fields present
title: Aluminum
pageDescription: Aluminum Settings laser cleaning parameters...
metaDescription: Aluminum Settings laser cleaning parameters...
```

### ❌ **Mistake 4: Incorrect Breadcrumb Structure**

```yaml
# ❌ WRONG: Missing href or incorrect structure
breadcrumbs:
  - label: Home
  - label: Settings
  - label: Aluminum

# ✅ CORRECT: All items have href
breadcrumbs:
  - label: Home
    href: /
  - label: Settings
    href: /settings
  - label: Aluminum
    href: ''                    # Empty for current page
```

---

## 🔍 **Field Validation Checklist**

Before regenerating frontmatter, verify:

- [ ] All field names are **camelCase** (not snake_case)
- [ ] Both `pageDescription` AND `metaDescription` exist
- [ ] `metaDescription` is 120-155 characters
- [ ] `pageDescription` is 150-200 characters (can be longer)
- [ ] `breadcrumbs` array has `label` and `href` for each item
- [ ] `datePublished` and `dateModified` are ISO 8601 format
- [ ] `fullPath` starts with `/` and matches actual URL
- [ ] `contentType` is one of: `material`, `setting`, `contaminant`, `compound`
- [ ] `author` object has all required nested fields
- [ ] `images.hero` and `images.micro` have `url`, `alt`, `width`, `height`

---

## 📊 **Field Priority Matrix**

| Field | Required | Component Impact | SEO Impact |
|-------|----------|------------------|------------|
| `pageDescription` | ✅ Yes | PageTitle subtitle | None |
| `metaDescription` | ✅ Yes | None | Critical |
| `pageTitle` | ✅ Yes | Browser tab | High |
| `title` | ✅ Yes | H1 heading | High |
| `breadcrumbs` | ✅ Yes | Navigation | Medium |
| `fullPath` | ✅ Yes | Canonical URL | Critical |
| `contentType` | ✅ Yes | Schema.org | High |
| `author` | ✅ Yes | Author byline | Medium |
| `images` | ✅ Yes | Visual content | Medium |

---

## 🔄 **Migration Path from snake_case**

If you have existing files with snake_case fields:

### Step 1: Add camelCase equivalents (keep both temporarily)

```yaml
# Keep old for compatibility
page_title: Aluminum Settings
meta_description: Aluminum Settings...
full_path: /settings/metal/non-ferrous/aluminum-settings

# Add new camelCase
pageTitle: Aluminum Settings
metaDescription: Aluminum Settings...
fullPath: /settings/metal/non-ferrous/aluminum-settings
```

### Step 2: Test frontend rendering

```bash
npm run dev
# Visit pages and verify all components render correctly
```

### Step 3: Remove snake_case fields

Once verified, remove the old fields:

```yaml
# Only camelCase remains
pageTitle: Aluminum Settings
metaDescription: Aluminum Settings...
fullPath: /settings/metal/non-ferrous/aluminum-settings
```

---

## 🚀 **Quick Reference for Backend Developers**

When generating frontmatter YAML:

1. **Use camelCase** for all multi-word fields
2. **Include both** `pageDescription` (page subtitle) and `metaDescription` (SEO)
3. **Generate breadcrumbs** from URL path structure
4. **Validate dates** are ISO 8601 format with timezone
5. **Check lengths**: `metaDescription` 120-155 chars, `pageDescription` 150-200 chars
6. **Include author** object with all nested fields
7. **Provide images** with proper alt text (WCAG requirement)

---

## 📚 **Related Documentation**

- `docs/NAMING_STANDARDS_VERIFICATION_JAN4_2026.md` - Naming convention standards
- `docs/FRONTEND_NORMALIZATION_COMPLETE_JAN4_2026.md` - Frontend normalization work
- `docs/BACKEND_REGENERATION_EVALUATION_JAN4_2026.md` - Backend evaluation results
- `schemas/frontmatter-v5.0.0.json` - Complete JSON schema validation

---

## ✅ **Example Complete Frontmatter File**

```yaml
id: aluminum-settings
datePublished: '2026-01-04T23:22:12.273852Z'
dateModified: '2026-01-04T23:22:12.273852Z'
images:
  hero:
    url: /images/settings/aluminum-settings-hero.jpg
    alt: Aluminum laser cleaning visualization showing process effects
    width: 1200
    height: 630
  micro:
    url: /images/settings/aluminum-settings-micro.jpg
    alt: Aluminum microscopic detail view showing surface characteristics
    width: 800
    height: 600
author:
  id: 4
  name: Todd Dunning
  country: United States
  country_display: United States
  title: MA
  sex: m
  jobTitle: Junior Optical Materials Specialist
  expertise:
    - Optical Materials for Laser Systems
  affiliation:
    name: Coherent Inc.
    type: Organization
  credentials:
    - BA Physics, UC Irvine, 2017
    - MA Optics and Photonics, UC Irvine, 2019
  email: info@z-beam.com
  image: /images/author/todd-dunning.jpg
  imageAlt: Todd Dunning, MA, Junior Optical Materials Specialist
  url: https://z-beam.com/authors/todd-dunning
  sameAs:
    - https://linkedin.com/in/todd-dunning-optics
  bio: Todd Dunning holds a MA degree with expertise in Optical Materials
  slug: todd-dunning
card:
  default:
    heading: Laser Cleaning Settings
    subtitle: Machine Settings
    badge:
      text: Optimized
      variant: success
    metric:
      value: 100-300
      unit: W
      legend: Power Range
    severity: low
    icon: settings
relationships:
  safety:
    regulatory_standards:
      presentation: card
      items:
        - type: regulatory_standards
          id: osha-ppe-requirements
      _section:
        title: Regulatory Standards
        description: Safety and compliance standards
        icon: shield-check
        order: 1
        variant: default
component_summaries:
  technical_specs:
    section_title: Technical Specifications
    description: Comprehensive technical specifications...
component_summary: The 1064 nm wavelength and 10 ns pulse width...
schemaVersion: 5.0.0
contentType: setting
pageTitle: Aluminum Settings
pageDescription: Aluminum Settings laser cleaning parameters for contamination removal. Industrial-grade settings preserve substrate integrity. Optimized for precision applications.
metaDescription: Aluminum Settings laser cleaning parameters for contamination removal. Industrial-grade settings preserve substrate integrity.
fullPath: /settings/metal/non-ferrous/aluminum-settings
slug: aluminum-settings
lastModified: '2026-01-04T15:22:12.273883'
breadcrumbs:
  - label: Home
    href: /
  - label: Settings
    href: /settings
  - label: Aluminum
    href: ''
title: Aluminum
```

---

**Grade**: A+ (Complete specification for backend developers)
