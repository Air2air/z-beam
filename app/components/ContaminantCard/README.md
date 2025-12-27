# ContaminantCard Design Variants

## Overview
Collection of design alternatives for displaying contaminant category and context information within card thumbnails.

## Design Philosophy
Each variant optimizes for different use cases:
- **Information density** vs **Visual appeal**
- **Scannability** vs **Detail depth**
- **Professional** vs **Engaging**

---

## 🎨 Design Variants

### 1. DEFAULT (Two-Column Layout)
**Best for**: Dense information display, quick scanning

```tsx
<ContaminantCard designVariant="default" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│                             │
│  CATEGORY      Organic      │
│  ─────────────────────────  │
│  CONTEXT       Bio-based... │
│                             │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Maximum information density
- ✅ Easy to scan vertically
- ✅ Clear label-value relationship

**Cons**:
- ❌ Can feel cramped with long text
- ❌ Less visual hierarchy

---

### 2. STACKED (Vertical Layout)
**Best for**: Readability, longer descriptions

```tsx
<ContaminantCard designVariant="stacked" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│  CATEGORY                   │
│  Organic Compounds          │
│                             │
│  ─────────────────────────  │
│  CONTEXT                    │
│  Carbon-based materials     │
│  from biological sources... │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Better readability for long text
- ✅ Clear visual hierarchy
- ✅ Comfortable spacing

**Cons**:
- ❌ Takes more vertical space
- ❌ Less information at a glance

---

### 3. BADGE STYLE
**Best for**: Visual emphasis on category, modern look

```tsx
<ContaminantCard designVariant="badge" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│                             │
│    ╭───────────────╮        │
│    │ ORGANIC       │        │
│    ╰───────────────╯        │
│                             │
│  Bio-based materials from   │
│  natural sources...         │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Eye-catching, modern design
- ✅ Category stands out prominently
- ✅ Good for visual branding

**Cons**:
- ❌ Badge can dominate the space
- ❌ Less formal appearance

---

### 4. MINIMAL (Text-Only)
**Best for**: Typography-focused, clean aesthetic

```tsx
<ContaminantCard designVariant="minimal" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│                             │
│  Organic Compounds          │
│                             │
│  Carbon-based materials     │
│  from biological sources    │
│                             │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Cleanest design
- ✅ Maximum breathing room
- ✅ Typography-focused

**Cons**:
- ❌ Less structured
- ❌ Context label missing (relies on position)

---

### 5. SPLIT DESIGN
**Best for**: Clear section separation, balanced layout

```tsx
<ContaminantCard designVariant="split" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│      CATEGORY               │
│  Organic Compounds          │
├─────────────────────────────┤
│      CONTEXT                │
│  Carbon-based materials     │
│  from biological sources    │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Perfect 50/50 split
- ✅ Very structured
- ✅ Clear visual separation

**Cons**:
- ❌ Rigid layout
- ❌ Limited space per section

---

### 6. GRADIENT OVERLAY
**Best for**: Visual depth, modern aesthetic

```tsx
<ContaminantCard designVariant="gradient" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│ ┃ CATEGORY                  │
│ ┃ Organic Compounds         │
│                             │
│           CONTEXT           │
│   Carbon-based materials  │ │
│                             │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Visually interesting
- ✅ Subtle depth effect
- ✅ Modern appearance

**Cons**:
- ❌ More complex styling
- ❌ Gradient can distract

---

### 7. ICON-BASED
**Best for**: Quick visual recognition, engaging design

```tsx
<ContaminantCard designVariant="icon-based" {...props} />
```

**Visual Structure**:
```
┌─────────────────────────────┐
│                             │
│          🧪                 │
│                             │
│   Organic Compounds         │
│                             │
│  Carbon-based materials...  │
│─────────────────────────────│
│  Title                      │
└─────────────────────────────┘
```

**Pros**:
- ✅ Most visual/engaging
- ✅ Quick category recognition
- ✅ Friendly appearance

**Cons**:
- ❌ Requires icon mapping
- ❌ Less professional
- ❌ Emoji may not fit brand

---

## 📊 Comparison Matrix

| Variant | Info Density | Readability | Visual Appeal | Professional | Best Use Case |
|---------|-------------|-------------|---------------|--------------|---------------|
| **Default** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Data-heavy dashboards |
| **Stacked** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Content-focused pages |
| **Badge** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Marketing pages |
| **Minimal** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Portfolio/showcase |
| **Split** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Formal documentation |
| **Gradient** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Modern web apps |
| **Icon-Based** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Consumer-facing apps |

---

## 🎯 Recommendations

### For Z-Beam (Current Context)

**Primary Recommendation: STACKED**
- Professional appearance
- Excellent readability
- Handles varying text lengths well
- Good balance of info density and aesthetics

**Alternative: GRADIENT**
- Modern tech aesthetic
- Visual interest without sacrificing professionalism
- Aligns with current design system

**For Testing**: DEFAULT
- Most information-dense
- Closest to current relationship card behavior
- Easy to implement as existing pattern

---

## 🔧 Implementation

### Unified API (Proposed)
```tsx
import { ContaminantCard } from '@/app/components/ContaminantCard';

<ContaminantCard
  frontmatter={contaminantData}
  href="/contaminants/rust"
  designVariant="stacked"  // or "default", "badge", etc.
  showCategory={true}
  showContext={true}
  className="custom-class"
/>
```

### Fallback Strategy
All variants gracefully degrade when data is missing:
- No category → Shows only context
- No context → Shows only category
- No data → Shows placeholder message

---

## 🎨 Customization

Each variant can be further customized via:
- **Color schemes**: Based on category type
- **Typography**: Adjustable font sizes and weights
- **Spacing**: Configurable padding/margins
- **Animations**: Hover effects, transitions
- **Responsive behavior**: Mobile-optimized layouts

---

## 📱 Responsive Considerations

All variants are designed with responsive breakpoints:
- **Mobile (< 768px)**: Compact spacing, smaller fonts
- **Tablet (768-1024px)**: Standard spacing
- **Desktop (> 1024px)**: Full spacing, optimal readability

---

## 🚀 Next Steps

1. **User Testing**: A/B test variants with real users
2. **Performance**: Measure load times and rendering
3. **Accessibility**: Ensure WCAG AA compliance
4. **Analytics**: Track click-through rates per variant
5. **Iteration**: Refine based on user feedback
