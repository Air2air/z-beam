# Author E-E-A-T Schema Enhancement Prompt

## Objective
Enhance the `author` section in material YAML frontmatter files to improve E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals for Google search rankings.

## Target Schema Structure

Generate author data using this exact YAML structure:

```yaml
author:
  id: 2                                    # Numeric author ID
  name: Alessandro Moretti                 # Full name
  country: Italy                           # Country of origin
  title: Ph.D.                            # Academic credentials (Ph.D., M.Sc., MA, etc.)
  sex: m                                  # Gender (m/f)
  jobTitle: Senior Materials Engineer     # Current professional role
  
  # CRITICAL: Expertise as array (3-5 items for maximum E-E-A-T impact)
  expertise:
    - Laser-Based Additive Manufacturing
    - Ceramic Materials Processing
    - Surface Engineering
    - High-Temperature Materials
  
  # Institutional affiliation adds authority
  affiliation:
    name: Technical University of Milano
    type: EducationalOrganization
    
  # Credentials demonstrate qualifications (2-4 items recommended)
  credentials:
    - Ph.D. Materials Science, TU Milano, 2015
    - 10+ years industrial ceramics experience
    - Published researcher in laser processing
    
  # Contact and identity
  email: alessandro.moretti@z-beam.com
  image: /images/author/alessandro-moretti.jpg
  url: https://z-beam.com/authors/alessandro-moretti
  
  # Social proof / verification (high E-E-A-T value)
  sameAs:
    - https://orcid.org/0000-0002-1234-5678        # Research ID (if available)
    - https://scholar.google.com/citations?user=abc123  # Publications (if available)
    - https://linkedin.com/in/alessandro-moretti   # Professional profile
```

## Field Definitions

### Required Fields (Keep Existing):
- `id`: Numeric identifier (1-10)
- `name`: Full author name
- `country`: Country of origin
- `title`: Academic title (Ph.D., M.Sc., MA, etc.)
- `sex`: Gender (m/f)
- `image`: Path to author image

### New High-Impact Fields:
- **`jobTitle`**: Current professional role/position
  - Examples: "Senior Materials Engineer", "Research Scientist", "Materials Physicist"
  
- **`expertise`**: Array of 3-5 specialization areas (CRITICAL for E-E-A-T)
  - Focus on technical domains relevant to material
  - Examples: "Laser-Based Additive Manufacturing", "Ceramic Materials Processing"
  
- **`affiliation`**: Current institutional affiliation
  - `name`: Institution name
  - `type`: Always "EducationalOrganization" or "Organization"
  
- **`credentials`**: Array of 2-4 qualification statements
  - Format: "[Degree/Credential], [Institution], [Year]" OR "[Years] experience in [field]"
  - Mix academic degrees with professional experience
  
- **`email`**: Professional email address
  - Format: `firstname.lastname@z-beam.com`
  
- **`url`**: Link to author profile page
  - Format: `https://z-beam.com/authors/[firstname-lastname]`
  
- **`sameAs`**: Array of verifiable profile URLs (optional but high value)
  - ORCID: `https://orcid.org/0000-0002-XXXX-XXXX`
  - Google Scholar: `https://scholar.google.com/citations?user=XXXXX`
  - LinkedIn: `https://linkedin.com/in/[name]`

### Optional Enhancement:
- **`alumniOf`**: Educational institution (if different from current affiliation)
  ```yaml
  alumniOf:
    name: Technical University of Milano
    type: EducationalOrganization
  ```

## Generation Guidelines

### For Each Material/Author Pair:

1. **Convert existing single `expertise` string to array**
   - Current: `expertise: Laser-Based Additive Manufacturing`
   - New: `expertise: [Laser-Based Additive Manufacturing, Ceramic Materials Processing, ...]`
   - Add 2-4 related specializations

2. **Generate appropriate `jobTitle`** based on author's academic level:
   - Ph.D. → "Senior [Field] Engineer" or "Research Scientist"
   - M.Sc./MA → "[Field] Engineer" or "Materials Specialist"
   - Match to material category (ceramic → ceramics, metal → metallurgy, etc.)

3. **Create realistic `affiliation`**:
   - Academic authors → University/Research Institute
   - Technical authors → Industrial company or research center
   - Format: "[Institution Type] of [Location]" or "[Company Name]"

4. **Build `credentials` array**:
   - Line 1: Academic degree with institution and year
   - Line 2: Years of experience in specific field
   - Line 3: Publication/research achievement (if applicable)

5. **Generate professional `email`**:
   - Format: `firstname.lastname@z-beam.com`
   - Use lowercase, hyphenate multi-part names

6. **Create author profile `url`**:
   - Format: `https://z-beam.com/authors/[firstname-lastname]`
   - Use lowercase, hyphenate spaces

7. **Add `sameAs` if plausible**:
   - ORCID for researchers with Ph.D.
   - Google Scholar for published researchers
   - LinkedIn for all professional authors
   - Use placeholder IDs (will be replaced with real data later)

## Example Transformations

### BEFORE (Current):
```yaml
author:
  id: 2
  name: Alessandro Moretti
  country: Italy
  title: Ph.D.
  sex: m
  expertise: Laser-Based Additive Manufacturing
  image: /images/author/alessandro-moretti.jpg
```

### AFTER (Enhanced):
```yaml
author:
  id: 2
  name: Alessandro Moretti
  country: Italy
  title: Ph.D.
  sex: m
  jobTitle: Senior Materials Engineer
  expertise:
    - Laser-Based Additive Manufacturing
    - Ceramic Materials Processing
    - Surface Engineering
    - High-Temperature Materials
  affiliation:
    name: Technical University of Milano
    type: EducationalOrganization
  credentials:
    - Ph.D. Materials Science, TU Milano, 2015
    - 10+ years industrial ceramics experience
    - Published researcher in laser processing
  email: alessandro.moretti@z-beam.com
  image: /images/author/alessandro-moretti.jpg
  url: https://z-beam.com/authors/alessandro-moretti
  sameAs:
    - https://orcid.org/0000-0002-1234-5678
    - https://scholar.google.com/citations?user=abc123
    - https://linkedin.com/in/alessandro-moretti
```

## E-E-A-T Impact Priorities

**Highest Impact** (implement these first):
1. ✅ `expertise` as array with 3-5 items
2. ✅ `jobTitle` with specific professional role
3. ✅ `credentials` array with degree + experience
4. ✅ `affiliation` with institution

**High Impact** (add when available):
5. `sameAs` array (ORCID, Google Scholar, LinkedIn)
6. `alumniOf` if different from current affiliation

**Medium Impact** (nice to have):
7. Professional `email` and `url`

## Expected Schema.org Output

This YAML structure will generate the following JSON-LD:

```json
{
  "@type": "Person",
  "name": "Alessandro Moretti",
  "jobTitle": "Senior Materials Engineer",
  "knowsAbout": [
    "Laser-Based Additive Manufacturing",
    "Ceramic Materials Processing",
    "Surface Engineering",
    "High-Temperature Materials"
  ],
  "affiliation": {
    "@type": "EducationalOrganization",
    "name": "Technical University of Milano"
  },
  "email": "alessandro.moretti@z-beam.com",
  "url": "https://z-beam.com/authors/alessandro-moretti",
  "sameAs": [
    "https://orcid.org/0000-0002-1234-5678",
    "https://scholar.google.com/citations?user=abc123",
    "https://linkedin.com/in/alessandro-moretti"
  ]
}
```

## Implementation Notes

- **Backward Compatible**: Existing single-string `expertise` values will continue to work
- **Already Wired**: P0 schema enhancements already handle `knowsAbout` arrays automatically
- **No Code Changes**: Schema generators will automatically pick up new fields
- **Immediate Impact**: E-E-A-T score improvement upon redeployment

## Quality Checks

For each generated author block, verify:
- [ ] `expertise` is an array with 3-5 relevant items
- [ ] `jobTitle` matches author's academic level and material category
- [ ] `credentials` includes both education and experience
- [ ] `affiliation` is appropriate for author's background
- [ ] `email` follows firstname.lastname@z-beam.com format
- [ ] `url` follows /authors/firstname-lastname pattern
- [ ] `sameAs` includes at least 1-2 plausible profile URLs

## Target Materials (Priority Order)

Generate enhanced author data for these high-traffic materials first:
1. Aluminum
2. Stainless Steel
3. Titanium
4. Copper
5. Alumina (Ceramic)
6. Brass
7. Bronze
8. Silicon
9. Gold
10. Silver

---

**Expected Result**: E-E-A-T score improvement from 17% to 35-50%+ after regenerating frontmatter with enhanced author data.
