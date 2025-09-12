---
title: "YAML Processing System"
category: "Systems"
difficulty: "Intermediate"
lastUpdated: "2025-09-11"
relatedDocs: ["content-system.md", "troubleshooting.md"]
copilotTags: ["yaml", "processing", "automation", "content", "frontmatter"]
---

# YAML Processing System

> **Quick Reference**: Comprehensive YAML processing system that automatically detects and fixes YAML frontmatter issues in markdown files.

## 🎯 Overview

The Z-Beam YAML processor is a critical system that ensures all markdown content files have properly formatted YAML frontmatter. It automatically fixes structural issues, validates content, and maintains data integrity across the entire content system.

## 🚀 Quick Commands

```bash
# Process all content files (most common)
npm run yaml

# Validate only (no changes)
npm run yaml:validate

# Process only material files
npm run yaml:materials

# Fix badge symbol display issues
npm run yaml:fix-badges

# Check a specific file
npm run yaml:check-file path/to/file.md

# Check required fields
npm run yaml:check-required
```

## 🏗️ System Architecture

### **Core Components**
```
yaml-processor/
├── yaml                        # Main entry script
├── yaml_processor.py          # Core processing engine
├── yaml_validator.py          # Validation-only processor
├── tools/
│   ├── fix_badge_symbols.py   # Chemical symbol fixes
│   └── check_file_completeness.py
└── README.md                  # Detailed documentation
```

### **Processing Pipeline**
1. **File Discovery** - Recursively finds all `.md` files
2. **Size Filtering** - Skips very small/empty files
3. **YAML Parsing** - Extracts and validates frontmatter
4. **Issue Detection** - Identifies structural problems
5. **Automatic Fixing** - Repairs common issues
6. **Validation** - Ensures proper format
7. **Backup & Write** - Safely updates files

## 🔧 Features & Capabilities

### **Automatic Fixes**
- ✅ **Duplicate mapping keys** - Removes duplicates
- ✅ **Bad indentation** - Corrects nested structures
- ✅ **Missing colons** - Adds required YAML syntax
- ✅ **Malformed lists** - Fixes array structures
- ✅ **Unicode issues** - Handles encoding problems
- ✅ **Empty values** - Provides defaults where needed
- ✅ **Badge symbols** - Corrects chemical formula display
- ✅ **Truncated content** - Detects incomplete files

### **Smart Processing**
- **Size Thresholds** - Skips files smaller than 50 bytes by default
- **Backup Creation** - Creates `.backup` files before changes
- **Progress Reporting** - Shows processing status
- **Error Logging** - Detailed error reporting
- **Batch Processing** - Handles large file sets efficiently

## 📋 Common Use Cases

### **Daily Development**
```bash
# Before committing changes
npm run yaml

# Check for issues without fixing
npm run yaml:validate
```

### **Content Maintenance**
```bash
# Fix chemical symbol display
npm run yaml:fix-badges

# Validate specific content category
npm run yaml:materials

# Check file completeness
npm run yaml:check-required
```

### **Troubleshooting**
```bash
# Check a problematic file
npm run yaml:check-file content/material/aluminum-laser-cleaning.md

# Skip small files with custom threshold
npm run yaml -- --skip-small=100

# Verbose output for debugging
npm run yaml -- --verbose
```

## ⚙️ Configuration Options

### **Environment Variables**
```bash
# Set minimum file size (default: 50)
export YAML_MIN_SIZE=100

# Enable verbose logging
export YAML_VERBOSE=true

# Skip backup creation
export YAML_NO_BACKUP=true
```

### **Command Line Options**
```bash
# Custom size threshold
npm run yaml -- --skip-small=75

# Process specific directory
npm run yaml -- --dir=content/material

# Force processing of small files
npm run yaml -- --force-small
```

## 🏥 Health Checks

### **Validation Pipeline**
```bash
# Full system validation
npm run yaml:validate

# Check specific requirements
npm run yaml:check-required

# Verify badge symbols
npm run yaml:fix-badges --dry-run
```

### **Status Indicators**
- ✅ **VALID** - File passes all checks
- ⚠️ **WARNING** - Minor issues detected
- ❌ **ERROR** - Critical problems found
- 🔧 **FIXED** - Issues automatically resolved

## 📊 Integration Points

### **Build System Integration**
```json
// package.json
{
  "scripts": {
    "prebuild": "npm run yaml:validate",
    "predev": "npm run yaml",
    "yaml": "cd yaml-processor && ./yaml",
    "yaml:validate": "cd yaml-processor && python yaml_validator.py"
  }
}
```

### **Content API Integration**
- **Frontmatter Parsing** - Ensures consistent data structure
- **Type Safety** - Validates required fields
- **Error Handling** - Graceful degradation for malformed data

## ❌ Common Issues & Solutions

### **Problem**: "YAML parse error: duplicate key"
**Solution**: 
```bash
npm run yaml  # Automatically removes duplicates
```

### **Problem**: "BadgeSymbol not displaying correctly"
**Solution**:
```bash
npm run yaml:fix-badges
```

### **Problem**: "File too small, skipping"
**Solution**:
```bash
npm run yaml -- --skip-small=0  # Process all files
```

### **Problem**: "Required field missing"
**Solution**:
```bash
npm run yaml:check-required  # Shows which fields are missing
```

## 🔗 Related Systems

### **Content System**
- Works with [Content Architecture](../architecture/content-system.md)
- Ensures data consistency for content APIs
- Validates frontmatter structure

### **Build Pipeline**
- Integrates with [Build System](../architecture/build-deployment.md)
- Runs validation during pre-build checks
- Ensures clean content for static generation

### **Component System**
- Provides data for [Badge Components](../development/component-rules.md)
- Ensures proper chemical formula rendering
- Validates properties table data

## 🚨 Emergency Procedures

### **If YAML Processing Fails**
1. **Check file backup**:
   ```bash
   ls content/material/*.backup
   ```

2. **Restore if needed**:
   ```bash
   cp file.md.backup file.md
   ```

3. **Run manual validation**:
   ```bash
   npm run yaml:check-file file.md
   ```

### **If Build Fails Due to YAML Issues**
1. **Skip validation temporarily**:
   ```bash
   npm run build --skip-yaml
   ```

2. **Fix issues**:
   ```bash
   npm run yaml:validate  # Find problems
   npm run yaml           # Fix automatically
   ```

3. **Retry build**:
   ```bash
   npm run build
   ```

## 📈 Performance Notes

- **Processing Speed**: ~100 files per second
- **Memory Usage**: Minimal (streaming processing)
- **File Size Limits**: No practical limit
- **Backup Storage**: 1:1 ratio with original files

---

**Next Steps**: After YAML processing, content flows to the [Content System](../architecture/content-system.md) for API generation and routing.
