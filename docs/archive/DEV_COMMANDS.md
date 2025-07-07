# Quick Development Commands for :3000

## 🚀 BEFORE STARTING :3000

**Always run this first to ensure everything works:**
```bash
npm run dev
```
**This will:**
1. Run comprehensive health checks
2. **Automatically kill anything using port 3000**
3. Start Next.js development server on http://localhost:3000

**Or run just the health check:**
```bash
npm run ready
```

**Manual port management:**
```bash
npm run kill-port    # Kill processes using port 3000
```

## ✅ WHAT THE READY CHECK VALIDATES:

1. **CSS & Styling** - Tailwind, PostCSS, global.css imports
2. **Port Availability** - Checks if :3000 is free (or suggests alternatives)
3. **Dependencies** - Next.js, React, Tailwind, PostCSS installed
4. **Component System** - Shared components exist, no violations
5. **TypeScript** - Compilation clean (excluding test files)
6. **Build System** - Config files present and valid
7. **Environment** - Node.js version compatibility

## 🎯 READY CHECK RESULTS:

- **🎉 PERFECT** = Everything green, :3000 will work flawlessly
- **✅ READY** = Minor warnings, but :3000 will work fine  
- **❌ NOT READY** = Critical issues need fixing before :3000

## 🔧 COMMON FIXES:

**If CSS doesn't load:**
```bash
# Check imports and config
npm run ready
# Look for ❌ in CSS & STYLING section
```

**If port 3000 is busy:**
```bash
# Automatic (runs with npm run dev)
npm run dev  # Automatically kills port 3000 processes

# Manual
npm run kill-port  # Just kill port 3000 processes
```

**If dependencies missing:**
```bash
npm install
npm run ready  # Verify fix
```

**If TypeScript errors:**
```bash
npx tsc --noEmit  # See specific errors
# Fix issues, then:
npm run ready  # Verify fix
```

**If component violations:**
```bash
npm run enforce-components  # See specific violations
# Fix duplications, then:
npm run ready  # Verify fix
```

## 💡 PRO TIPS:

1. **Always run `npm run ready` before coding** to catch issues early
2. **Bookmark this workflow:** `npm run ready && npm run dev`
3. **Keep terminal open** with ready check results for reference
4. **If :3000 stops working,** run `npm run ready` to diagnose

## 🚨 EMERGENCY FIXES:

**Nuclear option if everything breaks:**
```bash
# Clear everything and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run ready
npm run dev
```

**Quick cache clear:**
```bash
rm -rf .next
npm run dev
```

---

**Your development environment is now bulletproof! 🛡️**
