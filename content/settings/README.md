# Settings Content Type

This directory contains YAML files for the **settings** content type, which provides research-backed machine settings and justifications for laser cleaning specific materials.

## 🏗️ Implementation Standards

**CRITICAL: All settings content must follow materials page implementation pattern**

### Author Implementation (Required)
Every settings YAML file MUST include complete author metadata with E-E-A-T signals:

```yaml
author:
  name: "Todd Dunning"
  jobTitle: "Laser Systems Engineer"  # Required for E-E-A-T
  description: "Industrial laser specialist with 15+ years experience"  # Required
  expertise:
    - "Laser cleaning process optimization"
    - "Material-specific parameter development"
  url: "https://z-beam.com/about"
  email: "todd@z-beam.com"
  image: "/images/authors/todd-dunning.jpg"
```

**Why Critical:**
- Google E-E-A-T ranking factor for YMYL content
- Establishes credibility for backlink authority
- Standardized across ALL content types (materials, settings, pages)
- Auto-rendered by Layout component
- Trust signal for equipment manufacturers and researchers

### Layout Integration
Settings pages use Layout component which automatically includes:
- **Nav**: Navigation bar
- **Title**: Page title with proper hierarchy
- **Footer**: Site footer
- **Breadcrumbs**: Navigation trail
- **DateMetadata**: Published/updated timestamps
- **Author**: E-E-A-T author component

All these are handled by Layout - **DO NOT manually implement**.

### Component Standards
- **SectionContainer**: Use for all major content sections
  - Provides consistent styling and spacing
  - Used throughout materials pages
  - Example: `<SectionContainer title="Essential Parameters">`
- **PropertyBars**: For displaying metrics and parameters
  - Matches materials page implementation
  - Used for machineSettings display
- **MarkdownRenderer**: For markdown content
  - Standard across all content types

### Content Structure Pattern
Follow materials page hierarchy:
1. Hero section (images, title, subtitle)
2. Main content (overview, description)
3. Sections with SectionContainer (parameters, challenges, etc.)
4. Related content (cross-links, comparisons)

## Purpose

The settings content type supplements material pages with in-depth technical guidance:
- **Essential Parameters**: Detailed laser settings with scientific rationale
- **Material-Specific Challenges**: Categorized issues and solutions
- **Research Citations**: DOI-linked academic sources
- **Troubleshooting Guides**: Diagnostic flowcharts
- **Quality Metrics**: Expected outcomes and verification

## File Naming Convention

Settings files follow the same naming as their corresponding material:

```
/frontmatter/settings/aluminum-laser-cleaning.yaml
/frontmatter/settings/stainless-steel-laser-cleaning.yaml
```

## URL Structure

Settings pages are accessed via:

```
/settings/[category]/[subcategory]/[slug]
```

Examples:
- `/settings/metal/ferrous/aluminum-laser-cleaning`
- `/settings/ceramic/oxide/alumina-laser-cleaning`

## Content Structure

Each settings YAML file contains:

### 1. Essential Parameters (9 core settings)
- **powerRange**: Laser power with optimal range, rationale, damage thresholds
- **wavelength**: Light wavelength with material interaction physics
- **spotSize**: Beam diameter with focus considerations
- **repetitionRate**: Pulse frequency with thermal management
- **energyDensity**: Fluence with ablation physics
- **pulseWidth**: Pulse duration with selectivity implications
- **scanSpeed**: Travel speed with coverage optimization
- **passCount**: Number of passes with removal efficiency
- **overlapRatio**: Beam overlap with uniformity requirements

Each parameter includes:
- `value`, `unit`, `min`, `max`: Basic specifications
- `optimal_range`: Recommended operating window
- `precision`: Required control accuracy
- `criticality`: Impact on outcome (critical/high/medium/low)
- `rationale`: Scientific justification
- `damage_threshold`: Too low/too high consequences
- `material_interaction`: Physics mechanisms
- `research_basis`: Citations with DOI links
- `validation`: Testing methodology

### 2. Material Challenges
Categorized by type:
- **surface_characteristics**: Roughness, coatings, oxidation
- **thermal_management**: Heat accumulation, melting risks
- **contamination_challenges**: Removal difficulty, redeposition
- **safety_compliance**: OSHA/NFPA requirements

### 3. Process Parameters
- Scan patterns and optimization
- Focus position strategies
- Environmental controls

### 4. Equipment Requirements
- Laser system specifications
- Cooling system requirements
- Fume extraction needs
- Safety equipment
- Metrology tools

### 5. Expected Outcomes
- Surface quality metrics
- Contamination removal rates
- Substrate integrity preservation
- Process efficiency benchmarks

### 6. Common Issues (Troubleshooting)
- Symptom identification
- Root cause analysis
- Solutions with verification
- Prevention strategies

### 7. Parameter Interactions
- Interdependency matrix
- Coupled effects
- Optimization strategies

### 8. SEO Settings Page Metadata
- Meta title/description for /settings page
- Keywords and schema markup

## Data Generation

Settings content is generated by an external Python research pipeline:

1. **Material Property Lookup**: Thermal/optical/mechanical properties
2. **Literature Search**: CrossRef, Semantic Scholar, PubMed APIs
3. **Challenge Identification**: Material-specific issues via LLM
4. **Parameter Calculation**: Physics-based models + empirical data
5. **Troubleshooting Generation**: Common scenarios and solutions
6. **YAML Generation**: Structured output with validation

See `/docs/features/PYTHON_GENERATOR_REQUIREMENTS.md` for full specification.

## Template

Use `_TEMPLATE_settings.yaml` as the starting point for new settings files. All fields include `[PLACEHOLDER]` annotations with guidance for the Python generator.

## Relationship to Materials

Settings content is **supplementary** to materials content:
- **Materials** (`/frontmatter/materials/`): Overview, applications, benefits, safety
- **Settings** (`/frontmatter/settings/`): Technical parameters, research, troubleshooting

Both reference the same material but serve different user needs:
- Materials: Discovery, understanding, use cases
- Settings: Implementation, optimization, problem-solving

## Integration with Next.js

The `/app/settings/[category]/[subcategory]/[slug]/page.tsx` route reads settings YAML files and renders:
- SettingsHero component
- ParameterTable component
- ChallengeCard components
- JustificationPanel components
- TroubleshootingFlow components
- ComparisonTable component

## Quality Assurance

All settings files undergo:
1. **Citation Validation**: DOI links functional, sources credible
2. **Parameter Sanity Checks**: No physical impossibilities
3. **Completeness Verification**: All required fields populated
4. **Research Quality Review**: Human expert validation
5. **SEO Optimization**: Metadata completeness

## Deployment

Settings are deployed alongside materials:
1. Python generator produces enhanced YAML files
2. Files placed in `/content/settings/`
3. Next.js builds static pages at `/settings/*`
4. Schema.org markup generated for each page
5. Sitemap includes all settings pages

Target: 132 materials × 1 settings page = 132 settings pages

## Success Metrics

Settings pages aim to achieve:
- **50+ referring domains** (DA 40+) within 6 months
- **Top 3 Google rankings** for "[material] laser cleaning parameters"
- **Industry authority**: #1 backlink destination for equipment manufacturers
- **User engagement**: 3+ minutes average time on page
- **PDF downloads**: 1,000+ per month across all materials

## See Also

- `/docs/features/MACHINE_SETTINGS_AUTHORITY_PAGE.md`: Strategic proposal
- `/docs/features/PYTHON_GENERATOR_REQUIREMENTS.md`: Data generation spec
- `/frontmatter/materials/`: Related material content
