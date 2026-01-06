/**
 * @component ExpertAnswers
 * @purpose Expert-attributed Q&A with E-E-A-T signals for troubleshooting
 * @dependencies Collapsible, @/types (ExpertAnswersProps)
 * @related BaseFAQ.tsx, Layout.tsx
 * @complexity Simple (uses base Collapsible component)
 * @aiContext Displays expert troubleshooting answers using normalized Collapsible base
 *           Simplified architecture with zero custom CSS
 */
// app/components/ExpertAnswers/ExpertAnswers.tsx
"use client";

import { Collapsible } from "../Collapsible";
import { trackFAQClick } from "@/app/utils/analytics";
import type { ExpertAnswersProps, ExpertAnswerItem } from '@/types';

/**
 * Format expert information for display in description
 */
function formatExpertInfo(answer: ExpertAnswerItem): string {
  const parts: string[] = [];
  
  const expert = answer.expert;
  if (expert) {
    // Expert name and credentials
    if (expert.name) {
      let expertLine = `**Expert:** ${expert.name}`;
      if (expert.credentials && expert.credentials.length > 0) {
        expertLine += ` (${expert.credentials.join(', ')})`;
      }
      parts.push(expertLine);
    }
    
    // Title and affiliation
    if (expert.title) {
      parts.push(`**Title:** ${expert.title}`);
    }
    if (expert.affiliation) {
      parts.push(`**Affiliation:** ${expert.affiliation}`);
    }
    
    // Expertise areas
    if (expert.expertiseAreas && expert.expertiseAreas.length > 0) {
      parts.push(`**Expertise:** ${expert.expertiseAreas.slice(0, 3).join(', ')}`);
    }
  }
  
  // Date and engagement metrics
  if (answer.dateAnswered) {
    const formattedDate = new Date(answer.dateAnswered).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    parts.push(`**Date Answered:** ${formattedDate}`);
  }
  
  if (answer.upvoteCount && answer.upvoteCount > 0) {
    parts.push(`**👍 ${answer.upvoteCount} helpful**`);
  }
  
  if (answer.acceptedAnswer) {
    parts.push('✓ **Accepted Answer**');
  }
  
  return parts.join('\n');
}

/**
 * Build full answer description with all details
 */
function buildAnswerDescription(answer: ExpertAnswerItem): string {
  const sections: string[] = [];
  
  // Expert info section
  const expertInfo = formatExpertInfo(answer);
  if (expertInfo) {
    sections.push(expertInfo);
    sections.push(''); // Blank line
  }
  
  // Category
  if (answer.category) {
    sections.push(`**Category:** ${answer.category.replace(/_/g, ' ')}`);
    sections.push(''); // Blank line
  }
  
  // Main answer
  sections.push('**Answer:**');
  sections.push(answer.answer);
  sections.push(''); // Blank line
  
  // Property value
  if (answer.propertyValue) {
    sections.push(`**Technical Value:** ${answer.propertyValue}`);
    sections.push(''); // Blank line
  }
  
  // Solutions
  if (answer.solutions && answer.solutions.length > 0) {
    sections.push('**Recommended Solutions:**');
    answer.solutions.forEach(solution => {
      sections.push(`✓ ${solution}`);
    });
    sections.push(''); // Blank line
  }
  
  // Sources
  if (answer.sources && answer.sources.length > 0) {
    sections.push('**Sources & References:**');
    answer.sources.forEach(source => {
      sections.push(`• ${source}`);
    });
    sections.push(''); // Blank line
  }
  
  // Related topics
  if (answer.relatedTopics && answer.relatedTopics.length > 0) {
    sections.push(`**Related Topics:** ${answer.relatedTopics.join(' • ')}`);
    sections.push(''); // Blank line
  }
  
  // Last reviewed
  if (answer.lastReviewed) {
    const reviewDate = new Date(answer.lastReviewed).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    sections.push(`*Last reviewed: ${reviewDate}*`);
  }
  
  return sections.join('\n');
}

/**
 * ExpertAnswers component - displays expert Q&A using base Collapsible
 * Simplified architecture with zero custom CSS
 */
export function ExpertAnswers({
  materialName,
  answers = [],
  defaultExpert,
  className = "",
}: ExpertAnswersProps) {
  if (!answers || answers.length === 0) return null;

  // Sort: accepted answers first, then by upvotes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.acceptedAnswer && !b.acceptedAnswer) return -1;
    if (!a.acceptedAnswer && b.acceptedAnswer) return 1;
    return (b.upvoteCount || 0) - (a.upvoteCount || 0);
  });

  // Transform to Collapsible format - using generic object structure
  const collapsibleItems = sortedAnswers.map((answer, index) => {
    // Use answer-specific expert or fall back to default
    const finalAnswer = {
      ...answer,
      expert: answer.expert || defaultExpert
    };
    
    return {
      question: answer.question,
      answer: buildAnswerDescription(finalAnswer),
      severity: answer.severity,
      acceptedAnswer: answer.acceptedAnswer && index === 0 // Auto-open first accepted answer
    };
  });

  // Section metadata
  const sectionMetadata = {
    sectionTitle: `Expert Troubleshooting: ${materialName}`,
    sectionDescription: 'Professional answers from verified laser cleaning experts',
    icon: 'warning',
    order: 85
  };

  return (
    <div className={className}>
      <Collapsible
        items={collapsibleItems}
        sectionMetadata={sectionMetadata}
      />
      
      {/* Trust signals footer */}
      <div className="mt-6 p-4 bg-secondary rounded-md text-muted text-center">
        <p>
          All answers provided by verified laser cleaning experts with industry credentials.
          {' '}
          <strong>Need personalized help?</strong> <a href="/contact" className="text-orange-600400 hover:underline">Contact our team</a>
        </p>
      </div>
    </div>
  );
}
