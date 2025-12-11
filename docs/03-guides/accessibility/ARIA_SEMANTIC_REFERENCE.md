# ARIA Attributes and Semantic HTML Reference

## Comprehensive ARIA Implementation Guide

### ARIA Roles Used
This document provides detailed specifications for all ARIA roles, properties, and states implemented across Z-Beam components.

## MetricsCard Component ARIA Implementation

### Primary ARIA Roles
```typescript
// Main container with semantic article role
<article 
  role="article"
  aria-labelledby="metric-title-{uniqueId}"
  aria-describedby="metric-desc-{uniqueId}"
  tabIndex={isClickable ? 0 : -1}
>
```

### Progress Bar ARIA Pattern
```typescript
// WCAG-compliant progress bar implementation
<div 
  id="progress-{uniqueId}"
  role="progressbar"
  aria-valuenow={numericValue}
  aria-valuemin={minValue}
  aria-valuemax={maxValue}
  aria-labelledby="progress-label-{uniqueId}"
  aria-describedby="progress-desc-{uniqueId}"
  tabIndex={0}
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
```

### Figure and Data ARIA Pattern
```typescript
// Semantic figure with proper labeling
<figure 
  role="img" 
  aria-labelledby="progress-label-{uniqueId}"
  aria-describedby="progress-desc-{uniqueId}"
>
  <figmicro id="progress-label-{uniqueId}" className="sr-only">
    {title} progress indicator
  </figmicro>
  
  <div id="progress-desc-{uniqueId}" className="sr-only">
    Current value: <data value={value}>{value}</data> {unit}.
    Range: {min} to {max} {unit}.
    Progress: {Math.round(percentage)}% of maximum.
  </div>
</figure>
```

### Screen Reader Descriptions
```typescript
// Comprehensive accessibility description
<div id="metric-desc-{uniqueId}" className="sr-only">
  {hasValidRange 
    ? `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}, ranging from ${min} to ${max} ${displayUnit}`
    : `Metric showing ${fullPropertyName || title} with value ${displayValue} ${displayUnit}`
  }
  {isClickable && '. Press Enter or Space to search for this metric.'}
</div>
```

### Link ARIA Pattern (when searchable)
```typescript
<Link
  href={finalHref}
  aria-label={`Navigate to search results for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
  aria-describedby="metric-desc-{uniqueId}"
  title={`Search for ${fullPropertyName || title}: ${displayValue}${displayUnit}`}
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
```

## Micro Component ARIA Implementation

### Main Section ARIA Pattern
```typescript
<section 
  id="micro-section-{uniqueId}"
  role="region"
  aria-labelledby="micro-title-{uniqueId}"
  aria-describedby="micro-desc-{uniqueId} micro-announcements-{uniqueId}"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

### Live Region for Announcements
```typescript
// Polite announcements for navigation feedback
<div 
  id="micro-announcements-{uniqueId}"
  className="sr-only" 
  aria-live="polite" 
  aria-atomic="true"
  role="status"
>
  {announceMessage}
</div>
```

### Image Container ARIA Pattern
```typescript
<figure 
  role="img"
  aria-labelledby="micro-title-{uniqueId}"
  aria-describedby="micro-image-{uniqueId}"
>
  <div id="micro-image-{uniqueId}" className="sr-only">
    {imageSource 
      ? `Surface analysis image showing ${capitalizedMaterial} before and after laser cleaning treatment with ${hasMetrics ? 'interactive quality metrics overlay' : 'technical details'}`
      : `No image available for ${capitalizedMaterial} surface analysis`
    }
  </div>
</figure>
```

### Interactive Quality Metrics ARIA Pattern
```typescript
<div 
  id="micro-metrics-{uniqueId}"
  role="region"
  aria-label="Interactive quality metrics overlay"
  aria-describedby="micro-metrics-desc-{uniqueId}"
  aria-expanded={metricsExpanded}
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <div id="micro-metrics-desc-{uniqueId}" className="sr-only">
    Quality metrics overlay with {Object.keys(enhancedData.quality_metrics).length} measurements. 
    Use arrow keys to navigate, Enter to toggle, Escape to exit.
  </div>
  
  <div role="list" aria-label="Quality metrics list">
    {metricsEntries.map(([key, value], index) => {
      const isFocused = focusedMetricIndex === index;
      return (
        <div role="listitem" key={key}>
          <article 
            id="metric-{key}-{uniqueId}"
            role="article"
            aria-labelledby="metric-label-{key}-{uniqueId}"
            tabIndex={isFocused ? 0 : -1}
            className={isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : ''}
          >
            <dt id="metric-label-{key}-{uniqueId}">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd aria-describedby="metric-label-{key}-{uniqueId}">
              <data value={value}>{String(value)}</data>
            </dd>
            <div className="sr-only">
              Metric: {key.replace(/_/g, ' ')}, Value: {String(value)}
              {isFocused && ', Currently focused'}
            </div>
          </article>
        </div>
      );
    })}
  </div>
</div>
```

### Loading State ARIA Pattern
```typescript
// Progress bar for loading states
<div 
  role="progressbar"
  aria-label="Loading surface analysis image"
  aria-describedby="micro-image-loading-{uniqueId}"
  tabIndex={0}
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  <span id="micro-image-loading-{uniqueId}" className="sr-only">
    Loading surface analysis image for {capitalizedMaterial}...
  </span>
</div>
```

### Error State ARIA Pattern
```typescript
// Alert role for error states
<div 
  role="alert"
  aria-live="assertive"
  aria-describedby="micro-error-{uniqueId}"
>
  <div id="micro-error-{uniqueId}">
    Surface analysis image could not be loaded
  </div>
  <span className="sr-only">
    Error: Surface analysis image failed to load
  </span>
</div>
```

### Before/After Treatment ARIA Pattern
```typescript
// Semantic sections for comparison content
<section 
  role="region"
  aria-labelledby="before-treatment-{uniqueId}"
>
  <h4 
    id="before-treatment-{uniqueId}"
    role="heading"
    aria-level={4}
  >
    <span 
      className="w-2 h-2 bg-red-500 rounded-full mr-2" 
      aria-hidden="true"
      role="presentation"
    ></span>
    Before Treatment
  </h4>
  <p aria-labelledby="before-treatment-{uniqueId}">
    {beforeText}
  </p>
</section>

<section 
  role="region"
  aria-labelledby="after-treatment-{uniqueId}"
>
  <h4 
    id="after-treatment-{uniqueId}"
    role="heading"
    aria-level={4}
  >
    <span 
      className="w-2 h-2 bg-green-500 rounded-full mr-2" 
      aria-hidden="true"
      role="presentation"
    ></span>
    After Treatment
  </h4>
  <p aria-labelledby="after-treatment-{uniqueId}">
    {afterText}
  </p>
</section>
```

## Semantic HTML Elements Used

### Enhanced Data Representation with Maximum Specificity
```html
<!-- Semantic data with comprehensive attributes -->
<data 
  value="7.85"
  data-property="density"
  data-unit="g/cm³"
  data-type="measurement"
  data-context="material_property"
  data-precision="2"
  data-magnitude="medium"
  data-position="current"
  itemProp="value"
  itemType="https://schema.org/PropertyValue"
>7.85</data>

<data 
  value="80"
  data-property="efficiency"
  data-unit="%"
  data-type="measurement"
  data-context="laser_parameter"
  data-precision="0"
  data-magnitude="high"
  data-position="current"
  itemProp="value"
  itemType="https://schema.org/PropertyValue"
>80%</data>

<data 
  value="1064"
  data-property="wavelength"
  data-unit="nm"
  data-type="measurement"
  data-context="laser_parameter"
  data-precision="0"
  data-magnitude="high"
  data-position="current"
  itemProp="value"
  itemType="https://schema.org/PropertyValue"
>1064 nm</data>
```

### Schema.org Integration Patterns
```html
<!-- Material property with full schema markup -->
<article 
  itemScope
  itemType="https://schema.org/PropertyValue"
  data-component="metrics-card"
  data-property="thermal_conductivity"
>
  <h4 itemProp="name" data-component="metric-title">Thermal Conductivity</h4>
  <data 
    itemProp="value"
    value="45.5"
    data-property="thermal_conductivity"
    data-unit="W/mK"
    data-type="measurement"
  >45.5</data>
  <span itemProp="unitCode">W/mK</span>
</article>
```

### Abbreviations (converted to spans to remove underlines)
```html
<!-- Units without underlines but with tooltips -->
<span title="nanometers">nm</span>
<span title="percentage">%</span>
<span title="watts per square centimeter">W/cm²</span>
```

### Article Structure
```html
<!-- Each metric is a complete article -->
<article role="article">
  <header>
    <h4 role="heading" aria-level="4">Thermal Conductivity</h4>
  </header>
  <section>
    <data value="45.5">45.5</data>
    <span title="watts per meter kelvin">W/mK</span>
  </section>
</article>
```

### Figure and Figmicro
```html
<!-- Progress visualization as figure -->
<figure role="img">
  <div role="progressbar"><!-- progress content --></div>
  <figmicro>Progress indicator for thermal conductivity</figmicro>
</figure>

<!-- Image analysis as figure -->
<figure role="img">
  <img src="analysis.jpg" alt="Detailed surface analysis" />
  <figmicro role="group">
    <section><!-- Before treatment --></section>
    <section><!-- After treatment --></section>
  </figmicro>
</figure>
```

## Focus Management Patterns

### Tab Order Priority
1. Main interactive elements (tabIndex="0")
2. Secondary controls (tabIndex="0" when active)
3. Descriptive content (tabIndex="-1", focusable via JS)

### Focus Indicators
```css
/* High-contrast focus indicators */
.focus:ring-2 {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Touch-friendly targets */
@media (pointer: coarse) {
  [tabindex="0"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Keyboard Event Handling
```typescript
const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      // Navigate to next item with announcement
      setAnnounceMessage(`Focused on ${nextItem} metric`);
      break;
    case 'Escape':
      event.preventDefault();
      // Return focus to parent with announcement
      parentRef.current?.focus();
      setAnnounceMessage('Focus returned to main container');
      break;
  }
}, [dependencies]);
```

## Screen Reader Optimizations

### Hidden Content for Context
```html
<!-- Comprehensive descriptions for screen readers -->
<div className="sr-only">
  Interactive thermal conductivity metric showing current value 45.5 watts per meter kelvin, 
  ranging from 0.1 to 429 watts per meter kelvin. 
  Current progress: 11% of maximum range. 
  Press Enter or Space to search for related materials.
</div>
```

### Announcement Patterns
```typescript
// Progress announcements
setAnnounceMessage(`Focused on ${metricName.replace(/_/g, ' ')} metric`);
setAnnounceMessage('Quality metrics expanded');
setAnnounceMessage('Surface analysis image loaded successfully');
setAnnounceMessage('Error: Surface analysis image failed to load');
```

### Live Region Usage
- `aria-live="polite"`: Navigation feedback, loading completion
- `aria-live="assertive"`: Error states, urgent information
- `aria-atomic="true"`: Complete message replacement
- `role="status"`: Non-critical status updates
- `role="alert"`: Error conditions requiring immediate attention

This comprehensive ARIA implementation ensures maximum accessibility across all supported assistive technologies and input methods.