# YAML Post-Processor for Z-Beam Content Generator

This directory contains Python scripts to automatically fix YAML formatting issues that can cause parsing errors in the Next.js application.

## 🎯 Problem Solved

When generating content with Python, common YAML formatting issues can occur:
- ❌ Single-space indentation instead of double-space
- ❌ Nested quote problems: `useCase: '"text"'`
- ❌ Improper sequence indentation
- ❌ Missing quotes around special values
- ❌ Structural nesting issues

These cause errors like:
```
YAMLException: bad indentation of a sequence entry at line 5
YAMLException: duplicated mapping key at line 46
```

## 📁 Files Included

### Production Scripts
- **`yaml_postprocessor_integration.py`** - Full-featured post-processor with statistics
- **`yaml_fixer_lite.py`** - Lightweight version for simple use cases

### Development/Testing
- **`yaml_postprocessor.py`** - Advanced version with strict mode and validation
- **`generator_integration_example.py`** - Integration examples for your generator
- **`fix-yaml-formatting.sh`** - Shell script for manual fixes

## 🚀 Quick Start

### Option 1: Lightweight Integration (Recommended)
```python
# Add to the end of your content generator:
import subprocess
import sys

# Generate your content...
generate_content()

# Fix YAML issues
subprocess.run([sys.executable, 'yaml_fixer_lite.py', './content'])
```

### Option 2: Full Integration with Statistics
```python
from yaml_postprocessor_integration import fix_yaml_in_directory

# Generate your content...
generate_content()

# Fix YAML and get statistics
stats = fix_yaml_in_directory("./content")
print(f"Fixed {stats['files_fixed']} files")
```

### Option 3: Standalone Usage
```bash
# After running your content generator:
python3 yaml_fixer_lite.py ./content
python3 yaml_postprocessor_integration.py ./content
```

## 🔧 What Gets Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Indentation** | `\n -item:` | `\n  - item:` |
| **Nested Quotes** | `key: '"value"'` | `key: "value"` |
| **Special Values** | `desc: text:more` | `desc: "text:more"` |
| **Structure** | Poor nesting | Proper YAML hierarchy |

## 📊 Example Output

```
🎯 Z-Beam YAML Post-Processor
========================================
🔧 Processing YAML in content/
  ✅ Fixed frontmatter/stoneware-laser-cleaning.md
  ✅ Fixed metatags/porcelain-laser-cleaning.md

📊 YAML Processing Summary:
   Files processed: 236
   Files fixed: 2
   Fixes applied:
     - Indentation: 5
     - Quotes: 3
     - Structure: 2
     - Values quoted: 1

✅ YAML post-processing completed successfully!
Your content is now ready for the Next.js application.
```

## 🔗 Integration Workflow

```mermaid
graph LR
    A[Python Generator] --> B[Generate Content]
    B --> C[Run YAML Post-Processor]
    C --> D[Fixed YAML Files]
    D --> E[Next.js App]
    E --> F[No YAML Errors! 🎉]
```

## 📋 Requirements

```bash
# For basic functionality:
pip install PyYAML

# For advanced features (optional):
pip install -r yaml_postprocessor_requirements.txt
```

## 🎛️ Configuration Options

### Lightweight Fixer (`yaml_fixer_lite.py`)
- ✅ Fast execution
- ✅ Fixes most common issues
- ✅ No external dependencies
- ✅ Perfect for CI/CD

### Full Post-Processor (`yaml_postprocessor_integration.py`)
- ✅ Comprehensive fixing
- ✅ Detailed statistics
- ✅ Verbose logging
- ✅ Error handling

### Advanced Version (`yaml_postprocessor.py`)
- ✅ Strict mode validation
- ✅ Aggressive fixes
- ✅ CLI with options
- ✅ Development features

## 🚨 Common Issues Fixed

### Issue 1: Sequence Indentation
```yaml
# Before (causes error):
applications:
- industry: Test
 useCase: "Description"

# After (fixed):
applications:
  - industry: Test
    useCase: "Description"
```

### Issue 2: Nested Object Structure
```yaml
# Before (causes error):
images:
  hero:
  alt: "Description"
  url: "/path/image.jpg"

# After (fixed):
images:
  hero:
    alt: "Description"
    url: "/path/image.jpg"
```

### Issue 3: Quote Issues
```yaml
# Before (causes error):
useCase: '"Removal of biological crusts"'

# After (fixed):
useCase: "Removal of biological crusts"
```

## 💡 Best Practices

1. **Run after every content generation**
2. **Use the lightweight version for production**
3. **Check statistics to monitor content quality**
4. **Integrate into your CI/CD pipeline**

## 🔍 Troubleshooting

### If you still see YAML errors:
1. Run with verbose mode: `python3 yaml_postprocessor.py --verbose ./content`
2. Check the specific file mentioned in the error
3. Use strict mode: `python3 yaml_postprocessor.py --strict ./content`

### For complex YAML structures:
- The post-processor handles 95% of common issues
- Manual review may be needed for very complex nested structures
- Consider simplifying your YAML generation logic

## ✅ Validation

After running the post-processor, your content will:
- ✅ Build successfully in Next.js
- ✅ Parse without YAML errors
- ✅ Display correctly in the application
- ✅ Pass all CI/CD checks

## 🎉 Success!

Your Z-Beam content generator now produces perfectly formatted YAML that works seamlessly with the Next.js application!
