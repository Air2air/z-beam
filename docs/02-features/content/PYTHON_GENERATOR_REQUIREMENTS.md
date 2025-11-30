# Python Generator Requirements - Settings Content Type Data

## Overview
External Python script to research and populate settings content data for 132 materials, creating backlink-worthy authority content.

## 🏗️ Implementation Standards

**CRITICAL: Generated YAML must support materials page implementation pattern**

### Author Metadata (Required in Every YAML)
All generated settings files MUST include complete author metadata with E-E-A-T signals:

```yaml
author:
  name: "Todd Dunning"
  jobTitle: "Laser Systems Engineer"  # Required for E-E-A-T credibility
  description: "Industrial laser specialist with 15+ years experience in laser cleaning applications"
  expertise:
    - "Laser cleaning process optimization"
    - "Material-specific parameter development"
    - "Industrial surface treatment"
  url: "https://z-beam.com/about"
  email: "todd@z-beam.com"
  image: "/images/authors/todd-dunning.jpg"
```

**Why Required:**
- Google E-E-A-T ranking factor
- Establishes content credibility
- Standardized across ALL content types (materials, settings, pages)
- Automatically rendered by Layout component
- Critical for backlink trust signals

### Layout Integration Requirements
Generated YAML must be compatible with:
- **Layout component**: Automatic inclusion of Nav, Title, Footer, Breadcrumbs, DateMetadata, Author
- **SectionContainer**: All major sections use this wrapper
- **PropertyBars component**: For displaying parameters/metrics
- **MarkdownRenderer**: For markdown content fields

### Content Structure Standards
- Use SectionContainer patterns for all major sections
- Follow CONTAINER_STYLES and SPACER_CLASSES conventions
- Match materials page component hierarchy
- Support Hero component rendering with images/titles

## Input/Output

### Input
- Material name (e.g., "Aluminum")
- Category (e.g., "metal")  
- Subcategory (e.g., "non-ferrous")
- Reference to existing material YAML file (for context)

### Output
- New settings YAML file in `/frontmatter/settings/` directory
- File naming: `{material-name}-laser-cleaning.yaml`
- Complete settings structure with research citations
- Material-specific challenges categorized
- Troubleshooting guides
- Quality metrics and expected outcomes
- Template: `/content/settings/_TEMPLATE_settings.yaml`

## Data Sources & APIs

### 1. **Scientific Literature (Primary Research)**

#### CrossRef API (Free, DOI Resolution)
```python
# Example: Search for laser cleaning papers
url = "https://api.crossref.org/works"
params = {
    "query": "laser cleaning aluminum parameters",
    "filter": "type:journal-article,from-pub-date:2015",
    "rows": 20,
    "sort": "relevance"
}
```

**Retrieve:**
- Author names
- Publication year
- Journal name, volume, issue
- DOI
- Abstract (for key findings extraction)

#### Semantic Scholar API (Free, AI-powered)
```python
url = f"https://api.semanticscholar.org/graph/v1/paper/search"
params = {
    "query": "aluminum laser cleaning wavelength selection",
    "fields": "title,authors,year,abstract,citationCount,doi",
    "limit": 10
}
```

**Retrieve:**
- Highly-cited papers (credibility)
- Citation count (authority signal)
- Paper abstracts for LLM processing

#### PubMed/PMC (Free, Biomedical/Materials)
```python
from Bio import Entrez
Entrez.email = "info@z-beam.com"
handle = Entrez.esearch(
    db="pubmed",
    term="laser ablation aluminum oxide",
    retmax=20
)
```

### 2. **Material Property Databases**

#### Materials Project API (Free, Computational Data)
```python
from mp_api.client import MPRester
mpr = MPRester("YOUR_API_KEY")
# Get thermal conductivity, melting point, etc.
docs = mpr.materials.summary.search(formula="Al")
```

**Retrieve:**
- Thermal conductivity
- Melting point
- Optical properties (absorption)
- Crystal structure

#### MatWeb (Web Scraping, Property Tables)
```
http://www.matweb.com/search/DataSheet.aspx?MatGUID=[material_guid]
```

**Retrieve:**
- Mechanical properties
- Thermal properties
- Typical applications

### 3. **Standards & Regulatory (Web Scraping + Manual)**

#### OSHA Standards Database
```
https://www.osha.gov/laws-regs/regulations/standardnumber/[standard_number]
```

#### NFPA Combustible Dust Standards
```
https://www.nfpa.org/codes-and-standards/[code_number]
```

### 4. **LLM-Assisted Research Synthesis**

#### OpenAI GPT-4 (Paid, Synthesis & Extraction)
```python
import openai
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{
        "role": "system",
        "content": "You are a materials science researcher specializing in laser-material interactions."
    }, {
        "role": "user",
        "content": f"""
        Analyze these 5 papers on {material} laser cleaning:
        {paper_abstracts}
        
        Extract:
        1. Optimal power range with justification
        2. Wavelength selection rationale
        3. Material-specific challenges
        4. Damage mechanisms
        
        Provide citations for each claim.
        """
    }]
)
```

**Use for:**
- Synthesizing multiple papers into coherent rationale
- Extracting key findings from abstracts
- Generating material-specific challenge descriptions
- Creating troubleshooting scenarios

#### Anthropic Claude (Paid, Long-Context Analysis)
Use for analyzing full-text papers (100K token context)

## Research Pipeline

### Phase 1: Material Property Lookup
```python
def get_material_properties(material_name):
    """
    Query material databases for physical properties
    Returns: dict with material_characteristics containing thermal, optical, mechanical properties
    """
    properties = {}
    
    # Materials Project API
    properties['thermal_conductivity'] = query_materials_project(material_name)
    properties['melting_point'] = query_materials_project(material_name)
    
    # MatWeb scraping (backup)
    if not properties['thermal_conductivity']:
        properties.update(scrape_matweb(material_name))
    
    return properties
```

### Phase 2: Literature Search & Citation Extraction
```python
def research_laser_parameters(material_name):
    """
    Search scientific literature for laser cleaning parameters
    Returns: list of dicts with citation info + key findings
    """
    citations = []
    
    # CrossRef search
    papers = search_crossref(f"{material_name} laser cleaning parameters")
    
    # Semantic Scholar for highly-cited papers
    authoritative_papers = search_semantic_scholar(
        f"{material_name} laser ablation wavelength",
        min_citations=10
    )
    
    # Extract key findings using LLM
    for paper in papers[:5]:  # Top 5 most relevant
        abstract = get_abstract(paper['doi'])
        key_finding = extract_key_finding_with_llm(
            material_name, 
            abstract, 
            parameter="power range"
        )
        
        citations.append({
            'author': paper['author'],
            'year': paper['year'],
            'title': paper['title'],
            'journal': paper['journal'],
            'doi': paper['doi'],
            'key_finding': key_finding
        })
    
    return citations
```

### Phase 3: Challenge Identification & Categorization
```python
def identify_material_challenges(material_name, properties):
    """
    Identify material-specific challenges using:
    1. Material properties (thermal, optical, etc.)
    2. Literature review findings
    3. LLM synthesis
    
    Returns: categorized challenges with solutions
    """
    challenges = {
        'surface_characteristics': [],
        'thermal_management': [],
        'contamination_challenges': [],
        'safety_compliance': []
    }
    
    # Rule-based challenge detection
    if properties['melting_point'] < 1000:
        challenges['thermal_management'].append({
            'challenge': f"Low melting point ({properties['melting_point']}°C)",
            'severity': 'critical',
            'impact': generate_impact_description_llm(material_name, 'low_melting_point'),
            'solution': generate_solution_llm(material_name, 'low_melting_point'),
            'parameter_adjustments': recommend_parameters_llm(material_name, 'low_melting_point')
        })
    
    # LLM-based challenge extraction from literature
    literature_challenges = extract_challenges_from_papers_llm(
        material_name,
        papers
    )
    
    # Merge and categorize
    challenges = merge_challenges(challenges, literature_challenges)
    
    return challenges
```

### Phase 4: Parameter Calculation & Optimization
```python
def calculate_optimal_parameters(material_name, properties, citations):
    """
    Calculate optimal parameter ranges based on:
    1. Material properties (thermal diffusivity, absorption, etc.)
    2. Literature-reported values
    3. Physical models (thermal relaxation, damage threshold)
    
    Returns: dict with parameter values + rationales
    """
    parameters = {}
    
    # Power range calculation
    thermal_conductivity = properties['thermal_conductivity']
    absorption_coefficient = properties.get('absorption_1064nm', 0.1)
    
    # Simplified model (real implementation would be more complex)
    optimal_power = calculate_power_from_thermal_model(
        thermal_conductivity,
        absorption_coefficient,
        target_fluence=3.0  # J/cm²
    )
    
    # Cross-reference with literature
    literature_power_range = extract_parameter_from_citations(
        citations, 
        parameter='power'
    )
    
    # Synthesize recommendation
    parameters['powerRange'] = {
        'value': optimal_power,
        'min': optimal_power * 0.5,
        'max': optimal_power * 1.5,
        'optimal_range': [optimal_power * 0.8, optimal_power * 1.2],
        'rationale': generate_power_rationale_llm(
            material_name,
            thermal_conductivity,
            literature_power_range
        ),
        'research_basis': {
            'citations': filter_relevant_citations(citations, 'power'),
            'validation': generate_validation_metadata()
        }
    }
    
    # Repeat for wavelength, spot size, etc.
    
    return parameters
```

### Phase 5: Troubleshooting Guide Generation
```python
def generate_troubleshooting_guide(material_name, parameters, challenges):
    """
    Generate common issues and solutions based on:
    1. Material challenges
    2. Parameter sensitivities
    3. Literature case studies
    4. LLM scenario generation
    
    Returns: list of troubleshooting scenarios
    """
    issues = []
    
    # Template-based issues (common across materials)
    issues.extend(generate_common_issues(parameters))
    
    # Material-specific issues from challenges
    for challenge_category in challenges.values():
        for challenge in challenge_category:
            if challenge['severity'] in ['critical', 'high']:
                issue = generate_issue_from_challenge_llm(
                    material_name,
                    challenge
                )
                issues.append(issue)
    
    # LLM-generated troubleshooting scenarios
    literature_issues = extract_failure_modes_from_papers_llm(
        material_name,
        papers
    )
    issues.extend(literature_issues)
    
    return issues
```

### Phase 6: YAML Generation & Validation
```python
def generate_enhanced_yaml(material_name, data):
    """
    Generate complete YAML file with enhanced machine settings
    Validates against template schema
    """
    yaml_content = {
        'machineSettings': {
            'essential_parameters': data['parameters'],
            'material_challenges': data['challenges'],
            'process_parameters': generate_process_params(data),
            'equipment_requirements': generate_equipment_reqs(data),
            'expected_outcomes': generate_outcomes(data),
            'common_issues': data['troubleshooting'],
            'parameter_interactions': generate_interactions(data)
        },
        'seo_settings_page': generate_seo_metadata(material_name)
    }
    
    # Validate against schema
    validate_yaml_structure(yaml_content, template='_TEMPLATE_settings.yaml')
    
    # Write to file
    output_path = f"frontmatter/settings/{material_name.lower()}-laser-cleaning.yaml"
    with open(output_path, 'w') as f:
        yaml.dump(yaml_content, f, default_flow_style=False, allow_unicode=True)
    
    return output_path
```

## Configuration & Setup

### Environment Variables
```bash
# API Keys
export CROSSREF_PLUS_API_TOKEN="optional_for_rate_limits"
export SEMANTIC_SCHOLAR_API_KEY="optional"
export MATERIALS_PROJECT_API_KEY="required"
export OPENAI_API_KEY="required"
export ANTHROPIC_API_KEY="optional"

# Rate Limiting
export MAX_REQUESTS_PER_MINUTE=10
export CACHE_DIR="./research_cache"

# Quality Control
export MIN_CITATION_COUNT=5  # Minimum papers per material
export MIN_CONFIDENCE_LEVEL=80  # Percentage
export REQUIRE_DOI=true  # Only include papers with DOI
```

### Dependencies
```requirements.txt
requests>=2.31.0
beautifulsoup4>=4.12.0
openai>=1.0.0
anthropic>=0.7.0
pyyaml>=6.0
biopython>=1.81  # For PubMed access
mp-api>=0.33.0   # Materials Project
crossref-commons>=0.0.7
scholarly>=1.7.0  # Google Scholar (use sparingly)
```

## Quality Control & Validation

### Citation Quality Checks
```python
def validate_citation_quality(citation):
    """
    Ensure citations meet quality standards for authority page
    """
    checks = {
        'has_doi': bool(citation.get('doi')),
        'recent': citation.get('year', 0) >= 2015,
        'peer_reviewed': check_peer_reviewed(citation.get('journal')),
        'relevant': calculate_relevance_score(citation) > 0.7,
        'cited': citation.get('citation_count', 0) >= 5
    }
    
    return all(checks.values()), checks
```

### Parameter Validation
```python
def validate_parameter_ranges(parameters, material_name):
    """
    Sanity-check parameter values against physical limits
    """
    validations = []
    
    # Power range check
    power = parameters['powerRange']['value']
    if not (10 <= power <= 1000):
        validations.append(f"WARNING: Power {power}W outside typical range")
    
    # Fluence vs damage threshold
    fluence = parameters['energyDensity']['value']
    damage_threshold = parameters['energyDensity']['threshold_data']['substrate_damage_threshold']
    if fluence >= damage_threshold:
        validations.append(f"ERROR: Fluence {fluence} exceeds damage threshold {damage_threshold}")
    
    return validations
```

### Content Completeness Check
```python
def check_completeness(yaml_data):
    """
    Ensure all required fields are populated
    Returns: (is_complete, missing_fields)
    """
    required_fields = [
        'machineSettings.essential_parameters.powerRange.rationale',
        'machineSettings.material_challenges.surface_characteristics',
        'machineSettings.common_issues',
        # ... full list from template
    ]
    
    missing = []
    for field_path in required_fields:
        if not get_nested_value(yaml_data, field_path):
            missing.append(field_path)
    
    return len(missing) == 0, missing
```

## Execution Strategy

### Batch Processing
```python
# Process materials in priority order
priority_materials = [
    'aluminum', 'stainless-steel', 'titanium',  # High-traffic materials
    'copper', 'brass', 'bronze',
    # ... remaining 126 materials
]

for material in priority_materials:
    print(f"Processing {material}...")
    
    try:
        # Full research pipeline
        properties = get_material_properties(material)
        citations = research_laser_parameters(material)
        challenges = identify_material_challenges(material, properties)
        parameters = calculate_optimal_parameters(material, properties, citations)
        troubleshooting = generate_troubleshooting_guide(material, parameters, challenges)
        
        # Generate YAML
        yaml_path = generate_enhanced_yaml(material, {
            'properties': properties,
            'parameters': parameters,
            'challenges': challenges,
            'troubleshooting': troubleshooting,
            'citations': citations
        })
        
        print(f"✓ Generated: {yaml_path}")
        
        # Quality checks
        is_valid, issues = validate_output(yaml_path)
        if not is_valid:
            print(f"⚠ Validation issues: {issues}")
        
    except Exception as e:
        print(f"✗ Error processing {material}: {e}")
        continue
    
    # Rate limiting
    time.sleep(10)  # 10 seconds between materials
```

### Caching Strategy
```python
# Cache API responses to avoid redundant requests
import hashlib
import json

def cached_api_call(api_function, *args, **kwargs):
    """
    Cache API responses based on function + arguments
    """
    cache_key = hashlib.md5(
        f"{api_function.__name__}:{args}:{kwargs}".encode()
    ).hexdigest()
    
    cache_file = f"{CACHE_DIR}/{cache_key}.json"
    
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    
    result = api_function(*args, **kwargs)
    
    with open(cache_file, 'w') as f:
        json.dump(result, f)
    
    return result
```

## Human Review Process

### Manual Verification Points
1. **Citation accuracy** (10% random sample)
2. **Parameter reasonableness** (engineering review)
3. **Challenge descriptions** (clarity and completeness)
4. **Troubleshooting scenarios** (practical utility)

### Approval Workflow
```
Generated YAML → Automated Validation → Expert Review → Production Deployment
                                              ↓
                                    Flag for Manual Correction
```

## Delivery

### Output Format
```
/frontmatter/settings/
├── aluminum-laser-cleaning.yaml
├── copper-laser-cleaning.yaml
├── titanium-laser-cleaning.yaml
└── ... (132 total settings files)

/docs/research-metadata/
├── aluminum-research-log.json (detailed research trail)
├── copper-research-log.json
└── ...

/docs/quality-reports/
└── batch-validation-report.md (completeness, quality scores)
```

### Research Log Format (JSON)
```json
{
  "material": "Aluminum",
  "research_date": "2025-11-10",
  "data_sources": {
    "crossref_papers": 15,
    "semantic_scholar_papers": 8,
    "materials_project_properties": true,
    "matweb_properties": false
  },
  "citations_found": 12,
  "citations_included": 5,
  "llm_synthesis_calls": 23,
  "validation_passed": true,
  "manual_review_required": false,
  "confidence_score": 87
}
```

## Timeline Estimate

- **Setup & Testing**: 1 week
- **Per Material Processing**: 2-4 hours (mostly API waits + LLM calls)
- **132 Materials**: ~400 hours (16 weeks at 2 materials/day)
- **Manual Review**: 2 weeks (spot checks + corrections)
- **Total**: ~20 weeks for complete dataset

## Cost Estimate

### API Costs (per material)
- OpenAI GPT-4: ~$2-5 (synthesis + extraction)
- Materials Project: Free
- CrossRef/Semantic Scholar: Free
- Web scraping: Free

**Total per material**: $2-5
**Total for 132 materials**: $264-660

### Human Review
- 10% manual review: 13 materials × 2 hours = 26 hours
- Full editorial pass: 132 materials × 15 min = 33 hours
- **Total review time**: ~60 hours

## Next Steps

1. ✅ Approve data model and template
2. ⏳ Build Python research pipeline
3. ⏳ Test on 3 reference materials (Aluminum, Steel, Copper)
4. ⏳ Review output quality and iterate
5. ⏳ Batch process remaining 129 materials
6. ⏳ Manual quality review
7. ⏳ Deploy enhanced /settings pages

**Ready to proceed with Python development?**
