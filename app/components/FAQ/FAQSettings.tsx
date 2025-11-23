/**
 * @component FAQSettings
 * @purpose Settings-focused FAQ and troubleshooting (operations, parameters, diagnostics)
 * @dependencies BaseFAQ, @/types (HelpSection)
 * @related BaseFAQ.tsx, Layout.tsx
 * @complexity Low (wrapper filtering help sections by context='settings')
 * @aiContext Displays laser cleaning operational help filtered from unified help system
 * 
 * ADAPTER: Automatically converts legacy material_challenges format to HelpSection format
 */
// app/components/FAQ/FAQSettings.tsx
"use client";

import { BaseFAQ } from "./BaseFAQ";
import type { HelpSection, HelpItem, HelpSeverity } from '@/types';

export interface FAQSettingsProps {
  materialName: string;
  help?: HelpSection[];
  material_challenges?: any; // Legacy format adapter
  className?: string;
}

/**
 * Adapter: Convert legacy material_challenges format to HelpSection format
 * 
 * Transforms:
 *   material_challenges:
 *     thermal_management:
 *       - challenge: "High thermal conductivity"
 *         severity: medium
 *         solutions: [...]
 * 
 * Into:
 *   help:
 *     - type: troubleshooting
 *       context: settings
 *       items:
 *         - question: "How do I manage high thermal conductivity?"
 *           answer: "Impact description..."
 *           severity: medium
 *           solutions: [...]
 */
function adaptMaterialChallengesToHelp(challenges: any): HelpSection[] {
  if (!challenges || typeof challenges !== 'object') return [];

  const sections: HelpSection[] = [];
  const allItems: HelpItem[] = [];

  // Iterate through challenge categories (thermal_management, surface_characteristics, etc.)
  for (const [category, items] of Object.entries(challenges)) {
    if (!Array.isArray(items)) continue;

    items.forEach((item: any) => {
      if (!item.challenge) return;

      // Build answer from impact and property values
      let answer = item.impact || '';
      if (item.property_value) {
        answer = `Property: ${item.property_value}. ${answer}`;
      }
      if (item.threshold_range) {
        answer = `Threshold: ${item.threshold_range}. ${answer}`;
      }
      if (item.reflectivity_range) {
        answer = `Reflectivity: ${item.reflectivity_range}. ${answer}`;
      }

      allItems.push({
        question: `How do I handle ${item.challenge.toLowerCase()}?`,
        answer: answer,
        severity: (item.severity as HelpSeverity) || 'medium',
        category: category,
        propertyValue: item.property_value || item.threshold_range || item.reflectivity_range,
        solutions: item.solutions || [],
        keywords: [category, item.challenge, item.severity].filter(Boolean)
      });
    });
  }

  // Create single troubleshooting section with all items
  if (allItems.length > 0) {
    sections.push({
      type: 'troubleshooting',
      context: 'settings',
      items: allItems
    });
  }

  return sections;
}

/**
 * Settings-focused FAQ and troubleshooting wrapper
 * Filters help sections for settings context (operations, parameters, diagnostics)
 * 
 * Supports both:
 * 1. Modern format: help prop with HelpSection[] array
 * 2. Legacy format: material_challenges prop (auto-converted)
 */
export function FAQSettings({
  materialName,
  help = [],
  material_challenges,
  className = "",
}: FAQSettingsProps) {
  // Combine modern help format with legacy material_challenges (if present)
  let allSections = [...help];
  
  // Adapter: Convert legacy material_challenges to HelpSection format
  if (material_challenges && help.length === 0) {
    const adaptedSections = adaptMaterialChallengesToHelp(material_challenges);
    allSections = [...allSections, ...adaptedSections];
  }

  // Filter for settings-context help only
  const settingsSections = allSections.filter(section => 
    section.context === 'settings' || section.context === 'general'
  );

  if (settingsSections.length === 0) return null;

  return (
    <BaseFAQ
      sections={settingsSections}
      materialName={materialName}
      className={className}
    />
  );
}
