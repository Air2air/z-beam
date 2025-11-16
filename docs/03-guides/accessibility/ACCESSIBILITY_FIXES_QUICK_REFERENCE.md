# Quick Reference: Accessibility Fixes Needed

## 🔴 CRITICAL - Fix Immediately

### 1. Footer Social Icons
**File:** `app/components/Navigation/footer.tsx`

```tsx
// Add these classes to each social link:
className="...
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"

// Add to SVG:
<svg aria-hidden="true" role="presentation" focusable="false" ...>
```

### 2. Contact Form Errors
**File:** `app/components/Contact/ContactForm.tsx`

```tsx
// Add to each input:
aria-invalid={errors.fieldName ? "true" : "false"}
aria-describedby={errors.fieldName ? "fieldName-error" : undefined}
aria-required="true" // for required fields

// Add error messages:
{errors.fieldName && (
  <p id="fieldName-error" role="alert" className="mt-1 text-sm text-red-600">
    {errors.fieldName}
  </p>
)}

// Add status announcements:
{submitStatus.type && (
  <div role="alert" aria-live="assertive" aria-atomic="true">
    {submitStatus.message}
  </div>
)}
```

### 3. All Decorative Icons
**Files:** Multiple

```tsx
// Add to ALL decorative SVGs:
<svg aria-hidden="true" role="presentation" focusable="false" ...>
```

### 4. Card Focus Indicators
**File:** `app/components/Card/Card.tsx`

```tsx
// Add to Link:
className="... focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
```

---

## 🟡 HIGH Priority

### 5. Touch Targets (All Components)

```tsx
// Minimum touch target: 44x44px
// Add to buttons, links, interactive elements:
className="... p-2 min-w-[44px] min-h-[44px]"
```

### 6. Breadcrumbs Current Page
**File:** `app/components/Navigation/breadcrumbs.tsx`

```tsx
// Add to last item:
<span aria-current="page" className="...">
  {crumb.label}
</span>
```

### 7. Navigation Touch Targets
**File:** `app/components/Navigation/nav.tsx`

```tsx
// Change mobile button:
<button className="md:hidden ... p-2 min-w-[44px] min-h-[44px]">
```

---

## Quick Test Checklist

- [ ] Tab through entire site with keyboard only
- [ ] All focus indicators visible and consistent
- [ ] All touch targets minimum 44x44px
- [ ] Form errors announced by screen reader
- [ ] All decorative images/icons have aria-hidden
- [ ] No WCAG violations in axe DevTools
- [ ] Test at 200% zoom
- [ ] Test with screen reader (NVDA/VoiceOver)

---

## Files to Update (Priority Order)

1. `app/components/Navigation/footer.tsx` - Social icons
2. `app/components/Contact/ContactForm.tsx` - Form errors
3. `app/components/Card/Card.tsx` - Focus indicators
4. `app/components/CTA/CallToAction.tsx` - Icon attributes, touch targets
5. `app/components/Navigation/nav.tsx` - Touch targets
6. `app/components/Navigation/breadcrumbs.tsx` - aria-current

---

## Resources

- Full audit: `docs/COMPONENT_ACCESSIBILITY_AUDIT.md`
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- axe DevTools: https://www.deque.com/axe/devtools/
