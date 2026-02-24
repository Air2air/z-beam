# PROJECT_RULES.md
**Last updated:** 2026-02-23

## Project Overview
- Description: Z-Beam frontend for laser cleaning site, built on Next.js with YAML frontmatter content.
- Primary tech stack: Next.js 14, React 18, TypeScript, Tailwind CSS, Node 22.
- Target users / goal: Public-facing marketing and technical content site for laser cleaning.

## Architecture Decisions
- Routing: Next.js app router; content-driven pages by category/subcategory/slug.
- State management: Server components + local React state; no global store documented.
- Data fetching: YAML frontmatter and static page YAML via content utilities.
- Folder structure: app/ for routes/components, frontmatter/ and static-pages/ for content, scripts/ for validation.

## Coding Standards
- Language / linting: TypeScript with ESLint; strict path alias enforcement.
- Component style: Reuse existing components; avoid duplication; extend before creating new.
- Naming conventions: Use centralized types from @/types; follow docs/01-core/code-standards.md.

## Always
- Use @/ path aliases for app/ and types/ imports.
- Keep content in frontmatter/static-pages YAML and access via content utilities.
- Prefer minimal, reusable components; reduce duplication.
- Run validation scripts before build/deploy when required.
- Treat frontmatter as generated output; update via z-beam-generator export when content changes.

## Never
- Do not create local type interfaces already in @/types.
- Do not use relative imports for app/ or types/.
- Do not duplicate UI patterns or components.
- Do not hand-edit generated frontmatter YAML to fix data issues.

## Preferred Libraries & Patterns
- UI: React + Tailwind CSS.
- Validation: scripts/validation/* and Jest.
- Dates: Standard JS (no preferred library documented).
- Forms: Custom + validation scripts (no preferred library documented).
- Testing: Jest + Testing Library.

## Performance Rules
- Use server components where possible; keep client components minimal.
- Avoid heavy runtime computations in render paths.

## Security Rules
- Use app/config/env.ts for environment variables.
- Avoid exposing secrets to client; use NEXT_PUBLIC_* only for safe values.

## Deployment & CI
- Use npm scripts for validate/build; prebuild runs validation and tests.
- Vercel deployment via scripts/deployment/.

## Team Preferences
- Modify before creating new components.
- Smallest codebase wins; strict anti-bloat.
- Favor clarity and consistency over novelty.
