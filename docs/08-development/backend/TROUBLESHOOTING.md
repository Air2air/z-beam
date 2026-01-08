# Backend Troubleshooting Guide

**Last Updated:** January 7, 2026

---

## Quick Diagnostics

### Check Dataset Loading Status

```bash
# Check if dataset files exist
ls -lh public/datasets/materials/ | head -20

# Count dataset files
ls public/datasets/materials/*.json | wc -l
# Expected: 132 files

# Test loading a specific dataset
node -e "const ds = require('./app/utils/schemas/datasetLoader'); console.log(ds.loadGeneratedDataset('aluminum', 'materials'))"
```

### Check Build Errors

```bash
# Full build with error capture
npm run build 2>&1 | tee /tmp/build-error.log

# Search for dataset errors
grep -i "dataset\|generated dataset not found" /tmp/build-error.log

# Count export errors
grep "Export encountered errors" /tmp/build-error.log | wc -l
```

---

## Common Issues

### Issue 1: Duplicate Suffix in Dataset Paths

**Symptoms:**
```
📊 Generated dataset not found: /path/aluminum-material-dataset-material-dataset.json
```

**Diagnosis:**
```bash
# Check SchemaFactory.ts line 2029
grep -n "loadGeneratedDataset" app/utils/schemas/SchemaFactory.ts

# Look for what's passed as first parameter
# If it's 'datasetName' (with suffix) → BUG
# If it's 'baseSlug' (without suffix) → CORRECT
```

**Root Cause:**
- `datasetName` = `"aluminum-material-dataset"` (already has suffix)
- `loadGeneratedDataset()` adds another suffix
- Result: `aluminum-material-dataset-material-dataset.json`

**Fix:**
```typescript
// SchemaFactory.ts line 2029
- const generatedDataset = loadGeneratedDataset(datasetName, datasetFolder);
+ const generatedDataset = loadGeneratedDataset(baseSlug, datasetFolder);
```

**⚠️ WARNING:** Fix exposes Issue #2 (see below)

---

### Issue 2: String Citations in PropertyValue Objects

**Symptoms:**
```
TypeError: e.map is not a function
Export encountered errors on 164 paths
```

**Diagnosis:**
```bash
# Check for string citations in dataset files
cat public/datasets/materials/poplar-material-dataset.json | \
  grep -A 5 '"citation"' | grep -v "CreativeWork"

# Count affected files
find public/datasets/materials -name "*.json" -exec \
  grep -l '"citation": "' {} \; | wc -l
```

**Root Cause:**
```json
{
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "citation": "Author et al..."  // ❌ STRING
    }
  ]
}
```

Code expects array:
```typescript
citations.map(cite => ...)  // Crashes when citations is string
```

**Fix Options:**

**Option A: Remove Citation from PropertyValue** (Quick)
```bash
# Use jq to remove citation fields from PropertyValue objects
cd public/datasets/materials/
for file in *.json; do
  jq 'walk(
    if type == "object" and .["@type"] == "PropertyValue" 
    then del(.citation) 
    else . 
    end
  )' "$file" > "$file.tmp"
  mv "$file.tmp" "$file"
done
```

**Option B: Fix Generation Script** (Proper)
1. Locate dataset generation script
2. Remove citation field from PropertyValue generation
3. Regenerate all 132 dataset files
4. Validate before commit

**Option C: Convert to Array** (If citations needed)
```bash
# Convert string citations to array format
jq 'walk(
  if type == "object" and .["@type"] == "PropertyValue" and (.citation | type) == "string"
  then .citation = [{"@type": "CreativeWork", "name": .citation}]
  else .
  end
)' file.json
```

---

### Issue 3: Dataset Files Not Found

**Symptoms:**
```
📊 Generated dataset not found: /path/aluminum-material-dataset.json
```

**Diagnosis:**
```bash
# Check if file exists
ls -l public/datasets/materials/aluminum-material-dataset.json

# Check file permissions
stat public/datasets/materials/aluminum-material-dataset.json

# Check if in .gitignore
git check-ignore public/datasets/materials/aluminum-material-dataset.json
```

**Common Causes:**

1. **File not generated:**
   - Generation script not run
   - Script failed silently
   - Wrong output directory

2. **File in wrong location:**
   ```bash
   # Search for file
   find . -name "aluminum-material-dataset.json"
   ```

3. **Git ignored:**
   ```bash
   # Check .gitignore
   grep -r "datasets" .gitignore
   ```

**Fix:**
1. Generate missing files
2. Move to correct location: `public/datasets/materials/`
3. Remove from .gitignore if needed
4. Commit files to repository

---

### Issue 4: Malformed JSON

**Symptoms:**
```
SyntaxError: Unexpected token } in JSON at position 1234
```

**Diagnosis:**
```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('public/datasets/materials/file.json', 'utf8'))"

# Use jq for better error messages
jq . public/datasets/materials/file.json

# Find all invalid JSON files
for f in public/datasets/materials/*.json; do
  jq . "$f" > /dev/null 2>&1 || echo "Invalid: $f"
done
```

**Common Issues:**
- Trailing commas
- Unescaped quotes
- Missing brackets/braces
- Invalid UTF-8 characters

**Fix:**
```bash
# Auto-format with jq
jq . input.json > output.json

# Or use prettier
npx prettier --write "public/datasets/materials/*.json"
```

---

### Issue 5: Build Fails with 164 Export Errors

**Symptoms:**
```
Export encountered errors on following paths:
/materials/wood/hardwood/poplar-laser-cleaning
/materials/ceramic/oxide/alumina-laser-cleaning
... (164 total)
```

**Diagnosis:**
This is Issue #2 (string citations) affecting multiple files.

**Quick Check:**
```bash
# Count materials with string citations
find public/datasets/materials -name "*.json" -exec \
  grep -l '"citation": "[^"]*"' {} \; | wc -l
```

**Categories Affected:**
- Ceramic (13 files)
- Composite (13 files)
- Glass (13 files)
- Masonry (7 files)
- Metal (~20 files)
- Plastic (11 files)
- Rare-earth (8 files)
- Semiconductor (6 files)
- Stone (23 files)
- Wood (18 files)

**Fix:** See Issue #2 solutions above

---

### Issue 6: Dataset Enhancement Not Working

**Symptoms:**
- Pages render successfully
- But variableMeasured only has 5-10 items
- Expected: 20+ items from dataset files

**Diagnosis:**
```typescript
// Check in SchemaFactory.ts
console.log('Loaded dataset:', generatedDataset);
console.log('Enhanced fields:', enhancedFields);
```

**Common Causes:**

1. **Files not loading** (duplicate suffix issue)
2. **extractEnhancedFields returning null**
3. **variableMeasured field missing in dataset**

**Fix:**
```bash
# Verify dataset has variableMeasured
jq '.variableMeasured | length' public/datasets/materials/aluminum-material-dataset.json

# Check if loading correctly
node -e "
  const loader = require('./app/utils/schemas/datasetLoader');
  const data = loader.loadGeneratedDataset('aluminum', 'materials');
  const fields = loader.extractEnhancedFields(data);
  console.log('variableMeasured count:', fields?.variableMeasured?.length || 0);
"
```

---

### Issue 7: Slow Build Performance

**Symptoms:**
- Build takes >5 minutes
- High memory usage
- CPU at 100%

**Diagnosis:**
```bash
# Check number of files being processed
ls -1 public/datasets/materials/*.json | wc -l

# Check file sizes
du -h public/datasets/materials/ | tail -1

# Profile build
NODE_OPTIONS='--prof' npm run build
node --prof-process isolate-*.log > profile.txt
```

**Optimization:**
1. Add caching to datasetLoader
2. Reduce file sizes (remove unnecessary fields)
3. Implement lazy loading
4. Use worker threads for parallel processing

---

## Debugging Commands

### Test Dataset Loading

```bash
# Server-side loader
node -e "
  const { loadGeneratedDataset, extractEnhancedFields } = require('./app/utils/schemas/datasetLoader');
  const dataset = loadGeneratedDataset('aluminum', 'materials');
  console.log('Loaded:', !!dataset);
  console.log('Type:', dataset?.['@type']);
  const fields = extractEnhancedFields(dataset);
  console.log('Variables:', fields?.variableMeasured?.length || 0);
"
```

### Validate Dataset Structure

```bash
# Check required fields
jq 'to_entries | map(select(.key | test("^@|name|description|variableMeasured")))' \
  public/datasets/materials/aluminum-material-dataset.json

# Check PropertyValue structure
jq '.variableMeasured[0]' public/datasets/materials/aluminum-material-dataset.json

# Find PropertyValues with citation strings
jq '.variableMeasured[] | select(.citation | type == "string") | .name' \
  public/datasets/materials/aluminum-material-dataset.json
```

### Search for Patterns

```bash
# Find all files with specific error
grep -r "TypeError: e.map" .next/

# Find all files with duplicate suffix logging
grep -r "material-dataset-material-dataset" .next/

# Count occurrences of pattern
grep -ro "Generated dataset not found" .next/ | wc -l
```

---

## Emergency Fixes

### Revert to Working State

```bash
# If deployment fails, revert the fix
git revert HEAD --no-edit
git push

# This reverts to duplicate suffix bug
# But allows deployment to succeed
```

### Disable Dataset Enhancement

```typescript
// SchemaFactory.ts line 2029
// Temporary: Force null to use fallback generation
const generatedDataset = null; // loadGeneratedDataset(baseSlug, datasetFolder);
const enhancedFields = extractEnhancedFields(generatedDataset);
```

### Quick Fix Script

```bash
#!/bin/bash
# fix-dataset-citations.sh

echo "Fixing string citations in dataset files..."

cd public/datasets/materials/

for file in *.json; do
  echo "Processing $file..."
  jq 'walk(
    if type == "object" and 
       .["@type"] == "PropertyValue" and 
       (.citation | type) == "string"
    then del(.citation)
    else .
    end
  )' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done

echo "✅ Fixed all dataset files"
echo "Run 'npm run build' to verify"
```

---

## Prevention Checklist

### Before Committing Dataset Changes

- [ ] Validate JSON syntax: `jq . file.json`
- [ ] Check PropertyValue structure
- [ ] Verify no string citations
- [ ] Test loading: `node -e "..."`
- [ ] Run validation: `npm run validate:datasets`
- [ ] Test build: `npm run build`

### Before Deploying

- [ ] All tests passing: `npm run test:all`
- [ ] Build succeeds: `npm run build`
- [ ] No export errors
- [ ] Dataset files committed
- [ ] .gitignore not blocking files

### After Deployment

- [ ] Check production pages load
- [ ] Verify Schema.org data
- [ ] Test Google Rich Results
- [ ] Monitor error logs

---

## Getting Help

### Debug Info to Collect

```bash
# System info
node --version
npm --version

# File counts
ls -1 public/datasets/materials/*.json | wc -l

# Recent changes
git log --oneline -10 -- app/utils/schemas/

# Error logs
tail -100 /tmp/build-error.log
```

### Report Issue Template

```markdown
**Issue:** [Brief description]

**Environment:**
- Node version: [X.X.X]
- Next.js version: [X.X.X]
- Branch: [main/feature/...]

**Steps to Reproduce:**
1. ...
2. ...

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Error Output:**
```
[Paste error messages]
```

**Files Affected:** [List files]

**Attempted Fixes:**
- [ ] Tried X
- [ ] Tried Y
```

---

## Related Documentation

- [Dataset Generation](./DATASET_GENERATION.md)
- [Dataset Loading](./DATASET_LOADING.md)
- [Data Validation](./DATA_VALIDATION.md)
- [Consolidation Guide](./CONSOLIDATION.md)
