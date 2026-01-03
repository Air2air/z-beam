# Backend Instructions: Collapsible Data Normalization

**Target Audience:** Backend Development Team  
**Priority:** Medium  
**Estimated Effort:** 2-3 weeks  
**Date:** January 3, 2026

---

## 🎯 Objective

Provide normalized data structures for collapsible UI components, moving transformation logic from frontend to backend for better performance and maintainability.

---

## 📋 Current State Analysis

### ✅ Already Working (No Changes Needed)

**Materials:**
- `faq` array → Ready for FAQPanel component
- `micro.before` / `micro.after` → Ready for display
- All metadata fields properly structured

**Contaminants:**
- `relationships.safety` → Ready for SafetyDataPanel
- Nested structure with `presentation: "card"` pattern

### ⚠️ Needs Backend Implementation

**Missing Fields for Full Collapsible Support:**
1. `expert_answers` - For ExpertAnswersPanel
2. `prevention` - For PreventionPanel
3. `industry_applications` - For IndustryApplicationsPanel (check if exists)

---

## 📐 Unified Schema Definition

### Base Structure (All Collapsible Sections)

```yaml
section_name:
  presentation: "collapsible"  # Always use "collapsible" for these components
  sectionMetadata:
    section_title: string          # Required: Display title
    section_description: string    # Optional: Brief description
    icon: string                   # Optional: Icon identifier
    order: integer                 # Optional: Display order (10, 20, 30...)
  options:
    autoOpenFirst: boolean         # Optional: Auto-open first item
    autoOpenAccepted: boolean      # Optional: Auto-open first "accepted" item
    sortBy: string                 # Optional: "severity" | "priority" | "order" | "none"
  items:                           # Required: Array of generic objects
    - # Flexible structure - any key-value pairs
```

---

## 🔧 Implementation Guide by Section

### 1. Expert Answers / Q&A

**Add to Materials:**

```yaml
expert_answers:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "Expert Troubleshooting: {material_name}"
    section_description: "Professional answers from verified laser cleaning experts"
    icon: "expert"
    order: 85
  options:
    autoOpenAccepted: true
    sortBy: "none"
  items:
    - question: "Why does aluminum oxidize after laser cleaning?"
      answer: |
        Aluminum is highly reactive with oxygen...
        
        **Solution:** Apply protective coating immediately after cleaning.
      expert:
        name: "Dr. Sarah Chen"
        credentials: "PhD Materials Science"
        affiliation: "MIT Laser Research Lab"
        expertise: ["Aerospace Materials", "Surface Treatment"]
      category: "Surface Quality"
      severity: "medium"
      acceptedAnswer: true
      upvoteCount: 47
      dateAnswered: "2025-12-15"
      solutions:
        - "Apply protective coating within 30 minutes"
        - "Use nitrogen purge during processing"
      relatedTopics: ["oxidation", "surface_treatment"]
      lastReviewed: "2025-12-20"
```

**Key Fields:**
- `question` (required): Question text
- `answer` (required): Answer text with markdown support
- `expert` (optional): Expert credentials object
- `category` (optional): Topic categorization
- `severity` (optional): "low" | "medium" | "high" | "critical"
- `acceptedAnswer` (optional): Boolean for best answer
- `solutions` (optional): Array of solution strings
- `relatedTopics` (optional): Array of related topic IDs

---

### 2. Prevention Strategies

**Add to Materials:**

```yaml
prevention:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "Prevention Strategies"
    section_description: "Best practices for contamination prevention"
    icon: "prevention"
    order: 70
  options:
    autoOpenFirst: true
    sortBy: "severity"
  items:
    - category: "Surface Preparation"
      challenge: "Incomplete removal of oxidation layer"
      description: "Oxide layers thicker than 50µm can shield underlying contaminants, reducing cleaning effectiveness."
      severity: "high"
      solutions:
        - "Pre-clean with mechanical abrasion for thick oxides (>50µm)"
        - "Increase pulse energy by 20-30% for oxide penetration"
        - "Use multiple passes with progressive power increase"
      prevention:
        - "Store materials in controlled humidity (<40% RH)"
        - "Apply temporary protective coating before storage"
        - "Implement FIFO inventory system to minimize aging"
      relatedChallenges: ["surface_roughness", "heat_affected_zone"]
```

**Key Fields:**
- `category` (required): Category name
- `challenge` (required): Challenge description
- `description` (optional): Detailed impact explanation
- `severity` (optional): "low" | "medium" | "high" | "critical"
- `solutions` (optional): Array of solution strings
- `prevention` (optional): Array of prevention tips
- `relatedChallenges` (optional): Array of related challenge IDs

---

### 3. Industry Applications

**Add to Materials:**

```yaml
industry_applications:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "{material_name} Industry Applications"
    section_description: "Common uses across industries"
    icon: "layers"
    order: 50
  options:
    autoOpenFirst: false
  items:
    - applications:
        - id: "automotive-manufacturing"
          name: "Automotive Manufacturing"
          description: "Pre-weld cleaning of body panels and frame components"
        - id: "shipbuilding"
          name: "Shipbuilding & Marine"
          description: "Hull preparation and maintenance coating removal"
        - id: "pipeline-maintenance"
          name: "Pipeline Maintenance"
          description: "Corrosion removal and surface preparation"
```

**Key Fields:**
- `applications` (required): Array of application objects
  - `id` (required): Unique identifier (kebab-case)
  - `name` (required): Display name
  - `description` (optional): Use case description

---

### 4. Safety Data (Contaminants)

**Already Correct Structure - Reference Example:**

```yaml
relationships:
  safety:
    fire_explosion_risk:
      presentation: "card"
      items:
        - severity: "low"
          description: "Minimal fire risk with standard precautions..."
          mitigation:
            - "Maintain standard fire watch protocols"
            - "Keep fire extinguisher within 10 meters"
          icon: "flame"
    
    toxic_gas_risk:
      presentation: "card"
      items:
        - severity: "critical"
          description: "Lead fumes generated during ablation..."
          primaryHazards:
            - "Lead oxide fumes (PbO)"
            - "Lead metal vapor"
          mitigation:
            - "Use HEPA filtration with 99.97% efficiency"
            - "Monitor air quality continuously"
          icon: "alert-triangle"
```

**Note:** This structure already works with SafetyDataPanel - no changes needed.

---

## 🚀 Implementation Steps

### Phase 1: Database Schema Updates (Week 1)

1. **Add new fields to database:**
   ```sql
   ALTER TABLE materials ADD COLUMN expert_answers JSONB;
   ALTER TABLE materials ADD COLUMN prevention JSONB;
   ALTER TABLE materials ADD COLUMN industry_applications JSONB;
   ```

2. **Create validation schemas:**
   - Validate `presentation: "collapsible"`
   - Validate required fields: `sectionMetadata.section_title`, `items`
   - Items can be any structure (no strict validation)

3. **Add database indexes:**
   ```sql
   CREATE INDEX idx_materials_expert_answers ON materials USING GIN (expert_answers);
   CREATE INDEX idx_materials_prevention ON materials USING GIN (prevention);
   ```

### Phase 2: Data Migration (Week 1-2)

1. **Audit existing data:**
   - Identify materials that need expert_answers
   - Identify materials that need prevention strategies
   - Map existing FAQ to new structure if needed

2. **Create migration scripts:**
   ```python
   def migrate_expert_answers(material_id):
       """Convert existing Q&A data to collapsible format"""
       return {
           "presentation": "collapsible",
           "sectionMetadata": {
               "section_title": f"Expert Troubleshooting: {material.name}",
               "section_description": "Professional answers from verified experts",
               "icon": "expert",
               "order": 85
           },
           "items": [/* transformed items */]
       }
   ```

3. **Populate sample data:**
   - Start with 5-10 high-priority materials
   - Get content team to provide expert answers
   - Validate output matches schema

### Phase 3: API Updates (Week 2)

1. **Add new endpoints (optional):**
   ```
   GET /api/materials/{id}/sections/collapsible/expert_answers
   GET /api/materials/{id}/sections/collapsible/prevention
   GET /api/materials/{id}/sections/collapsible/industry_applications
   ```

2. **Update existing endpoints:**
   - Include new fields in `/api/materials/{id}` response
   - Ensure proper JSON serialization
   - Add caching for collapsible sections

3. **API Response Format:**
   ```json
   {
     "id": "aluminum-laser-cleaning",
     "name": "Aluminum",
     "expert_answers": {
       "presentation": "collapsible",
       "sectionMetadata": { /* ... */ },
       "items": [ /* ... */ ]
     },
     "prevention": {
       "presentation": "collapsible",
       "sectionMetadata": { /* ... */ },
       "items": [ /* ... */ ]
     }
   }
   ```

### Phase 4: Testing & Validation (Week 3)

1. **Unit tests:**
   - Test JSON schema validation
   - Test data transformation
   - Test API serialization

2. **Integration tests:**
   - Test full material retrieval with collapsible sections
   - Test caching behavior
   - Test error handling (missing sections)

3. **Performance tests:**
   - Measure response time with collapsible data
   - Test with large items arrays (100+ items)
   - Optimize queries if needed

---

## 📊 Data Validation Rules

### Required Validation

```python
from jsonschema import validate

collapsible_schema = {
    "type": "object",
    "required": ["presentation", "sectionMetadata", "items"],
    "properties": {
        "presentation": {
            "type": "string",
            "enum": ["collapsible"]
        },
        "sectionMetadata": {
            "type": "object",
            "required": ["section_title"],
            "properties": {
                "section_title": {"type": "string", "minLength": 1},
                "section_description": {"type": "string"},
                "icon": {"type": "string"},
                "order": {"type": "integer"}
            }
        },
        "items": {
            "type": "array",
            "minItems": 1,
            "items": {"type": "object"}  # Flexible - no strict schema
        },
        "options": {
            "type": "object",
            "properties": {
                "autoOpenFirst": {"type": "boolean"},
                "autoOpenAccepted": {"type": "boolean"},
                "sortBy": {"type": "string", "enum": ["severity", "priority", "order", "none"]}
            }
        }
    }
}
```

### Optional Validation

- Severity levels: "low", "medium", "high", "critical"
- Icon identifiers: Document valid icon names
- Date formats: ISO 8601 (YYYY-MM-DD)

---

## 🔍 Quality Checklist

Before marking implementation complete:

- [ ] Database fields created and indexed
- [ ] Sample data populated for 5+ materials
- [ ] API returns correct JSON structure
- [ ] JSON schema validation passes
- [ ] Frontend components render correctly
- [ ] Performance benchmarks met (<100ms response time)
- [ ] Documentation updated
- [ ] Migration scripts tested on staging
- [ ] Rollback plan documented

---

## 📚 Example: Complete Material with All Sections

```yaml
id: aluminum-laser-cleaning
name: Aluminum
category: metal

# Existing fields (keep as-is)
faq:
  - question: "What makes aluminum suitable for laser cleaning?"
    answer: "Lightweight with low density..."

# NEW: Expert answers
expert_answers:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "Expert Troubleshooting: Aluminum"
    section_description: "Professional answers from verified experts"
    icon: "expert"
    order: 85
  options:
    autoOpenAccepted: true
  items:
    - question: "Why does aluminum oxidize after cleaning?"
      answer: "Aluminum is highly reactive..."
      expert:
        name: "Dr. Sarah Chen"
        credentials: "PhD Materials Science"
      severity: "medium"
      acceptedAnswer: true

# NEW: Prevention strategies
prevention:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "Prevention Strategies"
    icon: "prevention"
    order: 70
  options:
    sortBy: "severity"
  items:
    - category: "Surface Preparation"
      challenge: "Incomplete oxide removal"
      severity: "high"
      solutions:
        - "Pre-clean with mechanical abrasion"
        - "Increase pulse energy by 20-30%"

# NEW: Industry applications
industry_applications:
  presentation: "collapsible"
  sectionMetadata:
    section_title: "Aluminum Industry Applications"
    icon: "layers"
    order: 50
  items:
    - applications:
        - id: "automotive"
          name: "Automotive Manufacturing"
          description: "Pre-weld cleaning of panels"
```

---

## 🎯 Success Metrics

**Target Performance:**
- API response time: <100ms (including collapsible data)
- Database query time: <50ms
- JSON serialization: <10ms

**Data Coverage:**
- Expert answers: 80% of materials by Q2 2026
- Prevention: 60% of materials by Q2 2026
- Industry applications: 90% of materials by Q2 2026

**Quality Metrics:**
- JSON validation: 100% pass rate
- Frontend rendering: 0 errors
- User satisfaction: >90% (collapsible UI clarity)

---

## 🚨 Important Notes

### Flexibility is Key

**Items array is intentionally flexible:**
- No strict schema enforcement on `items`
- Backend can evolve structure without breaking frontend
- Frontend adapts to whatever fields are present
- Missing optional fields degrade gracefully

### Backward Compatibility

**Existing data must continue to work:**
- FAQ structure already correct
- Safety data structure already correct
- New fields are additive only
- No breaking changes to existing APIs

### Content Team Coordination

**New fields need content:**
- Work with content team to populate expert_answers
- Subject matter experts needed for prevention strategies
- Industry research for applications
- Budget 2-3 weeks for content creation

---

## 📞 Questions & Support

**Technical Questions:**
- Frontend implementation: See `app/components/Collapsible/Collapsible.tsx`
- Test examples: See `tests/components/ExpertAnswersPanel.test.tsx`
- Complete schema doc: This file

**Content Questions:**
- Sample expert answers: See examples above
- Format guidelines: Markdown supported in all text fields
- Icon options: Document valid icon identifiers

**Timeline Concerns:**
- Can implement incrementally (one section at a time)
- Expert answers can launch before prevention/applications
- Pilot with 5 materials before full rollout

---

## ✅ Ready to Start?

1. **Review this document with team**
2. **Estimate effort for your stack**
3. **Create tickets for 3 phases**
4. **Start with Phase 1 (database schema)**
5. **Coordinate with content team for sample data**

**Questions?** Contact frontend team for clarification on component requirements.

---

**Document Version:** 1.0  
**Last Updated:** January 3, 2026  
**Status:** Ready for Implementation
