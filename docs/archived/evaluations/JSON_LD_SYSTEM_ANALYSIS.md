# JSON-LD System E2E Analysis & Refactor Proposal

**Date:** November 5, 2025  
**Status:** Critical Issues Identified

---

## Executive Summary

The JSON-LD system has **inconsistent data access patterns** causing schema generation failures. The dev server validation approach is **fundamentally flawed** and causes resource exhaustion.

### Critical Issues Found

1. **Inconsistent Data Property Access** (HIGH PRIORITY)
   - Some code checks `data.frontmatter`, some checks `data.metadata`
   - Incomplete migration in 30+ locations
   - Product schema never generates for material pages

2. **Dev Server Validation Anti-Pattern** (HIGH PRIORITY)
   - Spawns uncontrolled Next.js processes
   - No proper cleanup on timeout/error
   - Consumes 5+ CPU cores indefinitely
   - Causes system resource exhaustion

3. **Mixed Schema Generation Strategies**
   - SchemaFactory (new, registry-based)
   - Legacy jsonld-helper functions
   - MaterialJsonLD component (uses both)
   - No clear migration path

---

## Part 1: Current Architecture Analysis

### 1.1 Data Flow

```
YAML Files (frontmatter/*.yaml)
    ↓
contentAPI.getArticle()
    ↓
Returns: { metadata: {...}, components: {...} }
    ↓
Page Component (e.g., materials/[slug]/page.tsx)
    ↓
<MaterialJsonLD article={article} slug={slug} />
    ↓
SchemaFactory(article, slug)
    ↓
Checks conditions using data.frontmatter ❌ (should be data.metadata)
    ↓
Only generates schemas that pass conditions
    ↓
Result: Missing Dataset, HowTo, Product, Person schemas
```

### 1.2 Inconsistent Property Access Patterns

**Location 1: SchemaFactory Conditions (INCONSISTENT)**
```typescript
// Line 156 - Checks BOTH ✅
condition: (data) => !!(data.frontmatter?.category || data.metadata?.category)

// Line 179 - Fixed recently ✅
const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;

// Line 208 - Only checks frontmatter ❌
const fm = data.frontmatter as Record<string, unknown> | undefined;

// Line 276 - hasProductData only checks frontmatter ❌
const fm = data.frontmatter as Record<string, unknown> | undefined;
```

**Location 2: Generator Functions (MIXED)**
```typescript
// generateArticleSchema - Uses BOTH ✅
const frontmatter = data.frontmatter || data.metadata || {};

// generateProductSchema - Unknown (need to check)
// generateDatasetSchema - Unknown (need to check)
// generateHowToSchema - Unknown (need to check)
```

### 1.3 Schema Registration vs Generation

**Problem:** Schemas registered but conditions fail

```typescript
// Registered
this.register('Dataset', generateDatasetSchema, {
  priority: 20,
  condition: (data) => {
    const fm = (data.frontmatter || data.metadata) as Record<string, unknown> | undefined;
    return !!fm?.materialProperties; // ✅ Fixed
  }
});

// But hasProductData still broken
function hasProductData(data: any): boolean {
  const fm = data.frontmatter as Record<string, unknown> | undefined; // ❌ Wrong
  return !!(
    data.needle100_150 ||
    data.needle200_300 ||
    data.jangoSpecs ||
    fm?.materialProperties ||  // Never true because data.metadata.materialProperties
    data.products
  );
}
```

---

## Part 2: Dev Server Issues Analysis

### 2.1 The Problem

**Script:** `scripts/validate-jsonld-rendering.js`

**Intended Behavior:**
1. Spawn dev server on port 3010
2. Wait for "Ready" message (60s timeout)
3. Fetch test pages
4. Extract and validate JSON-LD
5. Kill server
6. Exit

**Actual Behavior:**
1. Spawn dev server ✅
2. Server starts compiling
3. Script timeout fires BUT doesn't kill process ❌
4. Process continues running with file watching ❌
5. Any file change triggers hot reload ❌
6. Infinite compilation loop
7. CPU: 495% (5 cores), RAM: 14GB
8. System becomes unresponsive

### 2.2 Root Cause

```javascript
// Line 40-75: startServer()
setTimeout(() => {
  if (!serverReady) {
    console.error('Server output:', output);
    reject(new Error('Server failed to start within 60s timeout'));
  }
}, 60000);
```

**Issues:**
1. `reject()` doesn't kill the spawned process
2. No cleanup in rejection handler
3. No process reference stored for later cleanup
4. `serverProcess.kill()` in `stopServer()` never called on timeout

### 2.3 Process Lifecycle

```
spawn('npm', ['run', 'dev', '--', '-p', PORT])
    ↓
Creates: node process (npm)
    ↓
Spawns: next-server process
    ↓
Script timeout → reject() → script exits
    ↓
node process continues ❌
next-server continues ❌
File watcher continues ❌
Hot reload continues ❌
```

**The spawned processes become orphaned and never terminate.**

---

## Part 3: Refactor Proposals

### 3.1 Immediate Fixes (Critical - Do Now)

#### Fix 1: Normalize Data Access Helper

**File:** `app/utils/schemas/helpers.ts` (NEW)

```typescript
/**
 * Safely access frontmatter/metadata from various data structures
 * Handles inconsistency between contentAPI (returns metadata) and 
 * static pages (use frontmatter)
 */
export function getMetadata(data: any): Record<string, unknown> {
  return (data.metadata || data.frontmatter || data.pageConfig || data) as Record<string, unknown>;
}

/**
 * Check if material has product data for Product schema
 */
export function hasProductData(data: any): boolean {
  const meta = getMetadata(data);
  return !!(
    data.needle100_150 ||
    data.needle200_300 ||
    data.jangoSpecs ||
    meta.materialProperties ||  // Now works with both metadata and frontmatter
    data.products
  );
}

/**
 * Check if material has machine settings for HowTo schema
 */
export function hasMachineSettings(data: any): boolean {
  const meta = getMetadata(data);
  return !!(meta.machineSettings || data.steps);
}

/**
 * Check if material has material properties for Dataset schema
 */
export function hasMaterialProperties(data: any): boolean {
  const meta = getMetadata(data);
  return !!meta.materialProperties;
}

/**
 * Check if has author for Person schema
 */
export function hasAuthor(data: any): boolean {
  const meta = getMetadata(data);
  return !!(meta.author || data.author);
}
```

#### Fix 2: Update SchemaFactory to Use Helpers

```typescript
// Import helper
import { getMetadata, hasProductData, hasMachineSettings, hasMaterialProperties, hasAuthor } from './helpers';

// Update conditions
this.register('Product', generateProductSchema, {
  priority: 75,
  condition: (data) => hasProductData(data)  // Now actually works
});

this.register('HowTo', generateHowToSchema, {
  priority: 60,
  condition: (data) => hasMachineSettings(data)
});

this.register('Dataset', generateDatasetSchema, {
  priority: 20,
  condition: (data) => hasMaterialProperties(data)
});

this.register('Person', generatePersonSchema, {
  priority: 25,
  condition: (data) => hasAuthor(data)
});
```

#### Fix 3: Replace Dev Server Validation with Static Build Validation

**File:** `scripts/validate-jsonld-static.js` (ALREADY CREATED)

**Benefits:**
- No dev server needed ✅
- Uses actual build output ✅
- Fast (< 1 second) ✅
- No resource leaks ✅
- Validates production output ✅

**Integration:**
```json
// package.json
{
  "scripts": {
    "validate:jsonld-rendering": "node scripts/validate-jsonld-static.js",
    "validate:jsonld-old": "node scripts/validate-jsonld-rendering.js"  // Keep for reference
  }
}
```

### 3.2 Medium-Term Improvements

#### Improvement 1: Unified Schema Data Interface

**File:** `app/utils/schemas/types.ts`

```typescript
/**
 * Normalized schema data structure
 * Handles both contentAPI (metadata) and static pages (frontmatter)
 */
export interface NormalizedSchemaData {
  // Required
  title: string;
  description: string;
  
  // Optional but common
  author?: PersonData;
  datePublished?: string;
  dateModified?: string;
  images?: ImageData;
  
  // Material-specific
  materialProperties?: MaterialProperties;
  machineSettings?: MachineSettings;
  applications?: string[];
  faq?: FAQItem[];
  regulatoryStandards?: string[];
  
  // Technical
  category?: string;
  subcategory?: string;
  slug?: string;
}

/**
 * Normalize raw data into standard format
 */
export function normalizeSchemaData(rawData: any): NormalizedSchemaData {
  const meta = getMetadata(rawData);
  
  return {
    title: meta.title || rawData.title || '',
    description: meta.description || rawData.description || '',
    author: meta.author || rawData.author,
    datePublished: meta.datePublished || rawData.datePublished,
    dateModified: meta.dateModified || rawData.dateModified,
    images: meta.images || rawData.images,
    materialProperties: meta.materialProperties,
    machineSettings: meta.machineSettings,
    applications: meta.applications,
    faq: meta.faq,
    regulatoryStandards: meta.regulatoryStandards,
    category: meta.category,
    subcategory: meta.subcategory,
    slug: rawData.slug || meta.slug
  };
}
```

#### Improvement 2: SchemaFactory Constructor Update

```typescript
constructor(data: SchemaData, slug: string, baseUrl?: string) {
  // Normalize data immediately
  this.data = normalizeSchemaData(data);
  
  this.context = {
    slug,
    baseUrl: baseUrl || SITE_CONFIG.url,
    pageUrl: `${baseUrl || SITE_CONFIG.url}/${slug}`,
    currentDate: new Date().toISOString().split('T')[0]
  };

  this.registerDefaultSchemas();
}
```

#### Improvement 3: Generator Functions Update

All generator functions receive normalized data, no more `frontmatter || metadata` checks:

```typescript
function generateArticleSchema(data: NormalizedSchemaData, context: SchemaContext): SchemaOrgBase | null {
  // Direct access, no fallbacks needed
  const { title, description, author, datePublished, dateModified, applications } = data;
  
  if (!title) return null;
  
  return {
    '@type': 'Article',
    '@id': `${context.pageUrl}#article`,
    'headline': title,
    'description': description,
    // ... rest of schema
  };
}
```

### 3.3 Long-Term Architecture

#### Option A: Keep Dual System (Recommended for now)

**Rationale:**
- SchemaFactory is complex but flexible
- Legacy system still used in some places
- Migration is risky

**Approach:**
1. Fix immediate data access issues ✅
2. Deprecate legacy but keep functional
3. Migrate page-by-page over time
4. Add comprehensive tests

#### Option B: Simplified Single System

**Rationale:**
- Two systems is confusing
- SchemaFactory is over-engineered
- Most pages need same schemas

**Approach:**
1. Create simple schema builders per page type:
   - `createMaterialPageSchemas(data, context)`
   - `createCategoryPageSchemas(data, context)`
   - `createStaticPageSchemas(data, context)`
2. Each returns array of schemas
3. No registry, no conditions, just direct generation
4. Easier to understand and maintain

**Example:**
```typescript
export function createMaterialPageSchemas(article: Article, slug: string): SchemaOrgBase[] {
  const schemas: SchemaOrgBase[] = [];
  const meta = getMetadata(article);
  const url = `${SITE_CONFIG.url}/${slug}`;
  
  // Always include core schemas
  schemas.push(createWebPageSchema(meta, url));
  schemas.push(createBreadcrumbSchema(meta, slug));
  
  // Article schema
  schemas.push(createArticleSchema(meta, url));
  
  // Conditional schemas with explicit checks
  if (meta.materialProperties) {
    schemas.push(createDatasetSchema(meta, url));
    schemas.push(createProductSchema(meta, url));
  }
  
  if (meta.machineSettings) {
    schemas.push(createHowToSchema(meta, url));
  }
  
  if (meta.author) {
    schemas.push(createPersonSchema(meta.author, url));
  }
  
  if (meta.faq) {
    schemas.push(createFAQSchema(meta.faq, url));
  }
  
  return schemas;
}
```

---

## Part 4: Dev Server Safeguards

### 4.1 Process Management Safeguards

#### Safeguard 1: Proper Process Cleanup

**File:** `scripts/utils/process-manager.js` (NEW)

```javascript
/**
 * Robust process manager for validation scripts
 */
class ProcessManager {
  constructor() {
    this.processes = new Set();
    this.setupCleanupHandlers();
  }
  
  /**
   * Spawn a process and track it for cleanup
   */
  spawn(command, args, options = {}) {
    const proc = require('child_process').spawn(command, args, options);
    this.processes.add(proc);
    
    proc.on('exit', () => {
      this.processes.delete(proc);
    });
    
    return proc;
  }
  
  /**
   * Kill all tracked processes
   */
  killAll() {
    console.log(`Cleaning up ${this.processes.size} processes...`);
    
    for (const proc of this.processes) {
      try {
        // Kill process group to get child processes too
        process.kill(-proc.pid, 'SIGTERM');
        
        // Force kill after 2s if still alive
        setTimeout(() => {
          try {
            process.kill(-proc.pid, 'SIGKILL');
          } catch (e) {
            // Already dead, ignore
          }
        }, 2000);
      } catch (e) {
        console.warn(`Failed to kill process ${proc.pid}:`, e.message);
      }
    }
    
    this.processes.clear();
  }
  
  /**
   * Setup handlers to cleanup on script exit
   */
  setupCleanupHandlers() {
    const cleanup = () => {
      this.killAll();
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err);
      this.killAll();
      process.exit(1);
    });
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      this.killAll();
      process.exit(1);
    });
  }
}

module.exports = new ProcessManager();
```

#### Safeguard 2: Port Checking Before Start

```javascript
/**
 * Check if port is in use
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

/**
 * Find available port
 */
async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (!(await isPortInUse(port))) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + maxAttempts}`);
}
```

#### Safeguard 3: Resource Monitoring

```javascript
/**
 * Monitor process resources and kill if exceeds limits
 */
class ResourceMonitor {
  constructor(proc, limits = {}) {
    this.proc = proc;
    this.limits = {
      maxCPU: limits.maxCPU || 200, // 200% = 2 cores
      maxMemory: limits.maxMemory || 2 * 1024 * 1024 * 1024, // 2GB
      maxDuration: limits.maxDuration || 120000 // 2 minutes
    };
    this.startTime = Date.now();
    this.interval = null;
  }
  
  start() {
    this.interval = setInterval(() => this.check(), 1000);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  async check() {
    const pid = this.proc.pid;
    const duration = Date.now() - this.startTime;
    
    // Check duration
    if (duration > this.limits.maxDuration) {
      console.error(`Process ${pid} exceeded max duration ${this.limits.maxDuration}ms`);
      this.kill('Duration limit exceeded');
      return;
    }
    
    // Check CPU and memory (using pidusage or similar)
    try {
      const stats = await require('pidusage')(pid);
      
      if (stats.cpu > this.limits.maxCPU) {
        console.error(`Process ${pid} CPU usage: ${stats.cpu.toFixed(1)}% (limit: ${this.limits.maxCPU}%)`);
        this.kill('CPU limit exceeded');
      }
      
      if (stats.memory > this.limits.maxMemory) {
        console.error(`Process ${pid} Memory usage: ${(stats.memory / 1024 / 1024).toFixed(0)}MB (limit: ${(this.limits.maxMemory / 1024 / 1024).toFixed(0)}MB)`);
        this.kill('Memory limit exceeded');
      }
    } catch (e) {
      // Process likely dead
      this.stop();
    }
  }
  
  kill(reason) {
    console.error(`Killing process ${this.proc.pid}: ${reason}`);
    this.stop();
    try {
      process.kill(-this.proc.pid, 'SIGKILL');
    } catch (e) {
      console.warn(`Failed to kill: ${e.message}`);
    }
  }
}
```

#### Safeguard 4: Updated Validation Script

```javascript
#!/usr/bin/env node

const processManager = require('./utils/process-manager');
const { isPortInUse, findAvailablePort } = require('./utils/port-utils');
const ResourceMonitor = require('./utils/resource-monitor');

async function startServer() {
  console.log('🔍 Checking for available port...');
  
  const port = await findAvailablePort(3010, 5);
  console.log(`✅ Found available port: ${port}`);
  
  console.log('🚀 Starting Next.js dev server...');
  
  const proc = processManager.spawn('npm', ['run', 'dev', '--', '-p', port], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: port.toString() },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true  // Create process group for easier cleanup
  });
  
  // Monitor resources
  const monitor = new ResourceMonitor(proc, {
    maxCPU: 200,    // 2 cores max
    maxMemory: 2 * 1024 * 1024 * 1024,  // 2GB max
    maxDuration: 120000  // 2 minutes max
  });
  monitor.start();
  
  // Wait for server ready
  return new Promise((resolve, reject) => {
    let output = '';
    let resolved = false;
    
    const dataHandler = (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('Local:') || text.includes('Ready in')) {
        if (!resolved) {
          resolved = true;
          monitor.stop();
          setTimeout(() => resolve({ port, proc, monitor }), 2000);
        }
      }
    };
    
    proc.stdout.on('data', dataHandler);
    proc.stderr.on('data', dataHandler);
    
    // Timeout with proper cleanup
    setTimeout(() => {
      if (!resolved) {
        monitor.stop();
        console.error('Server startup timeout. Output:');
        console.error(output);
        processManager.killAll();
        reject(new Error('Server failed to start within timeout'));
      }
    }, 60000);
  });
}

async function main() {
  try {
    const { port, proc, monitor } = await startServer();
    
    // Run tests...
    
    // Cleanup
    monitor.stop();
    processManager.killAll();
    
  } catch (error) {
    console.error('Fatal error:', error);
    processManager.killAll();
    process.exit(1);
  }
}

main();
```

### 4.2 Validation Strategy Safeguards

#### Safeguard 5: Prefer Static Analysis

**Priority Order:**
1. ✅ **Static build validation** (validate-jsonld-static.js) - USE THIS
2. ⚠️ **HTTP validation against running server** - Only if server already running
3. ❌ **Spawn dev server** - Never in CI/automation

#### Safeguard 6: CI/CD Guards

**File:** `.github/workflows/validation.yml`

```yaml
name: JSON-LD Validation

on: [push, pull_request]

jobs:
  validate-jsonld:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      
      # Build first (required for static validation)
      - run: npm run build
      
      # Use static validation only
      - run: npm run validate:jsonld-rendering
      
      # Never spawn dev servers in CI
```

---

## Recommendations

### Immediate Actions (This Week)

1. ✅ **Create `getMetadata()` helper** - Normalize data access
2. ✅ **Update all `hasX()` condition functions** - Use helper
3. ✅ **Fix `hasProductData()` specifically** - Critical for material pages
4. ✅ **Switch to static validation** - Update package.json scripts
5. ✅ **Test material page JSON-LD** - Verify all schemas generate
6. ✅ **Add resource monitoring** - Prevent future runaway processes

### Short Term (This Month)

1. Create unified test suite for JSON-LD
2. Document data flow and architecture
3. Add schema validation to pre-commit hooks
4. Migrate remaining pages to SchemaFactory

### Long Term (Next Quarter)

1. Evaluate Option B (simplified system)
2. Create schema builder per page type
3. Remove legacy jsonld-helper
4. Add performance monitoring

---

## Testing Plan

### Test 1: Verify All Material Pages Generate Complete Schemas

```bash
# Build
npm run build

# Validate
node scripts/validate-jsonld-static.js

# Expected: All 4 test pages pass
# Expected schemas for material page:
# - Article ✅
# - Dataset ✅ (currently missing)
# - HowTo ✅ (currently missing)
# - Product ✅ (currently missing)
# - Person ✅ (currently missing)
# - BreadcrumbList ✅
# - WebPage ✅
```

### Test 2: Verify No Process Leaks

```bash
# Before test
ps aux | grep -E "(node|next)" | wc -l

# Run validation
npm run validate:jsonld-rendering

# After test
ps aux | grep -E "(node|next)" | wc -l

# Expected: Same count (no leaked processes)
```

### Test 3: Verify Resource Limits

```bash
# Monitor during validation
while true; do
  ps aux | grep "next-server" | grep -v grep | awk '{print $3, $4, $11}' 
  sleep 1
done

# Expected: CPU < 200%, Memory < 2GB, Duration < 2min
```

---

## Conclusion

The JSON-LD system has two critical issues:

1. **Inconsistent data access** preventing schema generation - FIXABLE NOW
2. **Dangerous dev server validation** causing resource leaks - FIXED with static validation

Both can be resolved with the immediate fixes proposed above. The medium and long-term improvements will make the system more maintainable but are not critical.

**Priority:** Fix data access immediately, switch to static validation, add process safeguards.
