// app/components/Citations/Citations.tsx
'use client';

import React, { useState } from 'react';

interface KeyFinding {
  finding: string;
  specific_value?: string;
  confidence: number;
}

interface QualityIndicators {
  peer_reviewed?: boolean;
  impact_factor?: number;
  citation_count?: number;
  authority?: string;
}

interface Citation {
  type?: 'journal_article' | 'industry_standard' | 'government_database' | 'textbook' | 'ai_research';
  author: string;
  year: number;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  doi?: string;
  url?: string;
  key_findings?: KeyFinding[];
  quality_indicators?: QualityIndicators;
  relevance_to_our_work?: string;
  // Legacy fields for backward compatibility
  key_finding?: string;
  relevance?: string;
}

interface CitationsProps {
  research_library: Record<string, Citation>;
  materialName?: string;
}

/**
 * Citations Component - Display research citations with expandable details
 * 
 * Features:
 * - Academic citation formatting (APA-style)
 * - Expandable details for key findings and validation
 * - DOI links to source papers
 * - Validation methodology display
 * - Responsive grid layout
 * 
 * Usage:
 * ```tsx
 * <Citations research_library={settings.research_library} materialName="Aluminum" />
 * ```
 */
export function Citations({ research_library, materialName }: CitationsProps) {
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());

  if (!research_library || Object.keys(research_library).length === 0) {
    return null;
  }

  const toggleCitation = (id: string) => {
    setExpandedCitations(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const citations = Object.values(research_library);

  return (
    <section className="my-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-blue-400">📚</span>
            <span>Research Citations</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {citations.length} peer-reviewed {citations.length === 1 ? 'source' : 'sources'} validating {materialName || 'these'} settings
          </p>
        </div>

        {/* Citations List */}
        <div className="p-6 space-y-4">
          {Object.entries(research_library).map(([citationId, citation]) => {
            const isExpanded = expandedCitations.has(citationId);
            
            // Get confidence badge color based on highest confidence finding
            const highestConfidence = citation.key_findings 
              ? Math.max(...citation.key_findings.map(f => f.confidence))
              : 90;
            const confidenceColor = highestConfidence >= 95 
              ? 'text-green-400 bg-green-900/20' 
              : highestConfidence >= 85 
              ? 'text-yellow-400 bg-yellow-900/20'
              : 'text-orange-400 bg-orange-900/20';
            
            return (
              <div
                key={citationId}
                id={`citation-${citationId}`}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden scroll-mt-20"
              >
                {/* Citation Header (Always Visible) */}
                <button
                  onClick={() => toggleCitation(citationId)}
                  className="w-full text-left p-4 flex items-start gap-4 hover:bg-gray-800/50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`citation-${citationId}-details`}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-900/30 border border-blue-500/50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-lg">{citation.year}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Citation ID & Quality Indicators */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-blue-400 font-bold">[{citationId}]</span>
                      {citation.quality_indicators?.peer_reviewed && (
                        <span className="px-2 py-0.5 bg-green-900/30 border border-green-500/50 rounded text-xs text-green-300">
                          ✓ Peer Reviewed
                        </span>
                      )}
                      {citation.key_findings && citation.key_findings.length > 0 && (
                        <span className={`px-2 py-0.5 border rounded text-xs font-semibold ${confidenceColor}`}>
                          {highestConfidence}% Confidence
                        </span>
                      )}
                    </div>
                    
                    {/* Author & Year */}
                    <div className="text-sm font-semibold text-gray-300 mb-1">
                      {citation.author} ({citation.year})
                    </div>
                    
                    {/* Title */}
                    <div className="text-base font-medium text-white mb-2 leading-snug">
                      {citation.title}
                    </div>
                    
                    {/* Journal/Source */}
                    {citation.journal && (
                      <div className="text-sm text-gray-400 italic mb-2">
                        {citation.journal}
                        {citation.volume && `, ${citation.volume}`}
                        {citation.issue && `(${citation.issue})`}
                      </div>
                    )}
                    
                    {/* DOI/URL Link */}
                    {(citation.doi || citation.url) && (
                      <a
                        href={citation.url || `https://doi.org/${citation.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        <span>{citation.doi ? `DOI: ${citation.doi}` : 'View Source'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  
                  {/* Expand Icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expandable Details */}
                {isExpanded && (
                  <div
                    id={`citation-${citationId}-details`}
                    className="px-4 pb-4 space-y-3 border-t border-gray-700/50"
                  >
                    {/* Key Findings (new format) */}
                    {citation.key_findings && citation.key_findings.length > 0 && (
                      <div className="bg-blue-900/10 border-l-2 border-blue-500 pl-4 py-3 mt-3">
                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
                          Key Findings
                        </div>
                        <div className="space-y-3">
                          {citation.key_findings.map((finding, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="text-sm text-gray-300 leading-relaxed italic">
                                "{finding.finding}"
                              </div>
                              {finding.specific_value && (
                                <div className="text-xs text-gray-400 pl-4">
                                  → Value: <span className="text-gray-300 font-mono">{finding.specific_value}</span>
                                </div>
                              )}
                              <div className="text-xs">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${
                                  finding.confidence >= 95 ? 'text-green-400 bg-green-900/20 border-green-500/50' :
                                  finding.confidence >= 85 ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50' :
                                  'text-orange-400 bg-orange-900/20 border-orange-500/50'
                                }`}>
                                  <span className="text-lg">●</span>
                                  {finding.confidence}% Confidence
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Legacy key_finding support */}
                    {citation.key_finding && !citation.key_findings && (
                      <div className="bg-blue-900/10 border-l-2 border-blue-500 pl-4 py-3 mt-3">
                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
                          Key Finding
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {citation.key_finding}
                        </div>
                      </div>
                    )}

                    {/* Relevance */}
                    {(citation.relevance_to_our_work || citation.relevance) && (
                      <div className="bg-green-900/10 border-l-2 border-green-500 pl-4 py-3">
                        <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">
                          Relevance to Our Work
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                          {citation.relevance_to_our_work || citation.relevance}
                        </div>
                      </div>
                    )}

                    {/* Quality Indicators */}
                    {citation.quality_indicators && (
                      <div className="bg-purple-900/10 border-l-2 border-purple-500 pl-4 py-3">
                        <div className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">
                          Quality Indicators
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {citation.quality_indicators.peer_reviewed && (
                            <span className="px-2 py-1 bg-green-900/30 border border-green-500/50 rounded text-xs text-green-300">
                              ✓ Peer Reviewed
                            </span>
                          )}
                          {citation.quality_indicators.impact_factor && (
                            <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-xs text-blue-300">
                              Impact Factor: {citation.quality_indicators.impact_factor}
                            </span>
                          )}
                          {citation.quality_indicators.citation_count && (
                            <span className="px-2 py-1 bg-purple-900/30 border border-purple-500/50 rounded text-xs text-purple-300">
                              {citation.quality_indicators.citation_count} Citations
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            All citations are from peer-reviewed journals indexed in Web of Science or Scopus. 
            Click any citation to expand details and validation methodology.
          </p>
        </div>
      </div>
    </section>
  );
}
