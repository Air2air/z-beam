---
title: "Getting Started with Z-Beam"
category: "Quick Start"
difficulty: "Beginner"
lastUpdated: "2025-09-11"
relatedDocs: ["development-workflow.md", "common-commands.md", "project-overview.md"]
copilotTags: ["quickstart", "setup", "installation", "beginner"]
---

# Getting Started with Z-Beam

> **Quick Reference**: Complete setup guide for new developers joining the Z-Beam Laser Cleaning project.

## 🎯 Prerequisites

### **Required Software**
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher  
- **Git**: Latest version
- **Python**: 3.8+ (for YAML processing)

### **Development Environment**
- **Code Editor**: VS Code (recommended) with TypeScript extension
- **Terminal**: bash or zsh
- **Browser**: Chrome or Firefox (for development)

## 🚀 Installation

### **1. Clone Repository**
```bash
git clone https://github.com/Air2air/z-beam.git
cd z-beam
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# No additional configuration needed for local development
```

### **4. Verify Installation**
```bash
# Run health checks
npm run ready

# Expected output: All systems green ✅
```

## 🏃‍♂️ First Run

### **Start Development Server**
```bash
npm run dev
```

**Expected Output:**
```
✅ Health checks passed
✅ Port 3000 available  
✅ CSS compiled successfully
✅ TypeScript validation passed
✅ Component system verified

🚀 Server ready at http://localhost:3000
```

### **Verify Everything Works**
1. **Open browser**: http://localhost:3000
2. **Check homepage**: Should load Z-Beam content
3. **Test navigation**: Click through material pages
4. **Verify search**: Try searching for materials

## 📁 Project Structure

```
z-beam/
├── app/                    # Next.js application
│   ├── components/         # React components
│   ├── utils/              # Utility functions
│   ├── [slug]/            # Dynamic content routes
│   └── layout.tsx         # Root layout
├── content/               # All markdown content
│   ├── material/          # Material articles
│   ├── application/       # Application content
│   └── author/            # Author profiles
├── docs/                  # Documentation (you are here)
├── public/               # Static assets
├── yaml-processor/       # YAML processing system
└── tests/               # Test files
```

## 🔧 Essential Commands

### **Development**
```bash
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Start production server
npm run type-check      # TypeScript validation
```

### **Content Management**
```bash
npm run yaml            # Process all YAML files
npm run yaml:validate   # Validate without changes
npm run yaml:materials  # Process material files only
```

### **Quality Assurance**
```bash
npm run lint            # Code linting
npm run test            # Run tests
npm run enforce-components  # Component rules check
```

### **Troubleshooting**
```bash
npm run ready           # Health check all systems
npm run kill-port       # Free up port 3000
npm run dev:direct      # Emergency bypass dev start
```

## 🧭 Development Workflow

### **Daily Development Loop**
1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Process content** (if working with content):
   ```bash
   npm run yaml
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

4. **Make changes** following [Component Rules](../development/component-rules.md)

5. **Test changes**:
   ```bash
   npm run test
   npm run type-check
   ```

6. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature-branch
   ```

## 🎯 Key Concepts

### **Content System**
- **Markdown Files**: All content in `/content/` directory
- **YAML Frontmatter**: Metadata at top of each file
- **Dynamic Routing**: `/app/[slug]/` handles all content URLs
- **Automatic Processing**: YAML processor ensures data consistency

### **Component Architecture**
- **Modify Before Create**: Extend existing components first
- **Zero Duplication**: Each UI pattern exists once
- **Type Safety**: Full TypeScript coverage
- **Testing Required**: Every component needs tests

### **Build System**
- **Static Generation**: Pre-renders all pages
- **Health Checks**: Validates system before build
- **Automatic Optimization**: Next.js handles performance
- **Deployment Ready**: Optimized for Vercel

## ✅ Verification Checklist

After setup, verify these work:

- [ ] **Development server starts** without errors
- [ ] **Homepage loads** at http://localhost:3000
- [ ] **Material pages work** (e.g., `/aluminum-laser-cleaning`)
- [ ] **Search functions** properly
- [ ] **YAML processing** runs without errors
- [ ] **TypeScript compilation** passes
- [ ] **Tests run** successfully

## ❌ Common Setup Issues

### **Problem**: Port 3000 already in use
**Solution**:
```bash
npm run kill-port
npm run dev
```

### **Problem**: CSS not loading
**Solution**:
```bash
# Check Tailwind compilation
npm run build:css
npm run dev
```

### **Problem**: TypeScript errors
**Solution**:
```bash
# Check for missing dependencies
npm install
npm run type-check
```

### **Problem**: YAML processing fails
**Solution**:
```bash
# Check Python installation
python --version  # Should be 3.8+
npm run yaml:validate
```

## 🔗 Next Steps

### **For New Developers**
1. [Development Workflow](./development-workflow.md) - Learn daily development process
2. [Project Overview](../architecture/project-overview.md) - Understand architecture
3. [Component Rules](../development/component-rules.md) - Component development guidelines

### **For Content Work**
1. [Content System](../architecture/content-system.md) - Content management
2. [YAML Processing](../systems/yaml-processing.md) - Content validation

### **For Advanced Development**
1. [Build & Deployment](../architecture/build-deployment.md) - Production deployment
2. [Testing Framework](../development/testing-framework.md) - Testing strategies

## 🆘 Getting Help

- **Development Issues**: Check [Troubleshooting](../operations/troubleshooting.md)
- **Component Questions**: See [Component Rules](../development/component-rules.md)
- **Content Problems**: Reference [YAML Processing](../systems/yaml-processing.md)
- **Build Issues**: Follow [Build Guide](../architecture/build-deployment.md)

---

**Welcome to Z-Beam development!** 🚀 You're now ready to contribute to the laser cleaning content management system.
