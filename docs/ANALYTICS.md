# Google Analytics 4 Event Tracking

## Overview

The Z-Beam application implements custom event tracking for dataset downloads using Google Analytics 4 (GA4). This allows tracking of user engagement with research data and understanding which materials and formats are most valuable.

## Implementation

### Analytics Utility

Location: `app/utils/analytics.ts`

```typescript
// Generic event tracking
trackEvent(eventName: string, eventParams?: Record<string, any>)

// Dataset download tracking
trackDatasetDownload({
  format: 'json' | 'csv' | 'txt',
  category?: string,
  subcategory?: string,
  materialName?: string,
  fileSize?: number
})

// FAQ interaction tracking
trackFAQClick({
  materialName: string,
  question: string,
  questionIndex: number,
  isExpanding: boolean
})
```

### Integration Points

All dataset download components track downloads automatically:

1. **Category-level downloads** (`CategoryDatasetCardWrapper.tsx`)
   - Tracks aggregate downloads of all materials in a category
   - Includes total material count and file size

2. **Subcategory-level downloads** (`SubcategoryDatasetWrapper.tsx`)
   - Tracks downloads of specific subcategory datasets
   - Includes category and subcategory context

3. **Material-level downloads** (`MaterialDatasetCardWrapper.tsx`)
   - Tracks individual material dataset downloads
   - Includes specific material name and properties

4. **Complete database downloads** (`DatasetsContent.tsx`)
   - Tracks downloads of the entire materials database
   - Includes bundle downloads by category

5. **FAQ interactions** (`MaterialFAQ.tsx`)
   - Tracks when users expand/collapse FAQ items
   - Captures question text and position for engagement analysis

## Event Structure

### Dataset Download Event

**Event Name:** `dataset_download`

**Event Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_category` | string | Always "Dataset" | `"Dataset"` |
| `event_label` | string | Material or category name | `"Porphyry"` or `"Metals-Alloys"` |
| `format` | string | Download format | `"json"`, `"csv"`, `"txt"` |
| `category` | string | Material category | `"stone"`, `"metals"`, `"complete-database"` |
| `subcategory` | string | Material subcategory | `"igneous"`, `"ferrous"` |
| `material_name` | string | Specific material name | `"Porphyry"`, `"Complete Database"` |
| `file_size` | number | File size in bytes | `45821` |
| `value` | number | Always 1 for conversion tracking | `1` |

### FAQ Interaction Event

**Event Name:** `faq_interaction`

**Event Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_category` | string | Always "FAQ" | `"FAQ"` |
| `event_label` | string | Material name | `"Porphyry"` |
| `material_name` | string | Material name | `"Porphyry"` |
| `question` | string | FAQ question text (no markdown) | `"What laser wavelength works best?"` |
| `question_index` | number | Position in FAQ list (0-based) | `0`, `1`, `2` |
| `action` | string | User action | `"expand"`, `"collapse"` |
| `value` | number | 1 for expand, 0 for collapse | `1`, `0` |

## GA4 Configuration

### Initial Setup

The GoogleAnalytics component is automatically loaded in `app/layout.tsx`:

```tsx
<GoogleAnalytics gaId="G-TZF55CB5XC" />
```

### Custom Dimensions (Optional)

For advanced reporting, create custom dimensions in GA4:

1. Go to **Admin → Data display → Custom definitions**
2. Click **Create custom dimension**
3. Create dimensions for each parameter:

| Dimension Name | Event Parameter | Scope |
|----------------|-----------------|-------|
| Download Format | `format` | Event |
| Material Category | `category` | Event |
| Material Subcategory | `subcategory` | Event |
| Material Name | `material_name` | Event |
| File Size | `file_size` | Event |

### Conversion Tracking

To track downloads as conversions:

1. Go to **Admin → Events**
2. Find `dataset_download` event (appears after first event received)
3. Toggle **Mark as conversion**

To track FAQ engagement as conversions:

1. Go to **Admin → Events**
2. Find `faq_interaction` event
3. Toggle **Mark as conversion** (optional - useful for measuring content effectiveness)

## Reporting

### Real-time Monitoring

Events appear immediately in:
- **Reports → Realtime** - Live download activity
- **Reports → Events** - Within hours of first event

### Custom Reports

Create explorations to analyze:
- **Format preferences**: Which formats (JSON/CSV/TXT) are most popular
- **Material popularity**: Most downloaded materials and categories
- **Download patterns**: Time-based trends and user behavior
- **File size distribution**: Understanding data usage patterns
- **FAQ engagement**: Which questions users expand most frequently
- **Content effectiveness**: Materials with high FAQ interaction rates
- **User journey**: FAQ expansions that lead to downloads

### Example Queries

**Top 10 Downloaded Materials:**
```
Event name: dataset_download
Dimension: material_name
Metric: Event count
```

**Downloads by Format:**
```
Event name: dataset_download
Dimension: format
Metric: Event count
```

**Category Performance:**
```
Event name: dataset_download
Dimension: category
Secondary dimension: format
Metric: Event count, Total file size
```

**Most Engaged FAQs:**
```
Event name: faq_interaction
Filter: action = "expand"
Dimension: question
Secondary dimension: material_name
Metric: Event count
```

**FAQ Engagement by Material:**
```
Event name: faq_interaction
Dimension: material_name
Metric: Event count, Unique users
Sort by: Event count descending
```

## Development Mode

When `NODE_ENV=development`, events are logged to browser console instead of GA4:

```javascript
[Analytics] dataset_download {
  format: "json",
  category: "stone",
  material_name: "Porphyry",
  file_size: 45821
}

[Analytics] faq_interaction {
  material_name: "Porphyry",
  question: "What laser wavelength works best?",
  question_index: 0,
  action: "expand"
}
```

This prevents development activity from polluting production analytics.

## Testing

### Manual Testing

1. Open production site
2. Navigate to any material page
3. Click dataset download button (JSON/CSV/TXT)
4. Check GA4 Realtime reports for `dataset_download` event

### Automated Testing

Currently no automated tests for analytics tracking. Event calls are simple function invocations that don't require mocking in unit tests.

## Privacy & Compliance

- No personally identifiable information (PII) is tracked
- All data is anonymized through GA4
- Events track user behavior, not user identity
- Compliant with research data usage policies

## Troubleshooting

### Events Not Appearing

1. **Check browser console** - Development mode logs events locally
2. **Verify GA4 ID** - Confirm `G-TZF55CB5XC` is correct
3. **Wait 24-48 hours** - Custom parameters need time to appear
4. **Check ad blockers** - May prevent GA4 script loading

### Missing Parameters

If parameters don't appear in GA4:
1. Events are logged but parameters not yet discovered
2. Wait 24-48 hours for auto-discovery
3. Create custom dimensions manually if needed

### Booking Event

**Event Name:** `booking_cta_clicked`

**Event Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_category` | string | Always "Booking" | `"Booking"` |
| `location` | string | Where the CTA appears | `"material-page"`, `"homepage"` |
| `material` | string | Material context (if applicable) | `"Porphyry"` |
| `cta_text` | string | Button text clicked | `"Schedule Consultation"` |

**Event Name:** `booking_calendar_viewed`

**Event Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_category` | string | Always "Booking" | `"Booking"` |

**Event Name:** `booking_calendar_loaded`

**Event Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `event_category` | string | Always "Booking" | `"Booking"` |
| `status` | string | Load status | `"success"`, `"error"` |

## Future Enhancements

Potential additions:
- User journey tracking (page views → downloads)
- Search query tracking (what users search before downloading)
- Download completion rate (initiated vs completed)
- Dataset quality metrics (user feedback integration)
- Booking conversion funnel (CTA click → calendar view → calendar load → submission)

## References

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9744165)
- [GA4 Custom Events](https://support.google.com/analytics/answer/12229021)
- [@next/third-parties Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
