// app/schedule/page.tsx
/**
 * Schedule Page - Dynamic Content Pattern
 * Converted to use createStaticPage factory (v2.0)
 * 
 * Features:
 * - Schedule widget in main content
 * - Header CTA button in sidebar
 * - YAML-based configuration
 * 
 * BEFORE: 97 lines with manual rendering
 * AFTER: 7 lines using factory pattern
 */

import { createStaticPage } from '@/app/utils/pages/createStaticPage';

export const { generateMetadata, default: Page } = createStaticPage('schedule');
