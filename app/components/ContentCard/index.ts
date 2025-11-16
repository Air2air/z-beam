/**
 * ContentCard Component Suite
 * 
 * Unified content display system that replaces Callout and WorkflowSection
 * 
 * @module ContentCard
 */

export { ContentCard } from './ContentCard';
export { ContentSection } from './ContentSection';
export type { ContentCardProps } from '@/types';
export type { ContentSectionProps } from './ContentSection';

// Backward compatibility aliases
export { ContentCard as Callout } from './ContentCard';
export { ContentSection as WorkflowSection } from './ContentSection';
