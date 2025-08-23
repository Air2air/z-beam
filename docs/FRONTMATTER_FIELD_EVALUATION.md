# Frontmatter Fields Evaluation for Title and Subtitle

## Current Field Analysis

Based on examination of the frontmatter files, here are the available fields and their characteristics:

### Available Fields:

1. **`title`**: Full SEO-optimized title (e.g., "Laser Cleaning Carbon Fiber Reinforced Polymer - Technical Guide for Optimal Processing")
2. **`headline`**: Concise descriptive headline (e.g., "Comprehensive technical guide for laser cleaning composite carbon fiber reinforced polymer")
3. **`subject`**: Material name (e.g., "Carbon Fiber Reinforced Polymer", "Porcelain")
4. **`name`**: Short material name (same as subject typically)
5. **`description`**: Technical overview with specifications and applications

## Recommended Field Hierarchy

### For Title (in order of preference):
1. **`metadata?.title`** (Primary) - Most comprehensive and SEO-friendly
2. **`metadata?.headline`** (Secondary) - Concise and descriptive
3. **`metadata?.subject`** (Tertiary) - Material name fallback
4. **`title` prop** (Override) - Manual override if needed
5. **`Article: ${slug}`** (Final fallback)

### For Subtitle (contextual logic):
- **When title field is used**: Use `metadata?.headline` as subtitle
- **When headline is used as title**: Use `metadata?.description` as subtitle
- **When subject is used as title**: Use `metadata?.description` as subtitle

## Implementation

The logic now implemented is:

```typescript
// Title hierarchy
const displayTitle = title || metadata?.title || metadata?.headline || metadata?.subject || (slug ? `Article: ${slug}` : '');

// Subtitle logic
const displaySubtitle = metadata?.title ? metadata?.headline : metadata?.description;
```

## Benefits of This Approach

1. **SEO Optimization**: Prioritizes the full `title` field which is optimized for search engines
2. **Fallback Gracefully**: Provides multiple fallback options for different content scenarios
3. **Context-Aware Subtitles**: Uses appropriate subtitle based on which title field is selected
4. **Consistent Experience**: Ensures all pages have meaningful titles and subtitles
5. **Content Flexibility**: Allows content creators to choose the most appropriate title approach

## Field Usage Examples

### Example 1: Full title available
- **Title**: "Laser Cleaning Carbon Fiber Reinforced Polymer - Technical Guide for Optimal Processing"
- **Subtitle**: "Comprehensive technical guide for laser cleaning composite carbon fiber reinforced polymer"

### Example 2: Only headline and subject available
- **Title**: "Comprehensive technical guide for laser cleaning composite carbon fiber reinforced polymer"
- **Subtitle**: "Technical overview of Carbon Fiber Reinforced Polymer for laser cleaning applications..."

### Example 3: Minimal fields available
- **Title**: "Carbon Fiber Reinforced Polymer"
- **Subtitle**: "Technical overview of Carbon Fiber Reinforced Polymer for laser cleaning applications..."
