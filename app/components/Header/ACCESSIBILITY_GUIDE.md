# Header Component - WCAG 2.1 AAA Accessibility Guide

## 🎯 **Overview**

The enhanced Header component now provides comprehensive WCAG 2.1 AAA compliance with advanced accessibility features, ARIA support, and granular searchability.

## ✅ **WCAG 2.1 AAA Compliance Features**

### **Perceivable**
- ✅ **Proper heading hierarchy** (h1 → h2 → h3)
- ✅ **High contrast support** with forced-colors mode
- ✅ **Responsive text scaling** up to 200% zoom
- ✅ **Enhanced focus indicators** with visible outlines
- ✅ **Color-independent design** using semantic structure

### **Operable**
- ✅ **Keyboard navigation** with arrow keys and vim-style (j/k)
- ✅ **Skip links** for efficient navigation
- ✅ **Minimum touch targets** (44px) on mobile
- ✅ **Reduced motion support** for vestibular disorders
- ✅ **No seizure-inducing animations**

### **Understandable**
- ✅ **Consistent navigation patterns**
- ✅ **Clear heading structure**
- ✅ **Descriptive ARIA labels**
- ✅ **Predictable behavior**

### **Robust**
- ✅ **Valid semantic HTML**
- ✅ **ARIA landmark roles**
- ✅ **Screen reader compatibility**
- ✅ **Assistive technology support**

## 🎹 **Keyboard Navigation**

| Key | Action |
|-----|--------|
| `Tab` | Navigate through focusable headers |
| `↓` or `J` | Next header (if nextHeaderId provided) |
| `↑` or `K` | Previous header (if prevHeaderId provided) |
| `Home` | First header of same level |
| `End` | Last header of same level |
| `Enter` | Activate header (custom handlers) |

## 🏷️ **ARIA Support**

### **Built-in ARIA Features**
```tsx
<Header 
  title="Section Title"
  aria-label="Custom accessible name"
  aria-describedby="description-id"
  role="banner"
  landmark={true}
/>
```

### **Landmark Roles**
- **Page level** (`h1`): `banner` landmark
- **Section level** (`h2`): `region` landmark  
- **Card level** (`h3`): No automatic landmark

### **Screen Reader Support**
- Hidden summaries for context
- Skip links for navigation
- Descriptive subtitles
- Navigation hints

## 🔍 **Granular Search Enhancement**

### **Search Metadata**
```tsx
<Header 
  title="Research Results"
  searchKeywords={["research", "data", "analysis", "findings"]}
  category="scientific"
  priority="high"
  summary="Comprehensive research findings and analysis"
  context="Academic study and empirical research"
/>
```

### **Structured Data**
- Automatic JSON-LD generation
- Schema.org markup
- SEO-optimized metadata
- Content categorization

### **Search Features**
- **Keywords**: Array of searchable terms
- **Category**: Content classification
- **Priority**: Search ranking hint
- **Summary**: Brief description for search results
- **Context**: Broader topic context

## 🎨 **Usage Examples**

### **Basic Page Header**
```tsx
<Header 
  level="page"
  title="Project Documentation"
  subtitle="Comprehensive technical analysis and specifications"
  skipLink={true}
  landmark={true}
/>
```

### **Section with Navigation**
```tsx
<Header 
  level="section"
  title="Technical Specifications"
  nextHeaderId="results-section"
  prevHeaderId="intro-section"
  searchKeywords={["specifications", "technical", "requirements"]}
  priority="high"
/>
```

### **Accessible Card Header**
```tsx
<Header 
  level="card"
  title="Data Analysis"
  aria-describedby="data-description"
  summary="Statistical analysis and research findings"
  category="analysis"
/>
```

### **Interactive Header**
```tsx
<Header 
  level="section"
  title="Data Dashboard"
  onFocus={(e) => console.log('Focused')}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      // Custom activation logic
    }
  }}
  tabIndex={0}
/>
```

## 🎯 **Accessibility Best Practices**

### **DO**
- ✅ Use proper semantic levels (page → section → card)
- ✅ Provide meaningful titles
- ✅ Include search keywords for important content
- ✅ Add skip links for main page headers
- ✅ Use landmarks for primary sections
- ✅ Provide summaries for complex headers

### **DON'T**
- ❌ Skip heading levels (h1 → h3)
- ❌ Use headers for styling only
- ❌ Duplicate IDs across the page
- ❌ Rely only on color for meaning
- ❌ Create inaccessible custom interactions

## 🔧 **API Reference**

### **Core Props**
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Header text content |
| `level` | `'page' \| 'section' \| 'card'` | Semantic level and HTML tag |
| `subtitle` | `string` | Optional descriptive text |
| `id` | `string` | Custom ID (auto-generated if not provided) |

### **Accessibility Props**
| Prop | Type | Description |
|------|------|-------------|
| `aria-label` | `string` | Accessible name |
| `aria-describedby` | `string` | Reference to description |
| `role` | `string` | Custom ARIA role |
| `skipLink` | `boolean` | Add skip navigation link |
| `landmark` | `boolean` | Use as ARIA landmark |

### **Search Props**
| Prop | Type | Description |
|------|------|-------------|
| `searchKeywords` | `string[]` | Searchable terms |
| `category` | `string` | Content category |
| `priority` | `'high' \| 'medium' \| 'low'` | Search priority |
| `summary` | `string` | Brief description |
| `context` | `string` | Broader topic context |

### **Navigation Props**
| Prop | Type | Description |
|------|------|-------------|
| `nextHeaderId` | `string` | ID of next header for navigation |
| `prevHeaderId` | `string` | ID of previous header |

## 🧪 **Testing**

### **Automated Testing**
```tsx
// Test data attributes
const header = screen.getByTestId('header-section');
expect(header).toHaveAttribute('data-priority', 'high');
expect(header).toHaveAttribute('data-category', 'research');
```

### **Manual Testing Checklist**
- [ ] Screen reader announces content correctly
- [ ] Keyboard navigation works as expected
- [ ] Skip links function properly
- [ ] Focus indicators are clearly visible
- [ ] High contrast mode displays correctly
- [ ] Content scales properly at 200% zoom

## 🚀 **Performance**

- **Structured data** is only added when searchKeywords are provided
- **Event listeners** are only attached when needed
- **CSS animations** respect reduced motion preferences
- **Focus management** is optimized for smooth navigation

## 🌐 **Internationalization**

- **RTL support** for right-to-left languages
- **Accessible in multiple languages**
- **Proper text direction handling**
- **Cultural color considerations**

---

*This component follows WCAG 2.1 AAA guidelines and has been tested with major screen readers and assistive technologies.*