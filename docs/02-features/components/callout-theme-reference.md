# Callout Component Theme Reference

## Overview
The Callout component uses the existing site color schemes to ensure visual consistency.

## Theme Options

### 1. Body Theme (`theme: "body"`)

**Colors:**
- Background: `bg-gray-700` (medium gray - matches main body)
- Heading: White text
- Paragraph: Light gray text (`text-gray-100`)

**Use Cases:**
- ✅ Call-to-action sections
- ✅ Important announcements
- ✅ Content that needs to stand out
- ✅ High-contrast messaging

**Example:**
```yaml
callout:
  heading: "Ready to Transform Your Operations?"
  text: "Contact us today for a free consultation."
  theme: "body"
  imagePosition: "right"
  image:
    url: "/images/callout.jpg"
    alt: "CTA image"
```

**Visual Preview:**
- Medium gray background (same as page body)
- White bold heading
- Light text for readability
- Consistent across light/dark mode (always gray-700)

---

### 2. Navbar Theme (`theme: "navbar"`)

**Colors:**
- Background: `bg-white dark:bg-gray-800` (adapts to theme)
- Heading: `text-gray-900 dark:text-white` (adapts to theme)
- Paragraph: `text-gray-700 dark:text-gray-300` (adapts to theme)

**Use Cases:**
- ✅ Informational content
- ✅ Product features
- ✅ Service descriptions
- ✅ Content that should blend with UI

**Example:**
```yaml
callout:
  heading: "Advanced Laser Technology"
  text: "Our equipment delivers precision cleaning."
  theme: "navbar"
  imagePosition: "left"
  image:
    url: "/images/technology.jpg"
    alt: "Technology showcase"
```

**Visual Preview:**
- Light mode: White background with dark text
- Dark mode: Dark gray background (gray-800) with light text
- Matches navigation bar styling
- Responsive to user theme preference

---

## Color Specifications

### Body Theme
```css
/* Background */
bg-gray-700: #374151

/* Heading */
text-white: #FFFFFF

/* Text */
text-gray-100: #F3F4F6
```

### Navbar Theme (Light Mode)
```css
/* Background */
bg-white: #FFFFFF

/* Heading */
text-gray-900: #111827

/* Text */
text-gray-700: #374151
```

### Navbar Theme (Dark Mode)
```css
/* Background */
bg-gray-800: #1F2937

/* Heading */
text-white: #FFFFFF

/* Text */
text-gray-300: #D1D5DB
```

---

## Quick Decision Guide

**Choose Body Theme when:**
- You want the callout to visually separate from content
- The message is a primary CTA
- You need high contrast
- You want consistent appearance regardless of theme

**Choose Navbar Theme when:**
- The callout should integrate smoothly with the UI
- Content is informational rather than action-oriented
- You want to respect user's light/dark mode preference
- The callout complements rather than interrupts the flow

---

## Live Examples

### Services Page (Body Theme)
- URL: `/services`
- Theme: `body`
- Position: `right`
- Effect: Strong visual separation, CTA-focused

### Rental Page (Could use Navbar Theme)
- URL: `/rental`
- Suggested Theme: `navbar`
- Position: `left`
- Effect: Integrated, informational

---

## Implementation Notes

1. **Default**: If no theme specified, defaults to `navbar`
2. **Consistency**: Both themes maintain proper contrast ratios for accessibility
3. **Responsive**: Both adapt to mobile, tablet, and desktop layouts
4. **Shadow**: Both include `shadow-lg` for subtle depth
5. **Rounded Corners**: Both use `rounded-lg` for modern appearance

---

## AI Assistant Guidelines

When creating callouts:

1. **For CTAs**: Use `theme: "body"` with compelling action language
2. **For Information**: Use `theme: "navbar"` with descriptive content
3. **Image Selection**: Match image style to theme (dramatic for body, informational for navbar)
4. **Text Length**: Keep text concise (1-2 sentences for heading, 2-3 for paragraph)
5. **Accessibility**: Always include alt text for images

---

## Testing Checklist

- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with image on left
- [ ] Test with image on right
- [ ] Test without image (centered text)
- [ ] Test on mobile devices
- [ ] Verify contrast ratios (WCAG AA compliance)
- [ ] Check that text is readable at all viewport sizes
