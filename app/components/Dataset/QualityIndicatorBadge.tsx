// app/components/Dataset/QualityIndicatorBadge.tsx

interface QualityIndicatorBadgeProps {
  quality: {
    verificationMethod?: string;
    accuracyLevel?: string;
    lastVerified?: string;
    sources?: string[];
    updateFrequency?: string;
  };
}

/**
 * Quality Indicator Badge Component
 * 
 * Displays dataset quality metrics and verification status.
 * Shows verification method, accuracy level, and data sources.
 * 
 * @param quality - Quality metadata from generated dataset
 */
export function QualityIndicatorBadge({ quality }: QualityIndicatorBadgeProps) {
  // Determine quality level color scheme
  const getColorClasses = () => {
    if (quality.accuracyLevel?.includes('High')) {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    if (quality.accuracyLevel?.includes('Moderate')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className={`px-4 py-3 rounded-lg border ${getColorClasses()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {quality.accuracyLevel && (
            <p className="text-sm font-semibold mb-1">
              {quality.accuracyLevel} Accuracy
            </p>
          )}
          {quality.lastVerified && (
            <p className="text-xs opacity-90">
              Verified: {new Date(quality.lastVerified).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          )}
          {quality.updateFrequency && (
            <p className="text-xs opacity-90 mt-0.5">
              Updates: {quality.updateFrequency}
            </p>
          )}
        </div>
      </div>
      
      {quality.sources && quality.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current opacity-20">
          <p className="text-xs font-semibold mb-2 opacity-90">Sources:</p>
          <ul className="space-y-1">
            {quality.sources.slice(0, 3).map((source, i) => (
              <li key={i} className="text-xs opacity-90 flex items-start gap-1.5">
                <span className="mt-1">•</span>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
