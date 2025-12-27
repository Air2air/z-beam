#!/usr/bin/env python3
"""
Fix compound breadcrumb links: Convert underscores to hyphens in href URLs only.
This ensures URLs are normalized (all hyphens) while preserving YAML keys with underscores.
"""

import yaml
import glob
from pathlib import Path

def fix_compound_breadcrumbs():
    """Fix breadcrumb hrefs in compound frontmatter files."""
    compound_files = glob.glob('frontmatter/compounds/*.yaml')
    fixed_count = 0
    
    for filepath in compound_files:
        print(f"Processing {filepath}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        # Fix breadcrumb hrefs
        if 'breadcrumb' in data and isinstance(data['breadcrumb'], list):
            changed = False
            for item in data['breadcrumb']:
                if 'href' in item and '_' in item['href']:
                    old_href = item['href']
                    item['href'] = item['href'].replace('_', '-')
                    print(f"  Fixed: {old_href} -> {item['href']}")
                    changed = True
            
            if changed:
                # Write back to file
                with open(filepath, 'w', encoding='utf-8') as f:
                    yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
                fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} compound files")

if __name__ == '__main__':
    fix_compound_breadcrumbs()
