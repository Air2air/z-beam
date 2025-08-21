# Z-Beam Documentation

Welcome to the Z-Beam documentation. This guide provides information about the various systems and components of the Z-Beam platform.

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
