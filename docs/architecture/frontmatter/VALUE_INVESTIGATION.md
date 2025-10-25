# Frontmatter Value Investigation Prompt

## Issue Report
A user reported that clicking on a MetricsCard for `laserReflectivity` generated a search URL with `value=97`, but the actual frontmatter data shows different values across all checked materials:
- Porcelain: 42.3%
- Platinum: 73.2%
- Mahogany: 32.5%
- Stainless Steel: 65.2%
- Alabaster: 38.7%

**None of the checked materials have laserReflectivity value of 97.**

## Investigation Tasks

### 1. Find the Source Material
Search all frontmatter YAML files to identify which material(s) have `laserReflectivity` with value `97` or close to it:

```bash
# Search for laserReflectivity values near 97
grep -r "laserReflectivity:" content/frontmatter/ -A 2 | grep -E "value: (9[0-9]|97)"

# Or check all laserReflectivity values
for file in content/frontmatter/*.yaml; do
  value=$(grep -A 1 "laserReflectivity:" "$file" | grep "value:" | awk '{print $2}')
  if [ ! -z "$value" ]; then
    echo "$(basename $file): $value"
  fi
done | sort -t: -k2 -n
```

### 2. Check for Data Inconsistencies
Investigate if there are any of these issues:

**a) Incorrect Value Assignments:**
- Are any properties swapped? (e.g., absorption vs reflectivity)
- Are values in wrong units or scales?
- Expected relationship: `laserAbsorption + laserReflectivity ≈ 100%` (for opaque materials)

**b) Value Calculation Errors:**
- Check if any material has `laserAbsorption: 85` and something is incorrectly calculating reflectivity as `100 - 85 = 15` but displaying as `97`
- Verify all percentage values are actually percentages (0-100) not fractions (0-1)

**c) Data Type Issues:**
- Are any numeric values stored as strings?
- Are there any concatenation errors creating weird numbers?

### 3. Validate Relationships
For materials with both `laserAbsorption` and `laserReflectivity`:

```yaml
# Expected for opaque materials:
laserAbsorption + laserReflectivity ≈ 100%

# Example validation:
# If laserAbsorption: 85%, expect laserReflectivity: ~15% (not 97%)
```

Check these specific materials:
- **Alabaster**: has `laserAbsorption: 85%` and `laserReflectivity: 38.7%` (sum = 123.7% - INCORRECT!)
- This suggests a systematic error in the data

### 4. Fix Recommendations

**Option A: Recalculate Reflectivity**
If absorption data is more reliable:
```yaml
laserReflectivity: 100 - laserAbsorption (for opaque materials)
```

**Option B: Add Transmittance**
For transparent/translucent materials:
```yaml
laserAbsorption + laserReflectivity + transmittance = 100%
```

**Option C: Validate Against Physical Constraints**
- Opaque materials: absorption + reflectivity ≈ 100%
- Transparent materials: need transmittance data
- Check material type (stone, metal, polymer, glass) for expected ranges

### 5. Specific Investigation Requests

1. **Find the problematic file:**
   - Which material file(s) would generate `laserReflectivity: 97`?
   - Is there a material with inverted values (e.g., 97 absorption showing as 97 reflectivity)?

2. **Audit all laser_material_interaction properties:**
   - Count how many materials have both absorption and reflectivity
   - Calculate the sum for each
   - Identify all cases where sum > 100% or sum < 80%

3. **Check for systematic errors:**
   - Are all stone/ceramic materials showing inflated reflectivity?
   - Are reflectivity values perhaps calculated as `100 - (100 - absorption)` (double negative)?
   - Are percentages being stored as both 0-1 and 0-100 scales?

### 6. Proposed Fix Script

Create a script to audit and fix the relationships:

```javascript
// Pseudo-code for validation
for each material:
  if (has laserAbsorption && has laserReflectivity):
    sum = laserAbsorption + laserReflectivity
    if (sum > 105 || sum < 80):
      // Flag for review
      if (material is opaque):
        // Recalculate: reflectivity = 100 - absorption
      else:
        // Flag as needing transmittance data
```

## Expected Output

Please provide:
1. List of all materials with `laserReflectivity` values between 90-100
2. List of materials where `absorption + reflectivity > 105%`
3. Specific material that would generate the `value=97` search URL
4. Root cause of the inconsistency
5. Recommended fix strategy for all affected materials

## Test Case
After fixing, verify that:
- Alabaster: `laserAbsorption: 85%` → `laserReflectivity: 15%` (or add transmittance)
- All opaque materials: `absorption + reflectivity ≈ 100%`
- Search URLs from MetricsCard clicks match actual frontmatter values
