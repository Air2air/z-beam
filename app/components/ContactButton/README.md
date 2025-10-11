# ContactButton Component

Reusable contact button component extracted from the CTA for consistent call-to-action styling across the site.

## Features

- ✅ **Three variants**: primary (CTA style), secondary (blue), minimal
- ✅ **Responsive sizing**: sm, md, lg with mobile-optimized touch targets
- ✅ **Accessibility**: WCAG 2.1 AAA compliant with focus rings and ARIA labels
- ✅ **Optional icon**: Arrow icon that shows/hides based on prop
- ✅ **Customizable**: Full className support and custom children text

## Usage

### Basic Usage

```tsx
import { ContactButton } from '@/app/components/ContactButton';

<ContactButton />
```

### With Variants

```tsx
// Primary variant (white on orange, from CTA)
<ContactButton variant="primary" size="lg">
  Contact Us
</ContactButton>

// Secondary variant (blue, default)
<ContactButton variant="secondary" size="md" />

// Minimal variant (transparent with text)
<ContactButton variant="minimal" size="sm" showIcon={false}>
  Get in Touch
</ContactButton>
```

### In Title Component

The ContactButton automatically appears on the right side of page-level titles:

```tsx
<Title level="page" title="About Us" />
// Automatically includes ContactButton on the right
```

Override with custom content:

```tsx
<Title 
  level="page" 
  title="Contact" 
  rightContent={null} // No button
/>

<Title 
  level="page" 
  title="Services" 
  rightContent={<CustomButton />} // Custom button
/>
```

### In CTA Component

```tsx
// Used in CallToAction.tsx
<ContactButton 
  variant="primary" 
  size="lg"
  className="mx-auto"
>
  Contact Us
</ContactButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'minimal'` | `'secondary'` | Visual style of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size (affects padding and text) |
| `showIcon` | `boolean` | `true` | Whether to display the arrow icon |
| `className` | `string` | `''` | Additional CSS classes |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `children` | `ReactNode` | `'Contact Us'` | Button text content |
| `aria-label` | `string` | `'Go to contact form page'` | Accessibility label |

## Variants

### Primary
- White background with orange text
- Used in CTA component
- Shadow and scale effects on hover
- High contrast for maximum visibility

```tsx
<ContactButton variant="primary" size="lg" />
```

### Secondary (Default)
- Blue background with white text
- Standard button style
- Used in page titles
- Consistent with site color scheme

```tsx
<ContactButton variant="secondary" size="md" />
```

### Minimal
- Transparent background
- Blue text with underline on hover
- Subtle, non-intrusive
- Good for secondary CTAs

```tsx
<ContactButton variant="minimal" size="sm" showIcon={false} />
```

## Sizes

### Small (`sm`)
- Compact: `px-3 py-1.5`
- Text: `text-xs sm:text-sm`
- Min height: `36px`
- Icon: `w-3 h-3`

### Medium (`md`) - Default
- Standard: `px-4 py-2 sm:px-6 sm:py-2.5`
- Text: `text-sm md:text-base`
- Min height: `44px` (WCAG touch target)
- Icon: `w-4 h-4 md:w-5 md:h-5`

### Large (`lg`)
- Prominent: `px-6 py-3 sm:px-8 sm:py-3`
- Text: `text-base lg:text-lg`
- Min height: `48px`
- Icon: `w-5 h-5 md:w-6 md:h-6`

## Accessibility

- ✅ **WCAG 2.1 AAA compliant**
- ✅ **Keyboard navigation**: Full focus ring support
- ✅ **Touch targets**: Minimum 44px height (WCAG 2.5.5)
- ✅ **Screen readers**: Descriptive aria-labels
- ✅ **High contrast**: Meets 7:1 ratio
- ✅ **Focus visible**: Clear focus indicators

## Examples

### In a Hero Section

```tsx
<div className="hero-content">
  <h1>Welcome to Z-Beam</h1>
  <ContactButton variant="primary" size="lg" />
</div>
```

### In a Card

```tsx
<div className="card">
  <h3>Need a Quote?</h3>
  <ContactButton variant="secondary" size="md" />
</div>
```

### Inline with Text

```tsx
<p>
  Have questions? 
  <ContactButton variant="minimal" size="sm" showIcon={false}>
    Contact us
  </ContactButton>
  {' '}for more information.
</p>
```

### Full Width Mobile

```tsx
<ContactButton 
  variant="secondary" 
  size="md" 
  fullWidth 
  className="md:w-auto"
>
  Get Started
</ContactButton>
```

## Integration

### Automatic in Page Titles

Page-level titles automatically include a ContactButton on the right:

```tsx
// In any page component
<Title level="page" title="Services" />
```

This renders as:

```
Services ............................ [Contact Us →]
```

### Custom Right Content

To customize or remove the button:

```tsx
// Remove button
<Title level="page" title="Contact" rightContent={null} />

// Custom content
<Title 
  level="page" 
  title="About" 
  rightContent={<PhoneButton />} 
/>
```

## Styling

### Custom Styling

Add custom classes via `className` prop:

```tsx
<ContactButton 
  variant="secondary"
  className="mt-4 mx-auto shadow-xl"
/>
```

### Theme Customization

Button uses Tailwind classes:
- `brand-orange`: Orange brand color (from CTA)
- `blue-600/700`: Blue accent colors
- Focus rings use `focus:ring-*` utilities

## Best Practices

1. **Use primary variant** for main CTAs (hero, CTA section)
2. **Use secondary variant** for navigation and supporting CTAs
3. **Use minimal variant** for inline or subtle prompts
4. **Always provide descriptive aria-label** for screen readers
5. **Maintain 44px minimum height** for touch targets
6. **Test on mobile** to ensure tap-ability

## Related Components

- `CTA/CallToAction` - Uses primary variant
- `Title` - Automatically includes secondary variant
- `Button` - Generic button component
- `Hero` - May include ContactButton

## Files

- `app/components/ContactButton/ContactButton.tsx` - Main component
- `app/components/ContactButton/index.ts` - Exports
- `types/centralized.ts` - ContactButtonProps interface

---

**Created**: October 11, 2025  
**Extracted from**: CTA/CallToAction component  
**Purpose**: Reusable contact button for consistent CTAs site-wide
