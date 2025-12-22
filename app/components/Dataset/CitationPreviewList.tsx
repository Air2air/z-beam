// app/components/Dataset/CitationPreviewList.tsx

interface CitationPreviewListProps {
  citations: Array<{
    '@type'?: string;
    name: string;
    author?: {
      '@type'?: string;
      name: string;
      jobTitle?: string;
    };
    publisher?: {
      '@type'?: string;
      name: string;
      url?: string;
    };
    url?: string;
    datePublished?: string;
  }>;
  maxDisplay?: number;
}

/**
 * Citation Preview List Component
 * 
 * Displays dataset citations with author/publisher information and links.
 * Shows authoritative sources that validate the dataset quality.
 * 
 * @param citations - Citation array from generated dataset
 * @param maxDisplay - Maximum number of citations to display (default: 3)
 */
export function CitationPreviewList({ citations, maxDisplay = 3 }: CitationPreviewListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        References
      </h4>
      <ul className="space-y-3">
        {citations.slice(0, maxDisplay).map((citation, i) => (
          <li key={i} className="flex items-start gap-3 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 leading-tight">
                {citation.name}
              </p>
              {citation.author && (
                <p className="text-xs text-gray-600 mt-1">
                  {citation.author.name}
                  {citation.author.jobTitle && ` • ${citation.author.jobTitle}`}
                </p>
              )}
              {citation.publisher && !citation.author && (
                <p className="text-xs text-gray-600 mt-1">
                  {citation.publisher.name}
                </p>
              )}
              {citation.url && (
                <a 
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1.5 inline-flex items-center gap-1"
                >
                  View source
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {citations.length > maxDisplay && (
        <p className="text-xs text-gray-500 text-center pt-2">
          + {citations.length - maxDisplay} more {citations.length - maxDisplay === 1 ? 'citation' : 'citations'} in full dataset
        </p>
      )}
    </div>
  );
}
