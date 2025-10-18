# Partners Page - Social Media Images Needed

**Status:** 🎨 Design Required  
**Date:** October 17, 2025

## Required Images

### 1. OpenGraph Image
- **Path:** `/public/images/partners/partners-og-image.jpg`
- **Dimensions:** 1200×630px
- **Format:** JPG, optimized for web
- **Content:** 
  - Composite layout featuring all 3 partner logos:
    - Laserverse logo
    - MacK Laser Restoration logo
    - Netalux logo
  - "Z-Beam Partners" heading
  - Optional: "North America & Europe" subheading
  - Professional, clean design matching Z-Beam branding

### 2. Twitter Card Image
- **Path:** `/public/images/partners/partners-twitter-card.jpg`
- **Dimensions:** 1200×675px (or reuse 1200×630 from OG)
- **Format:** JPG, optimized for web
- **Content:** Same as OpenGraph image

## Design Specifications

### Layout Options

**Option A: Horizontal Layout**
```
┌─────────────────────────────────────┐
│   Z-BEAM PARTNERS                   │
│   North America & Europe            │
│                                     │
│  [Laserverse]  [MacK]  [Netalux]   │
│                                     │
└─────────────────────────────────────┘
```

**Option B: Grid Layout**
```
┌─────────────────────────────────────┐
│   Z-BEAM PARTNERS                   │
│                                     │
│   [Laserverse]    [MacK Laser]     │
│                                     │
│      [Netalux]                      │
│                                     │
│   North America & Europe            │
└─────────────────────────────────────┘
```

### Color Palette
- Background: Dark gray (#1f2937) or Z-Beam brand color
- Text: White (#ffffff)
- Accent: Blue (#3b82f6) for emphasis
- Partner logos: Original colors on transparent/white backgrounds

### Typography
- Heading: Bold, large (48-60px)
- Subheading: Regular, medium (24-32px)
- Ensure readability on small social media previews

## Temporary Fallback

Until custom images are created, you can:

1. **Use existing hero image:**
   Update `app/partners/page.tsx`:
   ```tsx
   images: [
     {
       url: '/images/partners/partners_hero.jpg',
       width: 1200,
       height: 630,
       alt: 'Professional laser cleaning equipment and services',
     }
   ]
   ```

2. **Use generic Z-Beam image:**
   ```tsx
   images: [
     {
       url: '/images/og-image.jpg', // Site-wide OG image
       width: 1200,
       height: 630,
       alt: 'Z-Beam - Professional Laser Cleaning Services',
     }
   ]
   ```

## Source Files Location

Partner logos are located at:
- `/public/images/partners/partner_laserverse.png`
- `/public/images/partners/partner_mack.png`
- `/public/images/partners/partner_netalux.png`

## Design Tools

Recommended tools for creating these images:
- **Figma:** Professional design with collaboration
- **Canva:** Quick creation with templates
- **Adobe Photoshop:** Advanced editing and compositing
- **GIMP:** Free alternative to Photoshop

## SEO Impact

These images will appear in:
- ✅ Facebook link previews
- ✅ LinkedIn share cards
- ✅ Twitter cards
- ✅ Slack/Discord link unfurls
- ✅ Search engine image results
- ✅ Social media feeds

**Priority:** Medium-High  
**Estimated Design Time:** 1-2 hours

---

## Checklist

- [ ] Create composite OG image (1200×630px)
- [ ] Create Twitter card image (1200×675px) or reuse OG
- [ ] Optimize images for web (compress to <200KB)
- [ ] Place in `/public/images/partners/` directory
- [ ] Test with Facebook Debugger
- [ ] Test with Twitter Card Validator
- [ ] Verify images load correctly on localhost
- [ ] Deploy to production

## Testing URLs

After creating images, validate with:
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

