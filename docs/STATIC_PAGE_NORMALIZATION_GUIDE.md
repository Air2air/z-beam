# Static Page Normalization Guide

## Overview
Static marketing pages are frontmatter-first. The canonical source is `app/<route>/page.yaml`, with the homepage stored at `app/page.yaml`, and shared rendering should flow through either `createStaticPage(...)` or `loadStaticPageFrontmatter(...)` with the full frontmatter object passed into `Layout`.

The old markdown-based `loadStaticPageContent()` path is retired. Do not add new `content.md` loaders or partial metadata adapters for services-style routes.

## Canonical Pattern

### Shared factory routes
Use the factory when a page matches the standard static-page family.

```typescript
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: ServicesPage } = createStaticPage('services');

export { generateMetadata };
export default ServicesPage;
```

### Custom routes
Use `loadStaticPageFrontmatter(...)` only when a page genuinely cannot fit the shared factory. That is now the exception, not the normal services-page pattern.

## File Structure
Every static page should use this structure:

```text
app/page-name/
├── page.tsx
└── page.yaml
```

The homepage uses the same contract at the app root:

```text
app/
├── page.tsx
└── page.yaml
```

Optional local assets or route-specific components are fine. Markdown content files are no longer part of the canonical static-page contract.

## Frontmatter Requirements
At minimum, static-page frontmatter should include:

```yaml
pageTitle: Example Page Title
pageDescription: Concise summary for hero and SEO
slug: example-page
breadcrumb:
  - name: Home
    href: /
  - name: Services
    href: /services
  - name: Example Page
    href: /example-page
sections:
  - id: example-content
    type: content-section
    _section:
      title: Example Section
      description: Short section summary
    items: []
```

## Rendering Rules
- Pass the full frontmatter object into `Layout` so breadcrumbs, hero content, page description, and metadata stay in parity with article pages.
- Prefer `createStaticPage(...)` for services-style marketing pages instead of hand-built page loaders.
- Keep route-specific behavior in frontmatter when possible, such as robots directives or breadcrumb structure.
- Do not reintroduce markdown parsing helpers for static pages unless the page family itself changes and the contract is updated in docs and tests at the same time.

## Current Static Pages
The active frontmatter-driven pages include:

| Page | Directory | Preferred Pattern |
|------|-----------|-------------------|
| Contact | `contact` | `createStaticPage` |
| Partners | `partners` | `createStaticPage` |
| Equipment | `equipment` | `createStaticPage` |
| Compliance | `compliance` | `createStaticPage` |
| Schedule | `schedule` | `createStaticPage` |
| Services | `services` | `createStaticPage` |
| Safety | `safety` | `createStaticPage` |
| About | `about` | `createStaticPage` |
| Netalux | `netalux` | `createStaticPage` |
| Thank You | `thank-you` | `createStaticPage` |

## Validation Focus
- `tests/utils/staticPageLoader.test.ts` covers frontmatter loading.
- `tests/utils/pages/createStaticPage.integration.test.tsx` covers shared factory behavior.
- `tests/app/static-pages.test.tsx` checks static-page content loading and route expectations.
- `tests/components/Layout.test.tsx` covers shared layout parity for static pages and article pages.

## Anti-Patterns
- Do not use `loadStaticPageContent(...)`.
- Do not create new `content.md`-driven static-page routes.
- Do not pass only `title` and `description` into `Layout` for static pages.
- Do not keep duplicate route implementations such as temporary `page.new.tsx` wrappers.

## Adding A New Static Page
1. Create `app/new-page/page.yaml` with complete frontmatter.
2. Add `app/new-page/page.tsx` using `createStaticPage('new-page')` unless the page needs route-specific rendering.
3. If custom rendering is required, load frontmatter with `loadStaticPageFrontmatter('new-page')` and pass the full object into `Layout`.
4. Update navigation, sitemap, and breadcrumbs in the same batch when the route is user-facing.
5. Run focused validation on the loader, factory, and the new route.