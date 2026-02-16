// app/services/page.tsx
/**
 * Services Page - Dynamic Content Pattern
 * Converted to use createStaticPage factory (v2.0)
 * 
 * Features:
 * - Clickable cards from YAML (moved from hardcoded SERVICES array)
 * - Service schema generation
 * - YAML-based configuration
 * 
 * BEFORE: 122 lines with hardcoded SERVICES array
 * AFTER: 7 lines using factory pattern
 */

import { createStaticPage } from '@/app/utils/pages/createStaticPage';

export const { generateMetadata, default: Page } = createStaticPage('services');
