# Z-Beam Accessibility Guide

## Overview

Z-Beam is committed to providing an accessible website that serves all users, including those with disabilities. Our accessibility implementation follows the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA compliance.

## Accessibility Features

### 1. Navigation Accessibility

#### Skip Links
- **Purpose**: Allow users to bypass repetitive navigation
- **Implementation**: Jump directly to main content
- **Keyboard Access**: Available via Tab key
- **Screen Reader Support**: Properly announced by assistive technology

```tsx
// Skip link implementation
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white p-2 rounded"
>
  Skip to main content
</a>
```

#### Keyboard Navigation
- **Full Keyboard Support**: All interactive elements accessible via keyboard
- **Logical Tab Order**: Sequential navigation follows visual layout
- **Focus Management**: Clear visual focus indicators
- **Escape Functionality**: Modal dialogs and menus can be closed with Escape key

#### Mobile Menu Accessibility
- **ARIA States**: Proper expanded/collapsed states
- **Button Semantics**: Hamburger menu uses button element
- **Screen Reader Labels**: Descriptive labels for menu toggle
- **Focus Trapping**: Focus contained within open mobile menu

```tsx
// Mobile menu button
<button
  className="md:hidden"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-menu"
  aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
>
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</button>
```

### 2. Form Accessibility

#### Contact Form Features
- **Label Association**: All form controls have associated labels
- **Required Field Indication**: Visual and programmatic indication
- **Error Handling**: Clear error messages with ARIA live regions
- **Input Validation**: Real-time validation with accessible feedback

```tsx
// Accessible form input
<div className="mb-4">
  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-200">
    Your Name <span className="text-red-400" aria-label="required">*</span>
  </label>
  <input
    type="text"
    id="name"
    name="name"
    required
    aria-describedby="name-error"
    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
  />
  <div id="name-error" role="alert" aria-live="polite" className="text-red-400 text-sm mt-1">
    {errors.name && errors.name.message}
  </div>
</div>
```

#### Autocomplete Support
- **Personal Information**: Name, email, phone autocomplete
- **Address Fields**: Street, city, postal code autocomplete
- **Performance Benefit**: Faster form completion for all users

### 3. Content Accessibility

#### Semantic HTML Structure
- **Proper Heading Hierarchy**: h1 → h2 → h3 structure maintained
- **Landmark Regions**: main, nav, footer, article, section elements
- **List Semantics**: Proper ul, ol, and li usage
- **Button vs Link**: Correct element choice for functionality

#### Image Accessibility
- **Alternative Text**: Descriptive alt text for all informative images
- **Decorative Images**: Empty alt="" for decorative elements
- **Complex Images**: Extended descriptions when needed
- **Icon Accessibility**: ARIA labels for icon-only buttons

```tsx
// Accessible image implementation
<img 
  src="/images/services/video-production.jpg" 
  alt="Professional video production setup with camera, lighting equipment, and crew member adjusting settings"
  className="w-full h-48 object-cover rounded-lg"
/>

// Decorative image
<img 
  src="/images/decorative-pattern.png" 
  alt="" 
  aria-hidden="true"
  className="absolute inset-0 opacity-10"
/>
```

#### Color and Contrast
- **WCAG AA Compliance**: 4.5:1 contrast ratio for normal text
- **Enhanced Contrast**: 7:1 ratio for better readability
- **Color Independence**: Information not conveyed by color alone
- **Dark Theme Support**: High contrast maintained in dark mode

### 4. Interactive Elements

#### Focus Management
- **Visible Focus Indicators**: Clear outline and background changes
- **Focus Order**: Logical sequence following visual layout
- **Focus Trapping**: Modal dialogs contain focus appropriately
- **Focus Restoration**: Return focus to trigger element when closing dialogs

#### Button Accessibility
- **Descriptive Labels**: Clear purpose for all buttons
- **State Communication**: Loading, disabled states properly announced
- **Icon Buttons**: Text alternatives for icon-only buttons
- **Touch Targets**: Minimum 44px touch target size

```tsx
// Accessible button with loading state
<button
  type="submit"
  disabled={isSubmitting}
  aria-describedby="submit-status"
  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <span className="sr-only">Sending message...</span>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Sending...
    </>
  ) : (
    'Send Message'
  )}
</button>
```

### 5. Screen Reader Support

#### ARIA Implementation
- **Landmarks**: region, navigation, main, contentinfo roles
- **Live Regions**: Status updates and dynamic content changes
- **Expanded States**: aria-expanded for collapsible content
- **Hidden Content**: aria-hidden for decorative elements

#### Screen Reader Testing
- **NVDA**: Windows screen reader compatibility
- **JAWS**: Professional screen reader support
- **VoiceOver**: macOS and iOS accessibility
- **TalkBack**: Android accessibility service

### 6. Responsive Accessibility

#### Mobile Accessibility
- **Touch Targets**: Minimum 44px size for touch elements
- **Gesture Alternatives**: Keyboard alternatives for touch gestures
- **Orientation Support**: Works in portrait and landscape
- **Zoom Support**: 200% zoom without horizontal scrolling

#### Tablet Accessibility
- **Flexible Layout**: Adapts to various screen sizes
- **Touch and Keyboard**: Supports both input methods
- **Focus Indicators**: Clear focus states on tablet devices

## Testing and Validation

### Automated Testing
Our accessibility is validated through comprehensive automated testing:

```bash
# Run accessibility test suite (74 tests)
npm test -- --testNamePattern="accessibility"

# Test results:
✅ Navigation: 18 tests passing
✅ Contact: 22 tests passing  
✅ Hero: 11 tests passing
✅ Caption: 15 tests passing
✅ Author: 4 tests passing
✅ Tags: 4 tests passing
```

### Manual Testing Procedures

#### Keyboard Testing
1. **Tab Navigation**: Ensure all interactive elements are reachable
2. **Enter/Space Activation**: Buttons and links respond appropriately
3. **Escape Functionality**: Dialogs and menus close with Escape
4. **Arrow Key Navigation**: Menus and complex widgets support arrow keys

#### Screen Reader Testing
1. **Content Order**: Logical reading order maintained
2. **Landmark Navigation**: Quick navigation between page sections
3. **Form Interaction**: Labels, instructions, and errors properly announced
4. **Dynamic Content**: Changes announced via live regions

#### Visual Testing
1. **Focus Indicators**: Clearly visible focus states
2. **Color Contrast**: Meets WCAG AA requirements
3. **Text Scaling**: Readable at 200% zoom
4. **Dark Mode**: Accessibility maintained in both themes

### Accessibility Tools

#### Browser Extensions
- **axe DevTools**: Automated accessibility scanning
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Accessibility audit included
- **Colour Contrast Analyser**: Manual contrast checking

#### Testing Commands
```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility

# axe-core testing
npm run test:a11y

# Color contrast validation
npm run test:contrast
```

## Accessibility Standards Compliance

### WCAG 2.1 Level AA Conformance

#### Perceivable
- ✅ Text alternatives for images
- ✅ Captions and alternatives for multimedia
- ✅ Content can be presented in different ways without losing meaning
- ✅ Sufficient color contrast

#### Operable
- ✅ All functionality available via keyboard
- ✅ Users have enough time to read content
- ✅ Content does not cause seizures or physical reactions
- ✅ Users can navigate and find content

#### Understandable
- ✅ Text is readable and understandable
- ✅ Content appears and operates in predictable ways
- ✅ Users are helped to avoid and correct mistakes

#### Robust
- ✅ Content works with various assistive technologies
- ✅ Code validates and follows standards
- ✅ Compatible with current and future assistive tools

### Additional Standards

#### Section 508 Compliance
- ✅ Federal accessibility requirements met
- ✅ Government contractor compatibility
- ✅ Public sector accessibility standards

#### ADA Compliance
- ✅ Americans with Disabilities Act considerations
- ✅ Equal access principles applied
- ✅ Reasonable accommodations provided

## User Experience for People with Disabilities

### Vision Impairments
- **Screen Reader Support**: Full compatibility with assistive technology
- **High Contrast**: Enhanced visibility options
- **Text Scaling**: Supports up to 200% zoom
- **Keyboard Navigation**: Complete keyboard accessibility

### Motor Impairments
- **Large Touch Targets**: Minimum 44px touch areas
- **Keyboard Alternatives**: All mouse actions have keyboard equivalents
- **Timeout Extensions**: Generous time limits for form completion
- **Sticky Focus**: Focus indicators remain visible

### Hearing Impairments
- **Visual Cues**: Important information not conveyed by audio alone
- **Text Alternatives**: Written equivalents for audio content
- **Captions**: Video content includes captions (when applicable)

### Cognitive Impairments
- **Clear Language**: Plain language and simple sentence structure
- **Consistent Navigation**: Predictable interface patterns
- **Error Prevention**: Clear form validation and error messages
- **Help Text**: Contextual assistance and instructions

## Feedback and Support

### Accessibility Contact
If you encounter any accessibility barriers on our website, please contact us:

**Z-Beam Accessibility Team**
- **Email**: accessibility@z-beam.com
- **Phone**: (650) 241-8510
- **Mail**: Contact via phone or email for physical service location

### Response Commitment
- **Acknowledgment**: Within 2 business days
- **Assessment**: Within 1 week
- **Resolution**: Within 2 weeks for simple issues
- **Complex Issues**: Timeline provided within 1 week

### Continuous Improvement
We continuously work to improve our website's accessibility:

- **Regular Audits**: Quarterly accessibility reviews
- **User Testing**: Testing with actual users with disabilities
- **Staff Training**: Ongoing accessibility education
- **Technology Updates**: Keeping up with best practices

## Future Enhancements

### Planned Improvements
- **Voice Navigation**: Voice control interface
- **Reading Mode**: Simplified reading experience
- **Dyslexia Support**: Enhanced font and spacing options
- **Motor Assistance**: Advanced keyboard shortcuts

### Emerging Standards
- **WCAG 3.0**: Preparing for next generation guidelines
- **Cognitive Accessibility**: Enhanced cognitive support features
- **Mobile Accessibility**: Advanced mobile accessibility features

---

## Resources

### Accessibility Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Standards](https://www.section508.gov/)
- [WebAIM Resources](https://webaim.org/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Assistive Technology
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/)

---

*This accessibility guide is maintained as part of our commitment to inclusive design. Last updated: September 22, 2025*
