# Business Configuration Guide

## Overview
The Z-Beam website now includes a comprehensive business configuration system that automatically generates SEO-optimized Schema.org markup for your business. This system centralizes all business information in one place and dynamically generates structured data for search engines.

## Configuration File Location
- **File**: `/app/utils/business-config.ts`
- **Purpose**: Centralized business information management
- **Benefits**: Single source of truth, automatic Schema.org generation, SEO optimization

## How to Update Your Business Information

### 1. Edit the Configuration File
Open `/app/utils/business-config.ts` and update all the placeholders marked with "UPDATE:" comments.

### 2. Required Updates

#### Basic Business Information
```typescript
legal: {
  name: "Your Legal Business Name", // Replace with actual legal name
  foundingDate: "2020", // Replace with your founding year
  businessType: "LLC", // Corporation, LLC, Partnership, etc.
  // ... update other fields
}
```

#### Contact Information
```typescript
contact: {
  address: {
    street: "Your Street Address",
    city: "Your City",
    state: "Your State",
    zipCode: "Your ZIP",
    country: "US"
  },
  phone: {
    main: "Your Phone Number",
    // ... update other numbers
  },
  email: {
    main: "Your Email",
    // ... update other emails
  }
}
```

#### Social Media Profiles
```typescript
social: {
  linkedin: "Your LinkedIn URL",
  instagram: "Your Instagram URL",
  facebook: "Your Facebook URL",
  twitter: "Your Twitter URL",
  // ... add more platforms as needed
}
```

#### Services Offered
```typescript
services: [
  {
    name: "Your Service Name",
    description: "Service description",
    category: "Service Category"
  },
  // Add more services as needed
]
```

### 3. Optional Configurations

#### Professional Credentials
Uncomment and update with your actual certifications:
```typescript
credentials: [
  {
    name: "Your Certification Name",
    issuer: "Certification Authority",
    category: "Professional Certification"
  }
]
```

#### Awards & Recognition
Uncomment and update with your actual awards:
```typescript
awards: [
  {
    name: "Award Name",
    issuer: "Award Authority",
    year: "2024"
  }
]
```

## How the System Works

### 1. Configuration Import
The layout file imports the configuration and generation function:
```typescript
import { generateOrganizationSchema } from "./utils/business-config";
```

### 2. Schema Generation
The system automatically generates comprehensive Schema.org markup:
- Organization schema with all business details
- Contact information and business hours
- Service catalog and area served
- Social media profiles and credentials

### 3. SEO Benefits
- **Rich Snippets**: Your business appears with enhanced information in search results
- **Knowledge Panel**: Google may display your business information in a knowledge panel
- **Local SEO**: Improved visibility for local searches
- **Voice Search**: Better compatibility with voice assistants
- **Structured Data**: Machine-readable business information

## Generated Schema Types

The system generates the following Schema.org markup:

### Organization Schema
- Business name and legal name
- Contact information and address
- Social media profiles
- Services offered
- Business hours and service area
- Professional credentials

### Contact Points
- Customer service contact
- Sales contact
- Support contact
- Available languages

### Offer Catalog
- Services offered by your business
- Service descriptions and categories

### Opening Hours
- Business operating hours
- Day-specific schedules

## Validation and Testing

### 1. Schema Validation
Use Google's Rich Results Test to validate your structured data:
- Visit: https://search.google.com/test/rich-results
- Enter your website URL
- Check for any validation errors

### 2. Local SEO Testing
Use Google's Structured Data Testing Tool:
- Visit: https://developers.google.com/search/docs/appearance/structured-data
- Test your business pages
- Verify all information appears correctly

### 3. Search Console Monitoring
Monitor your structured data in Google Search Console:
- Check for structured data errors
- Monitor rich result impressions
- Track local search performance

## Best Practices

### 1. Accuracy
- Ensure all information is accurate and up-to-date
- Use consistent business names across all platforms
- Verify phone numbers and addresses

### 2. Completeness
- Fill in as many fields as possible
- Add all relevant services and credentials
- Include all active social media profiles

### 3. Regular Updates
- Review and update information quarterly
- Add new services and credentials as they become available
- Update business hours for holidays or changes

### 4. Schema Markup Guidelines
- Follow Schema.org best practices
- Use specific schema types when possible
- Avoid markup for content not visible to users

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors
- Ensure all required fields are filled
- Check array typing for credentials and awards
- Verify import statements are correct

#### 2. Schema Validation Errors
- Use Google's testing tools to identify issues
- Check for missing required properties
- Verify URL formats for social media

#### 3. SEO Impact Delay
- Schema markup effects can take weeks to appear
- Monitor Search Console for structured data issues
- Be patient with rich snippet appearance

## Support Resources

### Google Documentation
- [Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data)
- [Organization Schema](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Local Business Schema](https://developers.google.com/search/docs/appearance/structured-data/local-business)

### Schema.org Documentation
- [Organization Type](https://schema.org/Organization)
- [Local Business](https://schema.org/LocalBusiness)
- [Service](https://schema.org/Service)

### Testing Tools
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Structured Data Testing Tool](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)

## Next Steps

1. **Update Configuration**: Edit `/app/utils/business-config.ts` with your actual business information
2. **Test Schema**: Use Google's testing tools to validate your markup
3. **Monitor Performance**: Set up Google Search Console monitoring
4. **Regular Maintenance**: Schedule quarterly reviews of your business information

Remember: The more accurate and complete your business information, the better your SEO performance and search engine visibility will be.
