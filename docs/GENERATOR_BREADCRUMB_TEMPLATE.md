# Breadcrumb Template for Python Generator

## Purpose
Template and logic for Python article generator to include explicit breadcrumb navigation in generated YAML frontmatter.

## Python Template Function

```python
def generate_breadcrumbs(name: str, category: str, subcategory: str, slug: str) -> list[dict]:
    """
    Generate breadcrumb navigation for material articles.
    
    Args:
        name: Material name (e.g., "Aluminum 6061")
        category: Material category (e.g., "Metals")
        subcategory: Material subcategory (e.g., "Non-Ferrous")
        slug: URL slug (e.g., "aluminum-6061")
    
    Returns:
        List of breadcrumb items with label and href
    """
    # Slugify helper
    def to_slug(text: str) -> str:
        return text.lower().replace(' ', '-').replace('_', '-')
    
    category_slug = to_slug(category)
    subcategory_slug = to_slug(subcategory)
    
    breadcrumbs = [
        {
            "label": "Home",
            "href": "/"
        },
        {
            "label": "Materials",
            "href": "/materials"
        },
        {
            "label": category,
            "href": f"/materials/{category_slug}"
        },
        {
            "label": subcategory,
            "href": f"/materials/{category_slug}/{subcategory_slug}"
        },
        {
            "label": name,
            "href": f"/materials/{category_slug}/{subcategory_slug}/{slug}"
        }
    ]
    
    return breadcrumbs
```

## YAML Output Format

```yaml
# Material identification
name: "Aluminum 6061"
slug: "aluminum-6061"
category: "Metals"
subcategory: "Non-Ferrous"

# Breadcrumb navigation
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Metals"
    href: "/materials/metals"
  - label: "Non-Ferrous"
    href: "/materials/metals/non-ferrous"
  - label: "Aluminum 6061"
    href: "/materials/metals/non-ferrous/aluminum-6061"

# ... rest of frontmatter
```

## Integration Example

```python
import yaml

def generate_material_yaml(material_data: dict) -> str:
    """Generate complete YAML frontmatter for material article"""
    
    # Extract material info
    name = material_data['name']
    category = material_data['category']
    subcategory = material_data['subcategory']
    slug = material_data.get('slug') or to_slug(name)
    
    # Generate breadcrumbs
    breadcrumbs = generate_breadcrumbs(name, category, subcategory, slug)
    
    # Build frontmatter dictionary
    frontmatter = {
        'name': name,
        'slug': slug,
        'category': category,
        'subcategory': subcategory,
        'breadcrumb': breadcrumbs,
        # ... add other fields
    }
    
    # Convert to YAML
    yaml_output = yaml.dump(
        frontmatter,
        default_flow_style=False,
        allow_unicode=True,
        sort_keys=False  # Preserve order
    )
    
    return f"---\n{yaml_output}---\n"
```

## Field Ordering

Recommended order in generated YAML:
1. Core identification (name, slug, category, subcategory)
2. **breadcrumb** (after core fields, before metadata)
3. Metadata (datePublished, dateModified, description)
4. Content fields (materialProperties, machineSettings, etc.)

## Validation Rules

```python
def validate_breadcrumbs(breadcrumbs: list[dict]) -> bool:
    """Validate breadcrumb structure"""
    
    # Must have at least 2 items (Home + current page)
    if len(breadcrumbs) < 2:
        return False
    
    # First item must be Home
    if breadcrumbs[0]['label'] != 'Home' or breadcrumbs[0]['href'] != '/':
        return False
    
    # All items must have label and href
    for crumb in breadcrumbs:
        if 'label' not in crumb or 'href' not in crumb:
            return False
        if not isinstance(crumb['label'], str) or not isinstance(crumb['href'], str):
            return False
    
    # Hrefs should not have trailing slashes (except root)
    for crumb in breadcrumbs[1:]:  # Skip Home
        if crumb['href'].endswith('/'):
            return False
    
    return True
```

## Edge Cases

### 1. Special Characters in Names
```python
# Material with special characters
name = "Stainless Steel 316L (Low Carbon)"
slug = "stainless-steel-316l"  # Clean slug
label = "Stainless Steel 316L (Low Carbon)"  # Keep in label
```

### 2. Very Long Names
```python
# No truncation - use full name in breadcrumb
name = "High-Performance Thermoplastic Composite Matrix"
# breadcrumb label uses full name
# Don't truncate or abbreviate
```

### 3. Category/Subcategory Consistency
```python
# Ensure consistent capitalization
category = "Metals"  # Not "metals" or "METALS"
subcategory = "Non-Ferrous"  # Not "non-ferrous" or "Non-ferrous"

# Use Title Case for multi-word categories
category = "Composite Materials"  # Not "Composite materials"
```

## Testing Template

```python
def test_breadcrumb_generation():
    """Test cases for breadcrumb generation"""
    
    # Test 1: Standard material
    result = generate_breadcrumbs(
        name="Aluminum 6061",
        category="Metals",
        subcategory="Non-Ferrous",
        slug="aluminum-6061"
    )
    assert len(result) == 5
    assert result[0]['label'] == "Home"
    assert result[-1]['label'] == "Aluminum 6061"
    assert result[-1]['href'] == "/materials/metals/non-ferrous/aluminum-6061"
    
    # Test 2: Multi-word category
    result = generate_breadcrumbs(
        name="Carbon Fiber",
        category="Composite Materials",
        subcategory="Reinforced Polymers",
        slug="carbon-fiber"
    )
    assert result[2]['href'] == "/materials/composite-materials"
    assert result[3]['href'] == "/materials/composite-materials/reinforced-polymers"
    
    # Test 3: Special characters
    result = generate_breadcrumbs(
        name="Steel 316L (Low Carbon)",
        category="Metals",
        subcategory="Stainless Steel",
        slug="steel-316l"
    )
    assert result[-1]['label'] == "Steel 316L (Low Carbon)"  # Keep parentheses
    assert result[-1]['href'] == "/materials/metals/stainless-steel/steel-316l"
    
    print("✅ All breadcrumb tests passed")
```

## Common Categories

For reference, existing categories and their slugs:

| Category | Slug | Typical Subcategories |
|----------|------|----------------------|
| Metals | metals | Ferrous, Non-Ferrous, Stainless Steel |
| Plastics | plastics | Thermoplastics, Thermosets, Elastomers |
| Composites | composites | Carbon Fiber, Fiberglass, Kevlar |
| Ceramics | ceramics | Oxide, Non-Oxide, Glass |
| Coatings | coatings | Paint, Powder Coat, Anodizing |
| Contamination | contamination | Rust, Grease, Biological |
| Heritage | heritage | Stone, Bronze, Wood |
| Aerospace | aerospace | Aircraft Alloys, Composites |
| Automotive | automotive | Body Panels, Engine Parts |
| Marine | marine | Hull Materials, Coatings |

## PyYAML Configuration

For proper formatting when writing YAML:

```python
import yaml

# Custom representer for ordered output
def setup_yaml():
    """Configure PyYAML for clean output"""
    
    # Represent lists inline for simple items, block for complex
    def represent_list(dumper, data):
        if len(data) > 0 and isinstance(data[0], dict):
            return dumper.represent_list(data)
        return dumper.represent_list(data)
    
    yaml.add_representer(list, represent_list)

# Usage
setup_yaml()

yaml_string = yaml.dump(
    frontmatter,
    default_flow_style=False,  # Block style
    allow_unicode=True,        # UTF-8 support
    sort_keys=False,           # Preserve field order
    width=float("inf"),        # Don't wrap long lines
    indent=2                   # 2-space indentation
)
```

## Error Handling

```python
def safe_breadcrumb_generation(material_data: dict) -> list[dict]:
    """Generate breadcrumbs with error handling"""
    
    try:
        name = material_data['name']
        category = material_data['category']
        subcategory = material_data['subcategory']
        slug = material_data.get('slug') or to_slug(name)
        
        breadcrumbs = generate_breadcrumbs(name, category, subcategory, slug)
        
        if not validate_breadcrumbs(breadcrumbs):
            raise ValueError("Generated breadcrumbs failed validation")
        
        return breadcrumbs
        
    except KeyError as e:
        raise ValueError(f"Missing required field for breadcrumb generation: {e}")
    except Exception as e:
        raise ValueError(f"Failed to generate breadcrumbs: {e}")
```

## Complete Example Output

```yaml
---
# Material identification
name: "Aluminum 6061"
slug: "aluminum-6061"
category: "Metals"
subcategory: "Non-Ferrous"

# Breadcrumb navigation
breadcrumb:
  - label: "Home"
    href: "/"
  - label: "Materials"
    href: "/materials"
  - label: "Metals"
    href: "/materials/metals"
  - label: "Non-Ferrous"
    href: "/materials/metals/non-ferrous"
  - label: "Aluminum 6061"
    href: "/materials/metals/non-ferrous/aluminum-6061"

# Metadata
description: "Comprehensive guide to laser cleaning aluminum 6061..."
datePublished: "2024-01-15"
dateModified: "2025-11-06"

# Content
materialProperties:
  composition: "Al-Mg-Si alloy"
  density: "2.70 g/cm³"
  # ...

machineSettings:
  powerRange: "50-200W"
  # ...
---
```

## Benefits

1. **Self-Documenting**: YAML files contain complete navigation structure
2. **Consistency**: Generator ensures all materials have identical breadcrumb format
3. **Portability**: Files can be moved/imported without losing navigation context
4. **Validation**: Easy to validate breadcrumb structure programmatically
5. **Future-Proof**: If auto-generation logic changes, existing files remain correct

## Migration Note

When implementing, you may want to:
1. Generate breadcrumbs for new articles going forward
2. Optionally run a migration script to add breadcrumbs to existing 132 materials
3. Update validation scripts to check breadcrumb presence/correctness

## Related Files

- `docs/BREADCRUMB_STANDARD.md` - Overall breadcrumb standard
- `app/utils/breadcrumbs.ts` - TypeScript implementation (fallback if YAML breadcrumb missing)
- `types/index.ts` - BreadcrumbItem TypeScript interface

---

**Status**: Ready for Integration  
**Last Updated**: November 6, 2025
