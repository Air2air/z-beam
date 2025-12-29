# SEO Implementation Plan - December 28, 2025

## 🎯 5 Priority Improvements

### 1. FAQ Schema ✅ (Already exists - needs activation)
**Status**: Schema generator exists in SchemaFactory.ts
**Action**: Ensure FAQ data in frontmatter generates schema automatically
**Files**: Check `app/utils/schemas/SchemaFactory.ts`

### 2. Featured Snippet Optimization
**Action**: Add structured answer formats to content
**Implementation**:
- Question H2 headings
- 40-60 word direct answers
- List/table formats where appropriate
- Content restructuring script

### 3. Article Schema ✅ (Already exists)
**Status**: Schema generator exists in SchemaFactory.ts  
**Action**: Verify it's active on all pages
**Files**: `app/utils/schemas/SchemaFactory.ts`

### 4. Entity Optimization
**Implementation**:
- Entity mapping (materials, contaminants, processes)
- Contextual internal linking
- Co-occurrence validation
- Knowledge graph markup

### 5. Advanced Core Web Vitals
**Implementation**:
- Resource hints (preload/prefetch)
- Critical CSS inlining
- Image optimization monitoring
- Performance tracking dashboard

## 📊 Implementation Order

**Week 1** (This week):
1. Verify FAQ/Article schemas active
2. Create featured snippet helper
3. Start entity mapping

**Week 2**:
4. Internal linking automation
5. Core Web Vitals monitoring

## 🚀 Quick Start

```bash
# Verify current schema output
npm run build
curl http://localhost:3000/materials/aluminum-laser-cleaning | grep '@type'

# Run SEO validation
npm run seo:test
```

---

**Version**: 1.0.0  
**Priority**: High  
**Timeline**: 2 weeks
