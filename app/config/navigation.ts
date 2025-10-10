// app/config/navigation.ts
// Site navigation configuration
// 
// ⚠️ DEPRECATED: Import from @/config instead
// This file now re-exports from app/config/site.ts for backward compatibility
// New code should import from @/config or @/config/site
//
// Migration Guide:
// OLD: import { MAIN_NAV_ITEMS } from '@/config/navigation'
// NEW: import { MAIN_NAV_ITEMS } from '@/config'

export { MAIN_NAV_ITEMS, type NavItem } from './site';

/**
 * @deprecated Use imports from @/config instead
 * All configuration has been consolidated into app/config/site.ts
 */
