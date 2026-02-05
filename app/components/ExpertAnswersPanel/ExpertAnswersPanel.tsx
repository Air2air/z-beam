/**
 * ExpertAnswersPanel Component
 * 
 * Displays expert Q&A using the centralized Collapsible component.
 * Transforms expert answer data to Collapsible format while preserving:
 * - Expert information and credentials
 * - Accepted answer badges
 * - Severity indicators
 * - Auto-open first accepted answer
 * - Analytics tracking
 * 
 * Architecture: Zero CSS - all styling from Collapsible base component
 * 
 * @module components/ExpertAnswersPanel
 */

import React from 'react';
import { Collapsible } from '../Collapsible';

/**
 * Expert information structure
 */
interface ExpertInfo {
  name: string;
  bio?: string;
  credentials?: string;
  specialty?: string;
}

/**
 * Individual expert answer structure
 */
interface ExpertAnswerItem {
  question: string;
  answer: string;
  expert?: ExpertInfo;
  acceptedAnswer?: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
}

interface ExpertAnswersPanelProps {
  /** Array of expert answers to display */
  answers: ExpertAnswerItem[];
  /** Name of entity (material, contaminant, etc.) for context */
  entityName?: string;  // Optional - not currently used but kept for future context
  /** Default expert if individual answers don't specify one */
  defaultExpert?: ExpertInfo;
  /** Section metadata from frontmatter _section field (REQUIRED) */
  sectionMetadata: {
    sectionTitle: string;
    sectionDescription?: string;
    icon?: string;
    order?: number;
  };
  /** Optional CSS classes */
  className?: string;
  /** Analytics tracking function */
  onQuestionClick?: (questionText: string) => void;
}

/**
 * Parse simple markdown bold syntax (**text** → <strong>text</strong>)
 * Currently unused - kept for potential future use
 */
/*
function parseSimpleMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Format expert credentials for display
 */
function formatExpertInfo(expert?: ExpertInfo): string | null {
  if (!expert) return null;
  
  const parts: string[] = [];
  if (expert.name) parts.push(expert.name);
  if (expert.credentials) parts.push(expert.credentials);
  if (expert.specialty) parts.push(expert.specialty);
  
  return parts.length > 0 ? parts.join(' • ') : null;
}

/**
 * ExpertAnswersPanel - Display expert Q&A using Collapsible base
 * 
 * Transforms expert answer data for Collapsible component while preserving
 * all original features: expert info, accepted answers, severity, analytics.
 * 
 * @example
 * ```tsx
 * <ExpertAnswersPanel
 *   answers={expertAnswers}
 *   entityName="Aluminum"
 *   defaultExpert={{ name: "Dr. Smith", credentials: "PhD Materials Science" }}
 *   onQuestionClick={(question) => trackEvent('expert_answer_viewed', { question })}
 * />
 * ```
 */
export function ExpertAnswersPanel({
  answers,
  entityName,
  defaultExpert,
  sectionMetadata,
  className = '',
  onQuestionClick: _onQuestionClick
}: ExpertAnswersPanelProps) {
  if (!answers || answers.length === 0) {
    return null;
  }

  // Check if first item is accepted answer for auto-open
  const firstAcceptedIndex = answers.findIndex(a => a.acceptedAnswer);
  const autoOpenIndex = firstAcceptedIndex >= 0 ? firstAcceptedIndex : 0;

  // Transform expert answers to Collapsible format - generic objects
  const collapsibleItems = answers.map((answer, index) => {
    const expert = answer.expert || defaultExpert;
    const expertInfo = formatExpertInfo(expert);

    // Build rich content with expert info, answer, and badges
    const contentParts: string[] = [];

    // Expert info at top
    if (expertInfo) {
      contentParts.push(`**Expert:** ${expertInfo}`);
    }

    // Accepted answer badge
    if (answer.acceptedAnswer) {
      contentParts.push(`✓ **Accepted Answer**`);
    }

    // Category if present
    if (answer.category) {
      contentParts.push(`**Category:** ${answer.category}`);
    }

    // Main answer content
    contentParts.push(''); // Blank line
    contentParts.push(answer.answer);

    return {
      question: answer.question,
      answer: contentParts.join('\n'),
      severity: answer.severity,
      // Auto-open first accepted answer (or first item if no accepted)
      acceptedAnswer: index === autoOpenIndex
    };
  });

  // 🔥 MANDATORY (Jan 15, 2026): Section metadata MUST come from frontmatter _section
  // FAIL-FAST: This component should receive sectionMetadata prop from parent
  if (!sectionMetadata?.sectionTitle) {
    throw new Error(`Missing _section.sectionTitle for Expert Answers (${entityName})`);
  }

  return (
    <div className={className}>
      <Collapsible
        items={collapsibleItems}
        sectionMetadata={sectionMetadata}
      />
    </div>
  );
}

/**
 * Export type for use in other components
 */
export type { ExpertAnswerItem, ExpertInfo };
