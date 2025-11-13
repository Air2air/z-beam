# Python Generator Prompt: Add Git-Based Dates to Frontmatter

## Prompt for Python Generator

When generating frontmatter YAML files, **automatically add creation and modification dates based on Git commit history** using the following approach:

### Date Field Requirements

Every frontmatter YAML file MUST include these two date fields at the top level:

```yaml
datePublished: '2025-10-30T15:30:08-07:00'  # ISO 8601 format with timezone
dateModified: '2025-11-12T16:21:27-08:00'   # ISO 8601 format with timezone
```

### Implementation Instructions

1. **Extract Git Dates**
   - Use `git log --follow --format=%aI --reverse <filepath> | head -1` for **first commit date** (datePublished)
   - Use `git log --follow --format=%aI -1 <filepath>` for **last commit date** (dateModified)
   - The `--follow` flag tracks file renames/moves

2. **Date Format**
   - Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SS±HH:MM`
   - Include timezone offset (e.g., `-07:00` for PDT, `-08:00` for PST)
   - Git's `%aI` format provides this automatically

3. **Placement in YAML**
   - Add dates AFTER the metadata section (author, title, category, etc.)
   - Add BEFORE the description field
   - Example placement:

```yaml
name: Aluminum
category: metal
subcategory: non-ferrous
title: Aluminum Laser Cleaning
subtitle: Precision Laser Cleaning...
datePublished: '2025-10-30T15:30:08-07:00'
dateModified: '2025-11-12T16:21:27-08:00'
description: Laser cleaning parameters for Aluminum
```

4. **Fallback Handling**
   - If Git history unavailable: Use current timestamp for both fields
   - If file is newly created: Use current timestamp for both fields
   - Never leave these fields empty or missing

### Python Implementation Example

```python
import subprocess
from datetime import datetime

def get_git_dates(filepath):
    """Get first and last commit dates for a file."""
    try:
        # Get first commit (creation date)
        first_commit = subprocess.check_output(
            ['git', 'log', '--follow', '--format=%aI', '--reverse', filepath],
            text=True
        ).strip().split('\n')[0]
        
        # Get last commit (modification date)
        last_commit = subprocess.check_output(
            ['git', 'log', '--follow', '--format=%aI', '-1', filepath],
            text=True
        ).strip()
        
        return {
            'datePublished': first_commit,
            'dateModified': last_commit
        }
    except (subprocess.CalledProcessError, IndexError):
        # Fallback to current time if Git unavailable
        now = datetime.now().astimezone().isoformat()
        return {
            'datePublished': now,
            'dateModified': now
        }

# Usage in generator
dates = get_git_dates(frontmatter_file_path)
frontmatter_data['datePublished'] = dates['datePublished']
frontmatter_data['dateModified'] = dates['dateModified']
```

### Validation Rules

✅ **MUST** include both `datePublished` and `dateModified`  
✅ **MUST** use ISO 8601 format with timezone  
✅ **MUST** use single quotes in YAML: `'2025-10-30T15:30:08-07:00'`  
✅ **SHOULD** extract from Git history (not generate fake dates)  
✅ **MAY** use current timestamp as fallback when Git unavailable  

❌ **DO NOT** use placeholder dates like `2025-11-11T04:44:00.602Z`  
❌ **DO NOT** generate sequential/incremental fake timestamps  
❌ **DO NOT** omit timezone information  
❌ **DO NOT** use dates without quotes in YAML  

### Benefits of This Approach

1. **SEO Accuracy** - Search engines see real publication dates
2. **User Trust** - "Updated today" badges show accurate freshness
3. **Content Tracking** - Real dates help track content lifecycle
4. **Legal Compliance** - Accurate timestamps for copyright/licensing
5. **No Manual Updates** - Dates automatically reflect Git history

### Example Output

```yaml
name: Copper
breadcrumb:
- label: Home
  href: /
- label: Materials
  href: /materials
author:
  name: Dr. Sarah Chen
  title: Ph.D.
category: metal
subcategory: non-ferrous
title: Copper Laser Cleaning
subtitle: Advanced Laser Cleaning for Copper Surfaces
datePublished: '2025-10-30T15:30:08-07:00'
dateModified: '2025-11-12T16:21:27-08:00'
description: Comprehensive laser cleaning parameters for copper and copper alloys
```

### Integration with Existing Script

The JavaScript script `/scripts/update-frontmatter-dates.js` can be used to:
- Update existing files that lack proper dates
- Verify date accuracy after generation
- Batch update all files when needed

Command: `node scripts/update-frontmatter-dates.js --file=<path>`

---

## Summary for Python Generator

**Add this to your material/content generation process:**

1. When creating new frontmatter file → Extract Git dates (or use current time)
2. Add `datePublished` and `dateModified` fields in ISO 8601 format
3. Place dates after title/category, before description
4. Use single quotes around date strings in YAML
5. Ensure dates reflect actual Git commit history

This ensures all generated content has accurate, SEO-friendly timestamps that match the actual file creation and modification history.
