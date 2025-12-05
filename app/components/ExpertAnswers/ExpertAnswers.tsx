/**
 * @component ExpertAnswers
 * @purpose Expert-attributed Q&A with E-E-A-T signals for troubleshooting
 * @dependencies SectionContainer, @/types (ExpertAnswersProps)
 * @related BaseFAQ.tsx, Layout.tsx
 * @complexity Medium (expert attribution, QAPage schema, upvotes, sources)
 * @aiContext Displays expert troubleshooting answers with credentials, dates, and authority signals
 *           Generates QAPage schema for rich snippets with expert attribution
 */
// app/components/ExpertAnswers/ExpertAnswers.tsx
"use client";

import { SectionContainer } from "../SectionContainer/SectionContainer";
import { trackFAQClick } from "@/app/utils/analytics";
import { getSectionIcon } from "@/app/config/sectionIcons";
import type { ExpertAnswersProps, ExpertAnswerItem, ExpertInfo } from '@/types';
import Image from "next/image";

/**
 * Convert simple Markdown bold syntax to HTML
 */
function parseSimpleMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * Severity badge with color coding
 */
function SeverityBadge({ severity }: { severity?: 'low' | 'medium' | 'high' }) {
  if (!severity) return null;
  
  const config = {
    low: { 
      color: 'bg-blue-900 text-blue-200 border-blue-300700',
      icon: 'ℹ️'
    },
    medium: { 
      color: 'bg-yellow-900 text-yellow-200 border-yellow-300700',
      icon: '⚠️'
    },
    high: { 
      color: 'bg-red-900 text-red-200 border-red-300700',
      icon: '🔴'
    }
  };
  
  const { color, icon } = config[severity];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
      <span className="mr-1">{icon}</span>
      {severity.toUpperCase()}
    </span>
  );
}

/**
 * Expert info card with credentials
 */
function ExpertCard({ expert, dateAnswered, upvoteCount }: { 
  expert: ExpertInfo; 
  dateAnswered: string;
  upvoteCount?: number;
}) {
  const formattedDate = new Date(dateAnswered).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50900/20900/20 rounded-lg border border-blue-200800">
      {/* Expert photo */}
      {expert.image && (
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-400600">
            <Image
              src={expert.image}
              alt={expert.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>
      )}
      
      {/* Expert info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-base text-secondary font-semibold">
            {expert.name}
          </h4>
          {expert.credentials && expert.credentials.length > 0 && (
            <span className="text-sm text-muted">
              {expert.credentials.join(', ')}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
            ✓ Verified Expert
          </span>
        </div>
        
        {expert.title && (
          <p className="text-sm mt-0.5">
            {expert.title}
          </p>
        )}
        
        {expert.affiliation && (
          <p className="text-sm text-muted mt-0.5">
            {expert.affiliation}
          </p>
        )}
        
        {expert.expertise && expert.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {expert.expertise.slice(0, 3).map((skill, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary border"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        
        {/* Date and upvotes */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted">
          <span className="flex items-center gap-1">
            📅 {formattedDate}
          </span>
          {upvoteCount && upvoteCount > 0 && (
            <span className="flex items-center gap-1">
              👍 {upvoteCount} helpful
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Single expert answer card
 */
function ExpertAnswerCard({ 
  answer, 
  index, 
  materialName,
  defaultExpert 
}: { 
  answer: ExpertAnswerItem; 
  index: number; 
  materialName: string;
  defaultExpert?: ExpertInfo;
}) {
  // Use answer-specific expert or fall back to default
  const expert = answer.expert || defaultExpert;
  const handleClick = (detailsElement: HTMLDetailsElement) => {
    const isExpanding = !detailsElement.open;
    
    trackFAQClick({
      materialName,
      question: answer.question.replace(/\*\*/g, ''),
      questionIndex: index,
      isExpanding,
    });
  };

  return (
    <div role="listitem" id={`qa-${index}`}>
      <details
        className="group bg-secondary rounded-lg border-2 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-300:border-blue-600"
        open={answer.acceptedAnswer && index === 0} // Auto-open first accepted answer
      >
        <summary 
          className="cursor-pointer px-6 py-5 font-normal flex items-start justify-between group-open:border-b-2 group-open:border-gray-200:border-gray-700 bg-gradient-to-r from-gray-50 to-white700/50800 hover:from-blue-50 hover:to-indigo-50:from-blue-900/20:to-indigo-900/20 list-none transition-all duration-200"
          onClick={(e) => {
            const detailsElement = e.currentTarget.parentElement as HTMLDetailsElement;
            handleClick(detailsElement);
          }}
        >
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">❓</span>
              {answer.acceptedAnswer && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-900 text-green-200 border border-green-300700">
                  ✓ Accepted Answer
                </span>
              )}
              {answer.severity && <SeverityBadge severity={answer.severity} />}
            </div>
            <h3 
              className="text-lg font-medium [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(answer.question) }}
            />
            {answer.category && (
              <p className="text-sm text-muted mt-1">
                Category: {answer.category.replace(/_/g, ' ')}
              </p>
            )}
          </div>
          <svg
            className="w-6 h-6 text-blue-600400 flex-shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <div className="p-6 space-y-6">
            {/* Expert card */}
            {expert && (
              <ExpertCard 
                expert={expert}
                dateAnswered={answer.dateAnswered}
                upvoteCount={answer.upvoteCount}
              />
            )}
            
            {/* Answer content */}
            <div className="prose prose-sm max-w-none">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-1">💡</span>
                <div className="flex-1">
                  <h4 className="text-base text-secondary font-semibold mb-2">
                    Expert Answer:
                  </h4>
                  <div 
                    className="text-primary [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(answer.answer) }}
                  />
                </div>
              </div>
            </div>
            
            {/* Property value badge */}
            {answer.propertyValue && (
              <div className="flex items-center gap-2 p-3 bg-blue-900/30 rounded-md border border-blue-200800">
                <svg className="w-5 h-5 text-blue-600400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-blue-700300">
                  Technical Value: {answer.propertyValue}
                </span>
              </div>
            )}
            
            {/* Solutions list */}
            {answer.solutions && answer.solutions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50900/20900/20 rounded-lg p-4 border border-green-200800">
                <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                  <span>✓</span>
                  Recommended Solutions:
                </h4>
                <ul className="space-y-2">
                  {answer.solutions.map((solution, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800200">
                      <span className="text-green-600400 font-bold">•</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Sources */}
            {answer.sources && answer.sources.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-xs text-secondary font-semibold mb-2 flex items-center gap-1">
                  📚 Sources & References:
                </h4>
                <ul className="space-y-1">
                  {answer.sources.map((source, idx) => (
                    <li key={idx} className="text-xs text-muted">
                      • {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Related topics */}
            {answer.relatedTopics && answer.relatedTopics.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted">
                  <strong>Related Topics:</strong> {answer.relatedTopics.join(' • ')}
                </p>
              </div>
            )}
            
            {/* Last reviewed date */}
            {answer.lastReviewed && (
              <div className="text-xs text-muted italic">
                Last reviewed: {new Date(answer.lastReviewed).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

/**
 * ExpertAnswers component - displays expert Q&A with E-E-A-T signals
 */
export function ExpertAnswers({
  materialName,
  answers = [],
  defaultExpert,
  className: _className = "",
}: ExpertAnswersProps) {
  if (!answers || answers.length === 0) return null;

  // Sort: accepted answers first, then by upvotes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.acceptedAnswer && !b.acceptedAnswer) return -1;
    if (!a.acceptedAnswer && b.acceptedAnswer) return 1;
    return (b.upvoteCount || 0) - (a.upvoteCount || 0);
  });

  return (
    <SectionContainer
      variant="default"
      title={`Expert Troubleshooting: ${materialName}`}
      icon={getSectionIcon('warning')}
    >
      <div className="space-y-4" role="list" aria-label="Expert answers">
        {sortedAnswers.map((answer, index) => (
          <ExpertAnswerCard
            key={index}
            answer={answer}
            index={index}
            materialName={materialName}
            defaultExpert={defaultExpert}
          />
        ))}
      </div>
      
      {/* Trust signals footer */}
      <div className="mt-6 p-4 bg-secondary rounded-lg text-sm text-muted text-center">
        <p>
          All answers provided by verified laser cleaning experts with industry credentials.
          {' '}
          <strong>Need personalized help?</strong> <a href="/contact" className="text-blue-600400 hover:underline">Contact our team</a>
        </p>
      </div>
    </SectionContainer>
  );
}
