# Call-to-Action (CTA) Component

A full-width, responsive call-to-action banner component designed to drive conversions with a professional design featuring the company van image, contact information, and a prominent contact button.

## Features

- ✅ Full-width responsive design
- ✅ Gradient blue background (blue-600 to blue-800)
- ✅ Company van image from navbar
- ✅ Clickable phone number (tel: link)
- ✅ Contact Us button with hover effects
- ✅ Mobile-responsive layout (stacks vertically on mobile)
- ✅ Smooth transitions and hover animations
- ✅ Uses SITE_CONFIG for dynamic content

## Usage

### Basic Usage

```tsx
import { CallToAction } from '@/app/components/CTA';

export default function MyPage() {
  return (
    <div>
      {/* Your page content */}
      <CallToAction />
      {/* More content */}
    </div>
  );
}
```

### Homepage Example

The CTA component is already integrated into the homepage (`app/page.tsx`) between the Featured Solutions and Material Categories sections:

```tsx
{/* Featured Solutions Section */}
<section className={CONTAINER_STYLES.standard}>
  <CardGridSSR items={featuredSections} />
</section>

{/* Call-to-Action Section */}
<CallToAction />

{/* Material Categories Section */}
<section className={CONTAINER_STYLES.standard}>
  <CardGridSSR items={featuredMaterialCategories} />
</section>
```

## Component Structure

### Layout
The component uses a 3-column layout on desktop that stacks vertically on mobile:

1. **Left Column (1/3)**: Van image
2. **Center Column (1/3)**: Heading and subheading text
3. **Right Column (1/3)**: Phone number and contact button

### Responsive Behavior

- **Mobile (< 768px)**: 
  - Stacked vertical layout
  - Centered content
  - Full-width elements

- **Desktop (≥ 768px)**:
  - 3-column horizontal layout
  - Van on left
  - Text centered
  - Contact info on right

## Customization

### Colors
The component uses Tailwind classes. To customize colors:

```tsx
// Background gradient
className="bg-gradient-to-r from-blue-600 to-blue-800"

// Button colors
className="text-blue-600 bg-white hover:bg-blue-50"

// Text colors
className="text-white" // Heading
className="text-blue-100" // Subheading
```

### Text Content
Edit directly in the component file:

```tsx
<h2>Ready to Get Started?</h2>
<p>Contact us today for a free consultation and quote</p>
```

### Spacing
Adjust padding using Tailwind classes:

```tsx
className="py-12 md:py-16" // Vertical padding
```

## Data Sources

- **Phone Number**: `SITE_CONFIG.contact.general.phone`
- **Phone Link**: `SITE_CONFIG.contact.general.phoneHref`
- **Van Image**: `/images/van/van.png`
- **Company Name**: `SITE_CONFIG.shortName`

## Accessibility

- ✅ Semantic HTML (`<section>`, `<a>`, etc.)
- ✅ Descriptive alt text for van image
- ✅ Clear, readable contrast ratios
- ✅ Large touch targets for mobile
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## Performance

- Uses Next.js `Image` component for optimized image loading
- `priority={false}` for below-the-fold loading
- Lazy loading for better performance
- Minimal CSS bundle size with Tailwind

## Dependencies

- `next/link` - Client-side navigation
- `next/image` - Optimized image component
- `@/app/utils/constants` - Site configuration

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Related Components

- `Hero` - Hero section with video background
- `CardGrid` - Grid layout for featured content
- `Navigation` - Nav bar with van image

## File Structure

```
app/components/CTA/
├── CallToAction.tsx    # Main CTA component
├── index.ts           # Export file for easy imports
└── README.md          # This file
```

## Notes

- The component uses the same van image as the navbar for brand consistency
- Phone number automatically formats as a clickable tel: link
- Button includes an arrow icon for visual direction
- Gradient background provides visual separation from other sections
- Drop shadow on van image adds depth
