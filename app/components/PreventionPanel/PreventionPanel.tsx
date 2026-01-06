/**
 * PreventionPanel Component
 * 
 * Displays prevention strategies and challenges using the centralized Collapsible component.
 * Used in DiagnosticCenter for showing prevention measures grouped by category.
 * 
 * Architecture: Zero CSS - all styling from Collapsible base component
 * 
 * @module components/PreventionPanel
 */

import React from 'react';
import { Collapsible } from '../Collapsible';

/**
 * Individual challenge/prevention item
 */
interface Challenge {
  challenge: string;
  impact: string;
  solutions: string[];
  prevention: string[];
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Challenges grouped by category
 */
interface PreventionData {
  [category: string]: Challenge[];
}

interface PreventionPanelProps {
  /** Prevention data grouped by category */
  challenges: PreventionData;
  /** Title for the section */
  title?: string;
  /** Optional description */
  description?: string;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Get icon emoji for category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    surface_characteristics: '🔍',
    thermal_management: '🌡️',
    contamination_challenges: '🧹',
    safety_compliance: '⚠️',
    surface_contamination: '🧹',
    thermal_effects: '🌡️',
    mechanical_stress: '⚙️',
    optical_issues: '👁️'
  };
  return icons[category] || '📋';
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * PreventionPanel - Display prevention strategies using Collapsible base
 * 
 * Transforms prevention challenge data for Collapsible component, grouping
 * challenges by category with severity indicators and detailed solutions.
 * 
 * @example
 * ```tsx
 * <PreventionPanel
 *   challenges={{
 *     thermal_management: [
 *       {
 *         challenge: "Heat buildup",
 *         impact: "Material warping",
 *         solutions: ["Use cooling systems", "Adjust power"],
 *         prevention: ["Monitor temperature", "Regular maintenance"],
 *         severity: "high"
 *       }
 *     ]
 *   }}
 *   title="Prevention Strategies"
 * />
 * ```
 */
export function PreventionPanel({
  challenges,
  title = 'Prevention Strategies',
  description,
  className = ''
}: PreventionPanelProps) {
  if (!challenges || Object.keys(challenges).length === 0) {
    return null;
  }

  // Transform challenges to Collapsible format
  // Group by category, each challenge becomes a collapsible item
  const allItems: any[] = [];
  
  Object.entries(challenges).forEach(([category, challengeList]) => {
    if (!Array.isArray(challengeList)) return;

    const categoryIcon = getCategoryIcon(category);
    const categoryName = formatCategoryName(category);

    // Each challenge in this category becomes an item
    challengeList.forEach((challenge, index) => {
      // Build description with impact, solutions, and prevention
      const descriptionParts: string[] = [];

      // Impact section
      if (challenge.impact) {
        descriptionParts.push(`**Impact:** ${challenge.impact}`);
        descriptionParts.push(''); // Blank line
      }

      // Solutions section
      if (challenge.solutions && challenge.solutions.length > 0) {
        descriptionParts.push('**Solutions:**');
        challenge.solutions.forEach(solution => {
          descriptionParts.push(`✓ ${solution}`);
        });
        descriptionParts.push(''); // Blank line
      }

      // Prevention section
      if (challenge.prevention && challenge.prevention.length > 0) {
        descriptionParts.push('**Prevention:**');
        challenge.prevention.forEach(prev => {
          descriptionParts.push(`• ${prev}`);
        });
      }

      allItems.push({
        challengeName: `${categoryIcon} ${challenge.challenge}`,
        challengeDesc: descriptionParts.join('\n'),
        severity: challenge.severity,
        category: categoryName
      });
    });
  });

  // Sort by severity (critical > high > medium > low)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allItems.sort((a, b) => {
    const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 99;
    const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 99;
    return aOrder - bOrder;
  });

  // Section metadata
  const sectionMetadata = {
    sectionTitle: title,
    sectionDescription: description,
    icon: 'prevention',
    order: 80
  };

  return (
    <div className={className}>
      <Collapsible
        items={allItems}
        sectionMetadata={sectionMetadata}
      />
    </div>
  );
}

/**
 * Export types for use in other components
 */
export type { Challenge, PreventionData };
