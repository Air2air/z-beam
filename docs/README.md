# Z-Beam Documentation Hub

> **Comprehensive documentation for the Z-Beam Laser Cleaning project, optimized for GitHub Copilot integration**

## 🚀 Quick Navigation

### **Start Here**
- [Getting Started](./quick-start/getting-started.md) - First-time setup and installation
- [Development Workflow](./quick-start/development-workflow.md) - Daily development guide
- [Common Commands](./quick-start/common-commands.md) - Essential CLI commands

### **Core Architecture**
- [Project Overview](./architecture/project-overview.md) - High-level system architecture
- [Content System](./architecture/content-system.md) - Content management and routing
- [Component System](./architecture/component-system.md) - React component architecture
- [Build & Deployment](./architecture/build-deployment.md) - Build pipeline and deployment

### **Development**
- [Coding Standards](./development/coding-standards.md) - Code style and best practices
- [Component Rules](./development/component-rules.md) - Component development guidelines
- [Testing Framework](./development/testing-framework.md) - Testing strategy and tools
- [Debugging Guide](./development/debugging-guide.md) - Troubleshooting development issues

### **System Documentation**
- [YAML Processing](./systems/yaml-processing.md) - YAML processor system
- [Cleanup System](./systems/cleanup-system.md) - Dead file cleanup automation
- [Predeploy System](./systems/predeploy-system.md) - Pre-deployment validation
- [Monitoring](./systems/monitoring.md) - System monitoring and logging

### **Operations**
- [Deployment Guide](./operations/deployment-guide.md) - Production deployment process
- [Troubleshooting](./operations/troubleshooting.md) - Common issues and solutions
- [Maintenance](./operations/maintenance.md) - Regular maintenance tasks
- [Performance](./operations/performance.md) - Performance optimization

### **Reference**
- [API Reference](./reference/api-reference.md) - Utility functions and APIs
- [Configuration](./reference/configuration.md) - Configuration files and options
- [Scripts Reference](./reference/scripts-reference.md) - npm scripts and tools
- [File Structure](./reference/file-structure.md) - Project directory structure

## 📖 Documentation by Role

### **For New Developers**
1. [Getting Started](./quick-start/getting-started.md)
2. [Project Overview](./architecture/project-overview.md)
3. [Development Workflow](./quick-start/development-workflow.md)
4. [Coding Standards](./development/coding-standards.md)

### **For Component Development**
1. [Component System](./architecture/component-system.md)
2. [Component Rules](./development/component-rules.md)
3. [Testing Framework](./development/testing-framework.md)

### **For Content Management**
1. [Content System](./architecture/content-system.md)
2. [YAML Processing](./systems/yaml-processing.md)

### **For DevOps/Deployment**
1. [Build & Deployment](./architecture/build-deployment.md)
2. [Predeploy System](./systems/predeploy-system.md)
3. [Deployment Guide](./operations/deployment-guide.md)

## 🔍 By Topic/System

### **Component Development**
- [Component Rules](./development/component-rules.md) `#components` `#rules`
- [Component Architecture](./architecture/component-system.md) `#architecture`
- [Component Testing](./development/testing-framework.md) `#testing`

### **Content & YAML**
- [Content System](./architecture/content-system.md) `#content` `#routing`
- [YAML Processing](./systems/yaml-processing.md) `#yaml` `#processing`

### **Build & Deploy**
- [Build System](./architecture/build-deployment.md) `#build` `#nextjs`
- [Predeploy Validation](./systems/predeploy-system.md) `#predeploy` `#validation`
- [Deployment Process](./operations/deployment-guide.md) `#deployment` `#vercel`

### **Maintenance & Operations**
- [Cleanup System](./systems/cleanup-system.md) `#cleanup` `#automation`
- [System Monitoring](./systems/monitoring.md) `#monitoring` `#logging`
- [Troubleshooting](./operations/troubleshooting.md) `#troubleshooting`

## 🏷️ Copilot Tags

This documentation uses standardized tags for easy GitHub Copilot reference:

- `#quickstart` - Getting started guides
- `#architecture` - System architecture docs
- `#components` - Component development
- `#content` - Content management
- `#yaml` - YAML processing
- `#build` - Build system
- `#deployment` - Deployment process
- `#testing` - Testing framework
- `#troubleshooting` - Problem solving
- `#reference` - API and configuration reference

## 📋 Documentation Standards

### **File Naming Convention**
- Use kebab-case: `component-rules.md`
- Be descriptive but concise
- Include topic prefix when needed

### **Document Structure**
```markdown
---
title: "Clear Document Title"
category: "Development|Architecture|Operations|Reference"
difficulty: "Beginner|Intermediate|Advanced"
lastUpdated: "YYYY-MM-DD"
relatedDocs: ["other-doc.md"]
copilotTags: ["tag1", "tag2"]
---

# Document Title

> **Quick Reference**: One-line summary

## 🎯 Overview
## 🔧 Implementation
## ❌ Common Issues
## 🔗 Related Documentation
```

## 🗂️ Archive

Legacy documentation has been moved to:
- [Archived Reports](./archived/) - Historical analysis and reports
- Previous individual documentation files are consolidated here

## 🆘 Need Help?

1. **Quick Issues**: Check [Troubleshooting](./operations/troubleshooting.md)
2. **Development Questions**: See [Development Guide](./development/)
3. **System Architecture**: Reference [Architecture docs](./architecture/)
4. **Deployment Issues**: Follow [Operations guides](./operations/)

---

**Last Updated**: September 11, 2025  
**Maintained by**: Z-Beam Development Team

## Table of Contents

### System Documentation

- [YAML Processing System](./yaml-system/YAML_PROCESSING_SYSTEM.md) - Documentation for the YAML validation and processing system
- [Tag System Guide](./tag-system/TAG_SYSTEM_GUIDE.md) - Guide to the refactored tag management system
- [Tag System Refactoring](./TAG_SYSTEM_REFACTORING.md) - Details about the tag system refactoring process

### Development Guides

- [Component Creation](./examples/component-creation.md) - Guide to creating new components safely
- [Debugging System](./debugging-system.md) - How to use the debugging tools

### Examples

- [YAML Processor Integration](./examples/generator_integration_example.py) - Example of integrating with the YAML processor

## Development Workflow

1. **Setting up the development environment**
   - Run `npm run dev` to start the development server
   - For a clean start, use `npm run dev:fast` or `Task: Clean Start Dev Server`

2. **Content management**
   - Use YAML validation tools to ensure content integrity
   - Run `npm run yaml:check` to validate YAML without making changes

3. **Component development**
   - Use the safe component creation script: `npm run create:component`
   - Ensure components follow project standards with `npm run lint:components`

4. **Debugging**
   - Visit `/debug` routes for various debugging tools
   - Check the debugging documentation for more details

5. **Maintenance**
   - Use `npm run cleanup:archive` to organize archived files
   - Regular validation with `npm run docs:validate` ensures documentation quality

## Getting Help

If you need additional help, check the component-specific documentation or reach out to the development team.

## Contributing to Documentation

If you find areas that need more documentation or clarification, please add to these guides or create new documentation files as needed.
