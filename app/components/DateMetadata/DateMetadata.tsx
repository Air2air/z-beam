/**
 * @component DateMetadata
 * @purpose Displays article publication and modification dates
 * @dependencies None - pure presentation component
 * @complexity Low - simple date formatting and display
 * @aiContext Renders structured date metadata with icons for published/modified dates
 */
// app/components/DateMetadata/DateMetadata.tsx
"use client";

interface DateMetadataProps {
  datePublished?: string;
  lastModified?: string;
  className?: string;
}

export function DateMetadata({ datePublished, lastModified, className = '' }: DateMetadataProps) {
  // Don't render if no dates provided
  if (!datePublished && !lastModified) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`article-dates text-sm text-gray-600 dark:text-gray-400 mb-6 flex flex-wrap gap-2 ${className}`}>
      {datePublished && (
        <time 
          dateTime={datePublished}
          itemProp="datePublished"
          className="flex items-center"
        >
          <span className="sr-only">Published: </span>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(datePublished)}
        </time>
      )}
      {lastModified && lastModified !== datePublished && (
        <>
          <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">•</span>
          <time 
            dateTime={lastModified}
            itemProp="dateModified"
            className="flex items-center"
          >
            <span className="sr-only">Last updated: </span>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Updated {formatDate(lastModified)}
          </time>
        </>
      )}
    </div>
  );
}
