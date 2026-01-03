/**
 * @component FAQMaterial
 * @purpose Material-focused FAQ and troubleshooting (properties, applications, selection)
 * @dependencies BaseFAQ, @/types (HelpSection)
 * @related BaseFAQ.tsx, Layout.tsx
 * @complexity Low (wrapper filtering help sections by context='material')
 * @aiContext Displays material-specific help content filtered from unified help system
 * 
 * ADAPTER: Automatically converts legacy faq format to HelpSection format
 */
// app/components/FAQ/FAQMaterial.tsx
"use client";

import { FAQPanel } from "../FAQPanel";
import type { HelpSection, HelpItem, FAQMaterialProps } from '@/types';

/**
 * Adapter: Convert legacy faq format to HelpSection format
 * 
 * Transforms:
 *   faq:
 *     - question: "What makes aluminum suitable?"
 *       answer: "Aluminum is lightweight..."
 * 
 * Into:
 *   help:
 *     - type: faq
 *       context: material
 *       items:
 *         - question: "What makes aluminum suitable?"
 *           answer: "Aluminum is lightweight..."
 */
function adaptLegacyFaqToHelp(faq: Array<{question: string; answer: string}> | { questions?: Array<{question: string; answer: string}> } | undefined): HelpSection[] {
  if (!faq) return [];

  // Handle both array format and nested object format
  let faqArray: Array<{question: string; answer: string}>;
  
  if (Array.isArray(faq)) {
    faqArray = faq;
  } else if (faq.questions && Array.isArray(faq.questions)) {
    faqArray = faq.questions;
  } else {
    return [];
  }

  if (faqArray.length === 0) return [];

  // Convert to HelpItem format
  const items: HelpItem[] = faqArray.map((item) => ({
    question: item.question,
    answer: item.answer,
    keywords: [item.question.toLowerCase().split(' ').slice(0, 3).join(' ')]
  }));

  return [{
    type: 'faq',
    context: 'material',
    items: items
  }];
}

/**
 * Material-focused FAQ and troubleshooting wrapper
 * Filters help sections for material context (properties, applications, selection)
 * 
 * Supports both:
 * 1. Modern format: help prop with HelpSection[] array
 * 2. Legacy format: faq prop (auto-converted)
 */
export function FAQMaterial({
  materialName,
  help = [],
  faq,
  className = "",
}: FAQMaterialProps) {
  // Combine modern help format with legacy faq (if present)
  let allSections = [...help];
  
  // Adapter: Convert legacy faq to HelpSection format
  if (faq && help.length === 0) {
    const adaptedSections = adaptLegacyFaqToHelp(faq);
    allSections = [...allSections, ...adaptedSections];
  }

  // Filter for material-context help only
  const materialSections = allSections.filter(section => 
    section.context === 'material' || section.context === 'general'
  );

  if (materialSections.length === 0) return null;

  // Flatten items from all sections for FAQPanel
  const allItems = materialSections.flatMap(section => 
    section.items.map(item => ({
      question: item.question,
      answer: item.answer,
      severity: item.severity
    }))
  );

  return (
    <FAQPanel
      faq={allItems}
      entityName={materialName}
      variant="faq"
      className={className}
    />
  );
}
