# Accessibility Best Practices by Component Type

## General Rules (Apply to ALL Components)

### 1. Focus Indicators
```tsx
// Always provide visible focus indicators
// Use focus-visible to show only for keyboard users
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

// Never use focus:outline-none without a replacement
```

### 2. Touch Targets
```tsx
// Minimum 44x44px for touch devices
className="min-w-[44px] min-h-[44px] p-2"

// For smaller visual elements, add transparent padding
className="p-3" // Creates larger hit area
```

### 3. Decorative vs Informative Images
```tsx
// Decorative (icons, backgrounds, visual flourishes)
<svg aria-hidden="true" role="presentation" focusable="false">
<img alt="" aria-hidden="true"> // Empty alt for decorative images

// Informative (conveys meaning)
<svg aria-label="Search" role="img">
<img alt="Descriptive text of what image shows">
```

### 4. Semantic HTML First
```tsx
// ✅ GOOD: Use semantic HTML
<button>Click me</button>
<nav><ul><li><a href="...">

// ❌ BAD: Don't recreate with divs
<div onClick={...} role="button">Click me</div>
```

---

## Navigation Components

### Navbar Pattern
```tsx
<header role="banner">
  {/* Skip link - REQUIRED */}
  <a href="#main-content" 
     className="sr-only focus:not-sr-only ...">
    Skip to main content
  </a>
  
  <nav aria-label="Main navigation">
    <ul> {/* Not role="menubar" - that's for app menus */}
      <li>
        <Link href="..." 
              aria-current={isActive ? "page" : undefined}
              className="... focus-visible:ring-2">
          Page Name
        </Link>
      </li>
    </ul>
  </nav>
</header>
```

### Footer Pattern
```tsx
<footer role="contentinfo" aria-label="Site footer">
  <nav aria-label="Footer navigation">
    <Link href="..." 
          className="... focus-visible:ring-2"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}>
      Link Name
      {external && <span className="sr-only"> (opens in new window)</span>}
    </Link>
  </nav>
  
  <nav aria-label="Social media links">
    <a href="..." 
       target="_blank" 
       rel="noopener noreferrer"
       aria-label="Follow us on Twitter (opens in new window)"
       className="... p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center
                  focus-visible:ring-2">
      <svg aria-hidden="true" role="presentation" focusable="false">
        {/* icon */}
      </svg>
    </a>
  </nav>
</footer>
```

### Breadcrumbs Pattern
```tsx
<nav aria-label="Breadcrumb">
  <ol>
    {items.map((item, index) => (
      <li key={item.href}>
        {index > 0 && (
          <svg aria-hidden="true" role="presentation">{/* separator */}</svg>
        )}
        {isLast ? (
          <span aria-current="page">{item.label}</span>
        ) : (
          <Link href={item.href} 
                aria-label={`Go to ${item.label}`}>
            {item.label}
          </Link>
        )}
      </li>
    ))}
  </ol>
</nav>
```

---

## Card Components

### Card Pattern
```tsx
<article> {/* Don't add role="article" - redundant */}
  <Link href={href}
        aria-label={`View details for ${title}`}
        className="... focus-visible:ring-2 focus-visible:ring-offset-2">
    
    <div aria-label={`${title} thumbnail`}>
      <img src={...} alt={descriptiveAlt} />
    </div>
    
    <h3>{title}</h3>
    
    <p>{description}</p>
    
    {/* Decorative chevron */}
    <svg aria-hidden="true" role="presentation" focusable="false">
      <path d="M9 5l7 7-7 7" />
    </svg>
  </Link>
</article>
```

### Card Grid Pattern
```tsx
<section aria-label="Material categories" role="region">
  <h2>{gridTitle}</h2>
  
  <div role="list"> {/* Optional: marks as list for screen readers */}
    {cards.map(card => (
      <div role="listitem" key={card.id}>
        <Card {...card} />
      </div>
    ))}
  </div>
  
  {hasMore && (
    <button aria-label={`View all ${category} items`}
            className="... focus-visible:ring-2">
      View All {count}
      <svg aria-hidden="true" role="presentation">{/* chevron */}</svg>
    </button>
  )}
</section>
```

---

## Form Components

### Form Pattern (CRITICAL)
```tsx
<form onSubmit={handleSubmit} noValidate> {/* noValidate to use custom validation */}
  
  {/* Error Summary - shows on validation failure */}
  {Object.keys(errors).length > 0 && (
    <div ref={errorSummaryRef}
         tabIndex={-1}
         role="alert"
         aria-labelledby="error-summary-title"
         className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
      <h3 id="error-summary-title" className="font-semibold text-red-800">
        Please correct the following errors:
      </h3>
      <ul className="mt-2 list-disc list-inside">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            <a href={`#${field}`} className="text-red-600 underline">
              {error}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Text Input Field */}
  <div>
    <label htmlFor="email" id="email-label" className="...">
      Email Address
      <span aria-label="required"> *</span>
    </label>
    <input
      id="email"
      name="email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      aria-labelledby="email-label"
      aria-describedby={errors.email ? "email-error" : "email-hint"}
      aria-invalid={errors.email ? "true" : "false"}
      aria-required="true"
      className={`... ${errors.email ? 'border-red-500' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:outline-none`}
    />
    <p id="email-hint" className="mt-1 text-sm text-gray-500">
      We'll never share your email
    </p>
    {errors.email && (
      <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
        <svg aria-hidden="true" className="inline w-4 h-4 mr-1">
          {/* error icon */}
        </svg>
        {errors.email}
      </p>
    )}
  </div>
  
  {/* Select Field */}
  <div>
    <label htmlFor="inquiry-type" className="...">
      Type of Inquiry
      <span aria-label="required"> *</span>
    </label>
    <select
      id="inquiry-type"
      name="inquiryType"
      value={formData.inquiryType}
      onChange={handleChange}
      aria-required="true"
      className="... focus:ring-2 focus:ring-blue-500">
      <option value="">Select an option</option>
      <option value="general">General Inquiry</option>
      {/* ... */}
    </select>
  </div>
  
  {/* Textarea Field */}
  <div>
    <label htmlFor="message" className="...">
      Message
      <span aria-label="required"> *</span>
    </label>
    <textarea
      id="message"
      name="message"
      rows={5}
      value={formData.message}
      onChange={handleChange}
      aria-describedby={errors.message ? "message-error" : "message-hint"}
      aria-invalid={errors.message ? "true" : "false"}
      aria-required="true"
      className="... focus:ring-2"
    />
    <p id="message-hint" className="...">
      Minimum 10 characters
    </p>
    {errors.message && (
      <p id="message-error" role="alert" className="...">
        {errors.message}
      </p>
    )}
  </div>
  
  {/* Submit Button */}
  <button
    type="submit"
    disabled={isSubmitting}
    aria-busy={isSubmitting}
    aria-disabled={isSubmitting}
    className="... focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed">
    {isSubmitting ? (
      <>
        <span className="sr-only">Submitting form, please wait</span>
        <svg aria-hidden="true" className="animate-spin ...">
          {/* spinner */}
        </svg>
        <span aria-hidden="true">Sending...</span>
      </>
    ) : (
      'Send Message'
    )}
  </button>
  
  {/* Status Messages */}
  {submitStatus.type && (
    <div role="alert"
         aria-live="assertive"
         aria-atomic="true"
         className={submitStatus.type === 'success' ? 'bg-green-50 ...' : 'bg-red-50 ...'}>
      {submitStatus.message}
    </div>
  )}
</form>
```

### Form Validation Handler
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    // Focus error summary for keyboard users
    errorSummaryRef.current?.focus();
    return;
  }
  
  // ... submit logic
  
  // On success: focus success message or reset form
  successMessageRef.current?.focus();
};
```

---

## Interactive Components (Buttons, CTAs)

### Button Pattern
```tsx
<button
  type="button"
  onClick={handleClick}
  disabled={isDisabled}
  aria-label="Descriptive action label"
  aria-pressed={isPressed} // for toggle buttons
  className="... min-w-[44px] min-h-[44px] p-2
             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
             disabled:opacity-50 disabled:cursor-not-allowed">
  Button Text
  {icon && <svg aria-hidden="true">{/* icon */}</svg>}
</button>
```

### Link as Button Pattern
```tsx
<Link
  href="/page"
  role="button" // Only if styled like button
  aria-label="Descriptive label"
  className="... inline-flex items-center justify-center min-h-[44px]
             focus:outline-none focus-visible:ring-2">
  Link Text
  <svg aria-hidden="true" role="presentation" focusable="false">
    {/* decorative icon */}
  </svg>
</Link>
```

---

## Data Display Components

### Metrics Card Pattern (Per Documentation)
```tsx
<article
  data-component="metrics-card"
  data-property={propertyName}
  itemScope
  itemType="https://schema.org/PropertyValue">
  
  <h3 itemProp="name">{title}</h3>
  
  <figure role="img" aria-labelledby="progress-label">
    <div role="progressbar"
         aria-valuenow={value}
         aria-valuemin={min}
         aria-valuemax={max}
         aria-labelledby="progress-label"
         tabIndex={0}
         className="focus:ring-2">
      {/* progress visualization */}
    </div>
    <figcaption id="progress-label" className="sr-only">
      {title} progress indicator
    </figcaption>
  </figure>
  
  <data
    value={numericValue}
    data-property={propertyName}
    data-unit={unit}
    data-type="measurement"
    data-context="material_property"
    data-precision={precision}
    itemProp="value"
    itemType="https://schema.org/PropertyValue">
    {displayValue}
  </data>
  
  <span itemProp="unitCode" title={fullUnitName}>
    {unit}
  </span>
  
  <div className="sr-only">
    {title}: {displayValue} {unit}.
    Range: {min} to {max} {unit}.
    Current progress: {percentage}%.
  </div>
</article>
```

---

## Modal/Dialog Pattern

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description">
  
  <div className="dialog-backdrop" 
       onClick={closeModal}
       aria-hidden="true" />
  
  <div className="dialog-content">
    <h2 id="dialog-title">{title}</h2>
    <p id="dialog-description">{description}</p>
    
    <button onClick={closeModal}
            aria-label="Close dialog"
            className="... focus:ring-2">
      <svg aria-hidden="true">{/* X icon */}</svg>
    </button>
    
    {/* Dialog content */}
  </div>
</div>
```

---

## Loading States

```tsx
{isLoading ? (
  <div role="status" aria-live="polite" aria-label="Loading content">
    <svg aria-hidden="true" className="animate-spin">
      {/* spinner */}
    </svg>
    <span className="sr-only">Loading, please wait...</span>
  </div>
) : (
  <div>{content}</div>
)}
```

---

## Error States

```tsx
{error && (
  <div role="alert" 
       aria-live="assertive"
       className="...">
    <svg aria-hidden="true" className="...">
      {/* error icon */}
    </svg>
    <span>{error.message}</span>
  </div>
)}
```

---

## Testing Your Components

### Quick Accessibility Test
```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Add to app
import { axe } from '@axe-core/react';
if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}
```

### Keyboard Test Script
1. Tab through component - all interactive elements reachable?
2. Shift+Tab backwards - order makes sense?
3. Enter/Space activate buttons/links?
4. Arrow keys work for navigation (where applicable)?
5. Escape closes modals/menus?
6. Focus indicators visible?

### Screen Reader Test
1. Does it announce the component purpose?
2. Are relationships clear (labels, descriptions)?
3. Are state changes announced (errors, loading, success)?
4. Is the reading order logical?

---

## Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Missing focus indicator
<button className="focus:outline-none">

// Div button
<div onClick={...}>Click me</div>

// Button link
<button onClick={() => router.push('/page')}>

// Redundant ARIA
<button role="button">
<article role="article">

// No alt text
<img src="..." />

// Decorative icon without hiding
<svg><path .../></svg>

// Touch target too small
<button className="p-1 w-8 h-8">
```

### ✅ Do This Instead
```tsx
// Visible focus indicator
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">

// Semantic button
<button onClick={...}>Click me</button>

// Semantic link
<Link href="/page">Go to page</Link>

// No redundant roles
<button>
<article>

// Proper alt text
<img src="..." alt="Descriptive text" />
// OR for decorative
<img src="..." alt="" aria-hidden="true" />

// Hide decorative icons
<svg aria-hidden="true" role="presentation" focusable="false">

// Adequate touch target
<button className="p-2 min-w-[44px] min-h-[44px]">
```

---

## Resources

- WCAG 2.1 AA Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- Inclusive Components: https://inclusive-components.design/
- A11y Project Checklist: https://www.a11yproject.com/checklist/
