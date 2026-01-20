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
  title?: string;
  content?: string;
  question?: string;  // Alternative field name
  answer?: string;    // Alternative field name
  severity?: 'low' | 'medium' | 'high';
}

interface FAQPanelProps {
  faq: FAQItem[] | string;  // Support both array and string format
  entityName: string;  // Material/Contaminant/Setting name
  variant?: 'faq' | 'troubleshooting';
  className?: string;
  sectionTitle?: string;
  sectionDescription?: string;
}

/**
 * Convert simple Markdown bold syntax (**text**) to HTML
 */
function parseSimpleMarkdown(text: string): string {
  return (text || '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Display FAQ items in a collapsible section
 * Uses Collapsible base component for consistent styling
 */
export function FAQPanel({
  faq,
  entityName,
  variant = 'faq',
  className = '',
  sectionTitle,
  sectionDescription
}: FAQPanelProps) {
  if (!faq) return null;
  
  // Parse FAQ data - handle both string and array formats
  let faqItems: FAQItem[] = [];
  
  if (typeof faq === 'string') {
    // Parse string format: "Q: Question text? A: Answer text."
    const qaPairs = faq.split(/Q:\s*/i).filter(Boolean);
    faqItems = qaPairs.map(pair => {
      const [question, answer] = pair.split(/A:\s*/i);
      return {
        title: question?.trim() || '',
        content: answer?.trim() || ''
      };
    }).filter(item => item.title && item.content);
  } else if (Array.isArray(faq)) {
    // Handle structured array format
    faqItems = faq.map(item => ({
      title: item.title || item.question || '',
      content: item.content || item.answer || ''
    }));
  }
  
  if (faqItems.length === 0) return null;

  // Transform FAQ data for Collapsible component
  // Use title as the collapsible title, put content as direct value with empty key to hide label
  const collapsibleItems = faqItems.map((item, _index) => {
    return {
      [parseSimpleMarkdown(item.title || '')]: {
        '': parseSimpleMarkdown(item.content || '')
      }
    };
  });

  // Section metadata - use provided props or fall back to defaults
  const sectionMetadata: RelationshipSection = {
    sectionTitle: sectionTitle || (variant === 'faq' 
      ? `FAQs for laser cleaning ${entityName}` 
      : `${entityName} Troubleshooting`),
    sectionDescription: sectionDescription || (variant === 'faq'
      ? 'Common questions and expert answers about laser cleaning this material'
      : 'Common issues and solutions for laser cleaning this material'),
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
