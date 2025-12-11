# JSON-LD Example Output

**Updated**: November 4, 2025  
**Status**: Normalized across all page types

---

## 📑 Table of Contents

1. [Material Page JSON-LD](#material-page-json-ld) - 7-8 schemas via MaterialJsonLD
2. [Category Page JSON-LD](#category-page-json-ld) - 5 schemas via JsonLD
3. [Subcategory Page JSON-LD](#subcategory-page-json-ld) - 5 schemas via JsonLD

---

## Material Page JSON-LD

**Material**: Alabaster Laser Cleaning  
**Generated**: October 16, 2025  
**Component**: `<MaterialJsonLD article={article} slug="alabaster-laser-cleaning" />`

---

## 🎯 Generated JSON-LD Schema

This is what the MaterialJsonLD component automatically generates from the Alabaster frontmatter:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechnicalArticle",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#article",
      "headline": "Alabaster Laser Cleaning",
      "description": "Comprehensive analysis of laser cleaning applications for Alabaster, including material properties, optimal machine settings, and process parameters for safe and effective surface treatment.",
      "abstract": "Advanced laser surface treatment properties",
      "author": {
        "@type": "Person",
        "@id": "https://z-beam.com#author-2"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Z-Beam",
        "logo": {
          "@type": "ImageObject",
          "url": "https://z-beam.com/images/logo.png"
        }
      },
      "datePublished": "2025-10-15T14:42:17.034527",
      "dateModified": "2025-10-16T00:00:00Z",
      "url": "https://z-beam.com/alabaster-laser-cleaning",
      "image": {
        "@type": "ImageObject",
        "url": "https://z-beam.com/images/material/alabaster-laser-cleaning-hero.jpg",
        "micro": "High-resolution microscopy analysis reveals significant surface quality improvements. Pre-treatment examination shows extensive surface contamination and discoloration, with accumulated environmental pollutants and organic matter visible at 50x magnification. Post-laser cleaning analysis demonstrates restored natural translucency and color, with microscopic examination confirming gentle contaminant removal while preserving the delicate crystalline structure."
      },
      "about": [
        { "@type": "Thing", "name": "Cultural Heritage" },
        { "@type": "Thing", "name": "Museum Conservation" },
        { "@type": "Thing", "name": "Architectural Restoration" },
        { "@type": "Thing", "name": "Sculpture Cleaning" },
        { "@type": "Thing", "name": "Monument Preservation" },
        { "@type": "Thing", "name": "Decorative Arts" },
        { "@type": "Thing", "name": "Fine Art Conservation" },
        { "@type": "Thing", "name": "Historical Building Maintenance" },
        { "@type": "Thing", "name": "Archaeological Conservation" },
        { "@type": "Thing", "name": "Religious Artifact Restoration" }
      ],
      "articleBody": "High-resolution microscopy analysis reveals significant surface quality improvements. Pre-treatment examination shows extensive surface contamination and discoloration, with accumulated environmental pollutants and organic matter visible at 50x magnification. Post-laser cleaning analysis demonstrates restored natural translucency and color, with microscopic examination confirming gentle contaminant removal while preserving the delicate crystalline structure."
    },
    {
      "@type": "Product",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#material",
      "name": "Alabaster",
      "description": "Comprehensive analysis of laser cleaning applications for Alabaster",
      "category": "stone - mineral",
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "laserAbsorption",
          "value": 85.0,
          "unitText": "%",
          "description": "laserAbsorption from Materials.yaml",
          "minValue": 80.0,
          "maxValue": 90.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 92,
            "unitText": "%"
          },
          "citation": "Geological Survey Optical Properties Database"
        },
        {
          "@type": "PropertyValue",
          "name": "laserReflectivity",
          "value": 15.0,
          "unitText": "%",
          "description": "Calculated as (100 - absorption) to maintain physical accuracy. Verified through independent measurement cross-validation.",
          "minValue": 10.0,
          "maxValue": 20.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 92,
            "unitText": "%"
          },
          "citation": "Geological Survey Optical Properties Database"
        },
        {
          "@type": "PropertyValue",
          "name": "thermalDamageThreshold",
          "value": 3.5,
          "unitText": "J/cm²",
          "description": "thermalDamageThreshold from Materials.yaml",
          "minValue": 3.0,
          "maxValue": 4.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 88,
            "unitText": "%"
          },
          "citation": "Laser-Material Interaction Studies"
        },
        {
          "@type": "PropertyValue",
          "name": "ablationThreshold",
          "value": 2.8,
          "unitText": "J/cm²",
          "description": "ablationThreshold from Materials.yaml",
          "minValue": 2.5,
          "maxValue": 3.2,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 85,
            "unitText": "%"
          },
          "citation": "Laser Processing Research Database"
        },
        {
          "@type": "PropertyValue",
          "name": "heatAffectedZone",
          "value": 45.0,
          "unitText": "μm",
          "description": "heatAffectedZone from Materials.yaml",
          "minValue": 40.0,
          "maxValue": 50.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 82,
            "unitText": "%"
          },
          "citation": "Thermal Analysis Laboratory Data"
        },
        {
          "@type": "PropertyValue",
          "name": "surfaceRoughness",
          "value": 1.8,
          "unitText": "μm Ra",
          "description": "surfaceRoughness from Materials.yaml",
          "minValue": 1.5,
          "maxValue": 2.2,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 90,
            "unitText": "%"
          },
          "citation": "Surface Metrology Standards"
        },
        {
          "@type": "PropertyValue",
          "name": "thermalConductivity",
          "value": 2.5,
          "unitText": "W/m·K",
          "description": "thermalConductivity from Materials.yaml",
          "minValue": 2.0,
          "maxValue": 3.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 93,
            "unitText": "%"
          },
          "citation": "Materials Science Handbook"
        },
        {
          "@type": "PropertyValue",
          "name": "density",
          "value": 2300.0,
          "unitText": "kg/m³",
          "description": "density from Materials.yaml",
          "minValue": 2250.0,
          "maxValue": 2350.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 95,
            "unitText": "%"
          },
          "citation": "Geological Survey Material Database"
        },
        {
          "@type": "PropertyValue",
          "name": "specificHeatCapacity",
          "value": 880.0,
          "unitText": "J/kg·K",
          "description": "specificHeatCapacity from Materials.yaml",
          "minValue": 850.0,
          "maxValue": 910.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 87,
            "unitText": "%"
          },
          "citation": "Thermophysical Properties Reference"
        },
        {
          "@type": "PropertyValue",
          "name": "meltingPoint",
          "value": 1460.0,
          "unitText": "°C",
          "description": "meltingPoint from Materials.yaml",
          "minValue": 1440.0,
          "maxValue": 1480.0,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 91,
            "unitText": "%"
          },
          "citation": "Phase Transition Database"
        },
        {
          "@type": "PropertyValue",
          "name": "hardness",
          "value": 2.0,
          "unitText": "Mohs",
          "description": "hardness from Materials.yaml",
          "minValue": 1.5,
          "maxValue": 2.5,
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 94,
            "unitText": "%"
          },
          "citation": "Mineral Hardness Scale Reference"
        },
        {
          "@type": "PropertyValue",
          "name": "chemicalStability",
          "value": "Low",
          "description": "Alabaster shows low chemical stability, particularly vulnerable to acidic environments. The calcium sulfate composition reacts with atmospheric pollutants and moisture, requiring protective measures during laser cleaning to prevent chemical degradation.",
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 89,
            "unitText": "%"
          }
        },
        {
          "@type": "PropertyValue",
          "name": "porosityLevel",
          "value": "Medium",
          "description": "Medium porosity level in alabaster creates microscopic voids that can trap contaminants. This porous structure requires careful laser parameter selection to ensure effective cleaning without damaging the delicate crystalline matrix.",
          "additionalProperty": {
            "@type": "PropertyValue",
            "name": "Confidence Score",
            "value": 86,
            "unitText": "%"
          }
        }
      ],
      "sustainability": [
        {
          "@type": "DefinedTerm",
          "name": "Chemical Waste Elimination",
          "description": "Eliminates hazardous chemical waste streams from traditional alabaster cleaning processes",
          "value": "Up to 100% reduction in chemical cleaning agents"
        },
        {
          "@type": "DefinedTerm",
          "name": "Water Conservation",
          "description": "Minimizes water usage compared to wet cleaning methods",
          "value": "90-95% reduction in water consumption"
        },
        {
          "@type": "DefinedTerm",
          "name": "Energy Efficiency",
          "description": "Reduces energy consumption through targeted laser application",
          "value": "40% less energy vs. traditional cleaning"
        }
      ],
      "applicationCategory": [
        "Cultural Heritage",
        "Museum Conservation",
        "Architectural Restoration",
        "Sculpture Cleaning",
        "Monument Preservation",
        "Decorative Arts",
        "Fine Art Conservation",
        "Historical Building Maintenance",
        "Archaeological Conservation",
        "Religious Artifact Restoration"
      ]
    },
    {
      "@type": "HowTo",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#howto",
      "name": "How to Clean Alabaster with Laser",
      "description": "Step-by-step process for laser cleaning Alabaster",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Set Laser Power",
          "text": "Configure laser power to 90 W",
          "description": "Optimal average power for Alabaster surface cleaning, selected for gentle contaminant removal without thermal stress"
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Select Wavelength",
          "text": "Set wavelength to 1064 nm",
          "description": "Nd:YAG fundamental wavelength, providing optimal absorption for organic contaminant removal while minimizing substrate heating"
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Configure Spot Size",
          "text": "Set spot size to 100 μm",
          "description": "Focused beam diameter optimized for selective contaminant ablation with minimal heat accumulation in surrounding material"
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Set Scanning Speed",
          "text": "Configure scan speed to 50 mm/s",
          "description": "Linear scanning velocity providing uniform energy distribution and consistent cleaning results across treated areas"
        }
      ],
      "totalTime": "PT30M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "Variable"
      },
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Laser Cleaning System"
        },
        {
          "@type": "HowToSupply",
          "name": "Safety Equipment"
        },
        {
          "@type": "HowToSupply",
          "name": "Extraction System"
        }
      ],
      "expectedOutput": [
        {
          "@type": "DefinedTerm",
          "name": "Contaminant Removal Efficiency",
          "description": "Percentage of target contaminants successfully removed from the material surface",
          "value": "95-99.9% depending on application and material"
        },
        {
          "@type": "DefinedTerm",
          "name": "Surface Integrity Score",
          "description": "Quantitative assessment of surface preservation after laser treatment",
          "value": "Maintained at 98-100% of original condition"
        },
        {
          "@type": "DefinedTerm",
          "name": "Processing Time per Area",
          "description": "Time required to complete laser cleaning of a specified surface area",
          "value": "0.5-2 minutes per cm² depending on contamination level"
        },
        {
          "@type": "DefinedTerm",
          "name": "Color Restoration Uniformity",
          "description": "Consistency of color recovery across treated surface areas",
          "value": "±2% variation across treated area"
        }
      ]
    },
    {
      "@type": "Dataset",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#dataset",
      "name": "Alabaster Material Properties Dataset",
      "description": "Verified material property measurements for Alabaster laser processing",
      "creator": {
        "@type": "Organization",
        "name": "Z-Beam"
      },
      "dateModified": "2025-10-16T00:00:00Z",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "variableMeasured": [
        {
          "@type": "Observation",
          "measuredProperty": "laserAbsorption",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 85.0,
            "unitText": "%"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "laserReflectivity",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 15.0,
            "unitText": "%"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "thermalDamageThreshold",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 3.5,
            "unitText": "J/cm²"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "ablationThreshold",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 2.8,
            "unitText": "J/cm²"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "heatAffectedZone",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 45.0,
            "unitText": "μm"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "surfaceRoughness",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 1.8,
            "unitText": "μm Ra"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "thermalConductivity",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 2.5,
            "unitText": "W/m·K"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "density",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 2300.0,
            "unitText": "kg/m³"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "specificHeatCapacity",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 880.0,
            "unitText": "J/kg·K"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        },
        {
          "@type": "Observation",
          "measuredProperty": "meltingPoint",
          "measuredValue": {
            "@type": "QuantitativeValue",
            "value": 1460.0,
            "unitText": "°C"
          },
          "observationDate": "2025-10-15T15:43:02.558916"
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://z-beam.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "stone",
          "item": "https://z-beam.com/stone"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Alabaster Laser Cleaning",
          "item": "https://z-beam.com/alabaster-laser-cleaning"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://z-beam.com/alabaster-laser-cleaning",
      "name": "Alabaster Laser Cleaning",
      "description": "Comprehensive analysis of laser cleaning applications for Alabaster",
      "url": "https://z-beam.com/alabaster-laser-cleaning",
      "datePublished": "2025-10-15T14:42:17.034527",
      "dateModified": "2025-10-16T00:00:00Z",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://z-beam.com#website",
        "name": "Z-Beam",
        "url": "https://z-beam.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://z-beam.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    },
    {
      "@type": "Person",
      "@id": "https://z-beam.com#author-2",
      "name": "Alessandro Moretti",
      "jobTitle": "Ph.D.",
      "knowsAbout": "Laser-Based Additive Manufacturing",
      "nationality": "Italy",
      "image": "https://z-beam.com/images/authors/alessandro-moretti.jpg",
      "affiliation": {
        "@type": "Organization",
        "name": "Z-Beam"
      }
    },
    {
      "@type": "Certification",
      "@id": "https://z-beam.com/alabaster-laser-cleaning#certification",
      "name": "EN 15898:2019 - Conservation of Cultural Heritage Compliance",
      "description": "Conservation of cultural heritage - Main general terms and definitions for laser cleaning",
      "about": {
        "@type": "Organization",
        "name": "European Committee for Standardization (CEN)"
      }
    }
  ]
}
```

---

## 📊 Schema Breakdown

### 1. TechnicalArticle
- **Lines**: 6-58
- **Key Fields**: headline, author link, publisher, dates, image with micro
- **E-E-A-T**: Experience (applications), Expertise (abstract)

### 2. Product
- **Lines**: 59-325
- **Key Fields**: 13 material properties with confidence scores, sustainability benefits
- **E-E-A-T**: Authoritativeness (sources), Trustworthiness (confidence scores)

### 3. HowTo
- **Lines**: 326-404
- **Key Fields**: 4 steps from machineSettings, 4 expected outputs
- **E-E-A-T**: Experience (process documentation)

### 4. Dataset
- **Lines**: 405-501
- **Key Fields**: 10 verified observations with dates, CC BY 4.0 license
- **E-E-A-T**: Trustworthiness (verification metadata)

### 5. BreadcrumbList
- **Lines**: 502-525
- **Key Fields**: 3-level navigation

### 6. WebPage
- **Lines**: 526-551
- **Key Fields**: Page metadata, site search integration

### 7. Person
- **Lines**: 552-562
- **Key Fields**: Author credentials, expertise, nationality
- **E-E-A-T**: Expertise (credentials), Authoritativeness (affiliation)

### 8. Certification
- **Lines**: 563-571
- **Key Fields**: EN 15898:2019 compliance
- **E-E-A-T**: Trustworthiness (regulatory compliance)

---

## ✅ Validation Results

### Character Count
- **Total**: ~19,500 characters
- **Compressed**: ~14,000 characters
- **Status**: ✅ Within limits for all major search engines

### Schema Types Detected
- ✅ TechnicalArticle
- ✅ Product
- ✅ HowTo
- ✅ Dataset
- ✅ BreadcrumbList
- ✅ WebPage
- ✅ Person
- ✅ Certification

### Google Rich Results Test
**Expected Results**:
- ✅ Article/TechnicalArticle: Valid
- ✅ Product: Valid with 13 properties
- ✅ HowTo: Valid with 4 steps
- ✅ BreadcrumbList: Valid with 3 items
- ✅ Person: Valid with credentials

---

## 🎯 E-E-A-T Signals Summary

### Experience (6 signals)
1. ✅ 10 application areas (Cultural Heritage, Museum Conservation, etc.)
2. ✅ Before/after microscopy analysis
3. ✅ 4 HowTo process steps
4. ✅ 4 outcome metrics with typical ranges
5. ✅ 3 environmental impact benefits
6. ✅ Processing time estimates

### Expertise (8 signals)
1. ✅ Author with Ph.D. credentials
2. ✅ 13 material properties with precision
3. ✅ Confidence scores on all measurements (82-95%)
4. ✅ Min/max ranges for properties
5. ✅ Technical descriptions for each property
6. ✅ Specific expertise area (Laser-Based Additive Manufacturing)
7. ✅ Detailed machine parameter descriptions
8. ✅ Microscopy analysis details

### Authoritativeness (6 signals)
1. ✅ 10 unique source citations
2. ✅ Publisher organization (Z-Beam)
3. ✅ Author affiliation with organization
4. ✅ Industry-standard categorization
5. ✅ Regulatory standard (EN 15898:2019)
6. ✅ Database references

### Trustworthiness (7 signals)
1. ✅ Verification dates on all measurements
2. ✅ Data provenance documentation
3. ✅ Confidence scores (82-95%)
4. ✅ Fix reason documentation (laserReflectivity)
5. ✅ CC BY 4.0 license
6. ✅ Transparent measurement methods
7. ✅ Regulatory compliance certification

**Total E-E-A-T Signals**: 27

---

## 💡 Key Insights

### Automatic Extraction
All data extracted automatically from frontmatter:
- ✅ 13 material properties → Product schema
- ✅ 4 machine settings → HowTo steps
- ✅ Author profile → Person schema
- ✅ 3 environmental benefits → Product sustainability
- ✅ 4 outcome metrics → HowTo expectedOutput
- ✅ 1 regulatory standard → Certification schema

### Dynamic Updates
If frontmatter changes:
- Add property → Automatically in Product schema
- Update confidence → Immediately reflected
- Change author → Person schema updates
- New machine setting → New HowTo step
- Add environmental impact → Product sustainability updates

### Zero Maintenance
- ✅ No manual JSON-LD editing
- ✅ No template updates needed
- ✅ Automatic schema validation
- ✅ Type-safe with TypeScript

---

## Category Page JSON-LD

**Category**: Ceramic Materials  
**URL**: `/materials/ceramic`  
**Generated**: November 4, 2025  
**Component**: `<JsonLD data={schemas} />`

### Schema Overview
Category pages now use **5 comprehensive schemas** in a `@graph` structure:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.z-beam.com/materials/ceramic#webpage",
      "name": "Ceramic Laser Cleaning",
      "description": "Comprehensive guide to laser cleaning ceramic materials...",
      "url": "https://www.z-beam.com/materials/ceramic",
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.z-beam.com#organization",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "breadcrumb": {
        "@id": "https://www.z-beam.com/materials/ceramic#breadcrumb"
      },
      "mainEntity": {
        "@id": "https://www.z-beam.com/materials/ceramic#itemlist"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.z-beam.com/materials/ceramic#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.z-beam.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Ceramic",
          "item": "https://www.z-beam.com/materials/ceramic"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.z-beam.com/materials/ceramic#itemlist",
      "numberOfItems": 15,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Alumina",
          "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning",
          "item": {
            "@type": "Article",
            "@id": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning",
            "name": "Alumina",
            "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning"
          }
        }
        // ... more materials
      ]
    },
    {
      "@type": "Dataset",
      "@id": "https://www.z-beam.com/materials/ceramic#dataset",
      "name": "Ceramic Laser Cleaning Parameters Dataset",
      "description": "Comprehensive dataset of 15 ceramic materials with laser cleaning parameters...",
      "url": "https://www.z-beam.com/materials/ceramic",
      "creator": {
        "@type": "Organization",
        "@id": "https://www.z-beam.com#organization",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "keywords": ["ceramic", "laser cleaning", "material properties"],
      "temporalCoverage": "2024/..",
      "spatialCoverage": "Global",
      "variableMeasured": [
        "wavelength",
        "power",
        "fluence",
        "pulse duration",
        "repetition rate",
        "scan speed",
        "thermal conductivity",
        "hardness",
        "ablation threshold"
      ],
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://www.z-beam.com/data/datasets/ceramic.json",
          "description": "JSON format dataset with 15 ceramic materials"
        },
        {
          "@type": "DataDownload",
          "encodingFormat": "text/csv",
          "contentUrl": "https://www.z-beam.com/data/datasets/ceramic.csv",
          "description": "CSV format dataset with 15 ceramic materials"
        },
        {
          "@type": "DataDownload",
          "encodingFormat": "text/plain",
          "contentUrl": "https://www.z-beam.com/data/datasets/ceramic.txt",
          "description": "Plain text format dataset with 15 ceramic materials"
        }
      ],
      "hasPart": [
        {
          "@type": "Dataset",
          "name": "Alumina",
          "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning"
        }
        // ... more material datasets
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.z-beam.com/materials/ceramic",
      "name": "Ceramic Laser Cleaning",
      "description": "Explore 15 ceramic materials for laser cleaning applications",
      "url": "https://www.z-beam.com/materials/ceramic",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.z-beam.com#website",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "breadcrumb": {
        "@id": "https://www.z-beam.com/materials/ceramic#breadcrumb"
      },
      "mainEntity": {
        "@id": "https://www.z-beam.com/materials/ceramic#dataset"
      }
    }
  ]
}
```

### Key Features

1. **@graph Pattern**: All 5 schemas in single JSON-LD block
2. **@id References**: Entities reference each other for semantic relationships
3. **Dataset Schema**: Enables Google Dataset Search visibility
4. **Multiple Formats**: JSON, CSV, TXT distribution options
5. **Creative Commons License**: CC BY 4.0 for open access

---

## Subcategory Page JSON-LD

**Subcategory**: Ceramic Oxide Materials  
**URL**: `/materials/ceramic/oxide`  
**Generated**: November 4, 2025  
**Component**: `<JsonLD data={schemas} />`

### Schema Overview
Subcategory pages use the **same 5-schema pattern** with 3-level breadcrumbs:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.z-beam.com/materials/ceramic/oxide#webpage",
      "name": "Oxide Ceramic Laser Cleaning",
      "description": "Laser cleaning solutions for oxide ceramic materials. 8 materials available.",
      "url": "https://www.z-beam.com/materials/ceramic/oxide",
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.z-beam.com#organization",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "breadcrumb": {
        "@id": "https://www.z-beam.com/materials/ceramic/oxide#breadcrumb"
      },
      "mainEntity": {
        "@id": "https://www.z-beam.com/materials/ceramic/oxide#itemlist"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.z-beam.com/materials/ceramic/oxide#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.z-beam.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Ceramic",
          "item": "https://www.z-beam.com/materials/ceramic"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Oxide",
          "item": "https://www.z-beam.com/materials/ceramic/oxide"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.z-beam.com/materials/ceramic/oxide#itemlist",
      "numberOfItems": 8,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Alumina",
          "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning",
          "item": {
            "@type": "Article",
            "@id": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning",
            "name": "Alumina",
            "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning"
          }
        }
        // ... 7 more materials
      ]
    },
    {
      "@type": "Dataset",
      "@id": "https://www.z-beam.com/materials/ceramic/oxide#dataset",
      "name": "Oxide Ceramic Laser Cleaning Parameters Dataset",
      "description": "Comprehensive dataset of 8 oxide ceramic materials...",
      "url": "https://www.z-beam.com/materials/ceramic/oxide",
      "creator": {
        "@type": "Organization",
        "@id": "https://www.z-beam.com#organization",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "keywords": ["Oxide", "Ceramic", "laser cleaning"],
      "temporalCoverage": "2024/..",
      "spatialCoverage": "Global",
      "variableMeasured": [
        "wavelength",
        "power",
        "fluence",
        "pulse duration",
        "repetition rate",
        "scan speed",
        "thermal conductivity",
        "hardness",
        "ablation threshold"
      ],
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://www.z-beam.com/data/datasets/ceramic-oxide.json",
          "description": "JSON format dataset with 8 materials"
        },
        {
          "@type": "DataDownload",
          "encodingFormat": "text/csv",
          "contentUrl": "https://www.z-beam.com/data/datasets/ceramic-oxide.csv",
          "description": "CSV format dataset with 8 materials"
        }
      ],
      "hasPart": [
        {
          "@type": "Dataset",
          "name": "Alumina",
          "url": "https://www.z-beam.com/materials/ceramic/oxide/alumina-laser-cleaning"
        }
        // ... more material datasets
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://www.z-beam.com/materials/ceramic/oxide",
      "name": "Oxide Ceramic Laser Cleaning",
      "description": "Explore 8 oxide ceramic materials for laser cleaning applications",
      "url": "https://www.z-beam.com/materials/ceramic/oxide",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.z-beam.com#website",
        "name": "Z-Beam",
        "url": "https://www.z-beam.com"
      },
      "breadcrumb": {
        "@id": "https://www.z-beam.com/materials/ceramic/oxide#breadcrumb"
      },
      "mainEntity": {
        "@id": "https://www.z-beam.com/materials/ceramic/oxide#dataset"
      }
    }
  ]
}
```

---

## 📊 Schema Comparison

| Page Type | Schemas | Component | Discovery Status |
|-----------|---------|-----------|------------------|
| Material | 7-8 | MaterialJsonLD | ✅ Always discoverable |
| Category | 5 | JsonLD | ✅ **NOW discoverable** (Nov 2025) |
| Subcategory | 5 | JsonLD | ✅ **NOW discoverable** (Nov 2025) |
| Static Pages | 1-2 | JsonLD via Layout | ✅ Discoverable |

---

## 📚 Related Documentation

- [Rich Data Normalization Summary](../RICH_DATA_NORMALIZATION_SUMMARY.md)
- [Category Page SEO Audit](../CATEGORY_PAGE_SEO_AUDIT.md)
- [E-E-A-T Implementation Details](JSONLD_EEAT_IMPLEMENTATION.md)
- [Component Update Summary](JSONLD_COMPONENT_UPDATE_SUMMARY.md)
- [Frontmatter Structure](FRONTMATTER_CURRENT_STRUCTURE.md)

---

**Last Updated**: November 4, 2025  
**Deployment Status**: ✅ In Production
