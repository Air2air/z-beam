/**
 * @component FAQPanel
 * @purpose Display FAQ items using Collapsible component
 * @extends Collapsible
 * 
 * Replaces: MaterialFAQ.tsx, BaseFAQ.tsx custom implementations
 * Benefits:
 * - Consistent styling with other collapsible sections
 * - No duplicate CSS
 * - Centralized collapsible behavior
 * 
 * @see app/components/Collapsible/Collapsible.tsx
 */

import { Collapsible } from '../Collapsible';
import type { RelationshipSection } from '@/types/card-schema';

interface FAQItem {
  question: string;
  answer: string;
  severity?: 'low' | 'medium' | 'high';
}

interface FAQPanelProps {
  faq: FAQItem[];
  entityName: string;  // Material/Contaminant/Setting name
  variant?: 'faq' | 'troubleshooting';
  className?: string;
}

/**
 * Convert simple Markdown bold syntax (**text**) to HTML
 */
function parseSimpleMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Display FAQ items in a collapsible section
 * Uses Collapsible base component for consistent styling
 */
export function FAQPanel({
  faq,
  entityName,
  variant = 'faq',
  className = ''
}: FAQPanelProps) {
  if (!faq || faq.length === 0) return null;

  // Transform FAQ data for Collapsible component
  const collapsibleItems = faq.map((item, index) => {
    const questionKey = `question_${index + 1}`;
    
    return {
      [questionKey]: {
        question: parseSimpleMarkdown(item.question),
        answer: parseSimpleMarkdown(item.answer),
        severity: item.severity,
        _label: variant === 'faq' ? 'Q:' : '⚠'
      }
    };
  });

  // Section metadata
  const sectionMetadata: RelationshipSection = {
    section_title: variant === 'faq' 
      ? `${entityName} Laser Cleaning FAQs` 
      : `${entityName} Troubleshooting`,
    section_description: variant === 'faq'
      ? 'Common questions and expert answers about laser cleaning this material'
      : 'Common issues and solutions for laser cleaning this material',
    icon: variant === 'faq' ? 'help-circle' : 'alert-triangle',
    order: 10
  };

  return (
    <Collapsible
      items={collapsibleItems}
      sectionMetadata={sectionMetadata}
      className={className}
    />
  );
}
