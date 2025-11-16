# Thermal Property Label System

## Overview

The material properties component now dynamically displays the correct thermal destruction label based on material type. Not all materials "melt" - many decompose, degrade, sinter, or undergo other transformations at high temperatures.

## Implementation

Location: `app/components/Caption/SEOOptimizedCaption.tsx`

Function: `getThermalPropertyLabel(materialName: string)`

## Material Categories and Labels

### 1. **Melting Point** (Default)
**Used for:** Metals and crystalline materials that undergo phase transition from solid to liquid

**Materials:**
- Pure metals: aluminum, copper, gold, silver, platinum, titanium, iron, etc.
- Metal alloys: brass, bronze, steel, stainless steel, inconel, hastelloy
- Specialized metals: beryllium, cobalt, gallium, hafnium, indium, iridium, lead, magnesium, rhenium, rhodium, ruthenium, tantalum, tin, tungsten, vanadium, zinc, zirconium

**Scientific Basis:** These materials have well-defined melting points where the crystalline structure breaks down into liquid phase.

**Example:** Gold melts at 1064°C

---

### 2. **Decomposition Point**
**Used for:** Organic materials that break down chemically before reaching traditional melting

**Materials:**
- Woods: ash, bamboo, beech, birch, cedar, cherry, fir, hickory, mahogany, maple, oak, pine, poplar, redwood, rosewood, teak, walnut, willow
- Wood products: MDF, plywood

**Scientific Basis:** Wood undergoes pyrolysis (thermal decomposition) where cellulose breaks down into volatiles, char, and gases. This is NOT melting.

**Temperature Range:** Typically 200-500°C
- Softwoods: 300-500°C
- Hardwoods: 200-400°C

**Example:** Pine decomposes at 300-500°C

---

### 3. **Sintering/Decomposition Point**
**Used for:** Ceramic materials that undergo particle fusion or chemical breakdown

**Materials:**
- Ceramics: alumina, ceramic matrix composites (CMCs), porcelain, stoneware, terracotta, zirconia
- Cement-based: brick, cement, concrete, mortar, plaster, stucco
- Mineral compounds: calcite, marble (calcium carbonate-based)

**Scientific Basis:** 
- **Sintering:** Particles fuse together below melting point through diffusion
- **Decomposition:** Chemical breakdown (e.g., CaCO₃ → CaO + CO₂ at 825°C for calcite/marble)

**Temperature Range:** Typically 600-1400°C

**Example:** Porcelain sinters at 1200-1400°C

---

### 4. **Thermal Degradation**
**Used for:** Natural stone that structurally breaks down at extreme temperatures

**Materials:**
- Metamorphic rocks: marble, schist, slate, serpentine
- Igneous rocks: basalt, granite, porphyry
- Sedimentary rocks: alabaster, bluestone, breccia, limestone, quartzite, sandstone, shale, soapstone, travertine

**Scientific Basis:** Rocks don't melt at accessible temperatures but undergo structural degradation:
- Mineral phase changes
- Crystal structure breakdown
- Thermal fracturing
- Dehydration of hydrated minerals

**Temperature Range:** Typically 600-1600°C depending on composition

**Example:** Granite degrades starting around 600°C; complete breakdown at 1200-1400°C

---

### 5. **Degradation Point**
**Used for:** Synthetic polymers and composites

**Materials:**
- Fiber-reinforced polymers: carbon fiber, fiberglass, GFRP, Kevlar
- Resin composites: epoxy, phenolic, polyester, urethane
- Elastomers: rubber, thermoplastic elastomers
- Specialized: FRPU (fiber-reinforced polyurethane)

**Scientific Basis:** Polymers undergo chemical degradation where long polymer chains break into smaller molecules through:
- Thermal oxidation
- Chain scission
- Depolymerization
- Carbonization

**Temperature Range:** Typically 200-600°C

**Examples:**
- Epoxy resin: degrades at 300-400°C
- Kevlar: degrades at 500-600°C
- Carbon fiber: degrades (oxidizes) at 400-600°C in air

---

### 6. **Softening/Melting Point**
**Used for:** Glasses that soften gradually before true melting

**Materials:**
- Glass types: borosilicate glass, float glass, lead crystal, Pyrex, quartz glass, soda-lime glass, tempered glass, fused silica

**Scientific Basis:** Glasses are amorphous (non-crystalline) solids that don't have a sharp melting point. Instead, they gradually soften over a temperature range:
- **Softening point:** Glass becomes pliable
- **Melting point:** Glass flows like liquid

**Temperature Ranges:**
- Soda-lime glass: Softens at 550-600°C, melts at 1370-1530°C
- Borosilicate (Pyrex): Softens at ~820°C
- Fused silica: Softens at ~1600°C, melts at ~1700°C

**Example:** Pyrex softens around 820°C

---

## Semiconductors and Special Cases

### Silicon-based Materials
- **Silicon:** Melting Point (1414°C) - pure crystalline material
- **Silicon Carbide:** Sublimation Point - goes directly from solid to gas at 2830°C
- **Silicon Nitride:** Decomposition Point - decomposes at 1900°C before melting
- **Silicon Germanium:** Melting Point - alloy with defined melting range
- **Gallium Arsenide:** Melting Point (1238°C) - compound semiconductor

*Note: The current implementation treats these as standard melting point materials, which is correct for silicon, silicon germanium, and gallium arsenide.*

---

## Technical Accuracy by Material Type

### Why This Matters for Laser Cleaning

Different thermal behaviors require different laser parameters:

1. **Melting materials:** Risk of surface melting, resolidification defects
2. **Decomposing materials:** Risk of char formation, complete destruction
3. **Degrading polymers:** Risk of chemical changes, outgassing
4. **Sintering ceramics:** Risk of microstructure changes
5. **Softening glasses:** Risk of surface deformation

Proper terminology helps operators understand the actual thermal process and risks.

---

## Schema.org Properties

The component also updates the semantic property name:

| Label | Schema Property |
|-------|-----------------|
| Melting Point | `meltingPoint` |
| Decomposition Point | `decompositionTemperature` |
| Sintering/Decomposition Point | `sinteringTemperature` |
| Thermal Degradation | `thermalDegradation` |
| Degradation Point | `degradationTemperature` |
| Softening/Melting Point | `softeningPoint` |

This provides more accurate structured data for search engines and technical databases.

---

## Code Example

```tsx
// Automatically determines correct label
const thermalProperty = getThermalPropertyLabel('pine');
// Returns: { label: 'Decomposition Point', property: 'decompositionTemperature' }

const thermalProperty = getThermalPropertyLabel('aluminum');
// Returns: { label: 'Melting Point', property: 'meltingPoint' }

const thermalProperty = getThermalPropertyLabel('porcelain');
// Returns: { label: 'Sintering/Decomposition Point', property: 'sinteringTemperature' }
```

---

## Future Enhancements

1. **Add sublimation support** for materials like silicon carbide
2. **Add glass transition temperature** for polymers (Tg)
3. **Add vitrification point** for ceramics
4. **Support multiple thermal events** (e.g., glass transition + decomposition)

---

## Testing

Test with various materials to verify correct labels:

```bash
# Woods should show "Decomposition Point"
- pine-laser-cleaning
- oak-laser-cleaning

# Metals should show "Melting Point"  
- aluminum-laser-cleaning
- steel-laser-cleaning

# Ceramics should show "Sintering/Decomposition Point"
- porcelain-laser-cleaning
- brick-laser-cleaning

# Rocks should show "Thermal Degradation"
- granite-laser-cleaning
- marble-laser-cleaning

# Polymers should show "Degradation Point"
- fiberglass-laser-cleaning
- carbon-fiber-reinforced-polymer-laser-cleaning

# Glass should show "Softening/Melting Point"
- pyrex-laser-cleaning
- float-glass-laser-cleaning
```

---

**Implementation Date:** October 13, 2025  
**Component:** SEOOptimizedCaption.tsx  
**Impact:** All material property displays across the site
