// app/components/Dataset/AuthorCredentialsBadge.tsx

interface AuthorCredentialsBadgeProps {
  author: {
    name: string;
    jobTitle?: string;
    credentials?: string;
  };
}

/**
 * Author Credentials Badge Component
 * 
 * Displays dataset author information with credentials and expertise.
 * Enhances E-E-A-T (Expertise, Authoritativeness, Trustworthiness) signals.
 * 
 * @param author - Author information from generated dataset
 */
export function AuthorCredentialsBadge({ author }: AuthorCredentialsBadgeProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{author.name}</p>
        {author.jobTitle && (
          <p className="text-xs text-gray-600 mt-0.5">{author.jobTitle}</p>
        )}
        {author.credentials && (
          <p className="text-xs text-blue-700 font-medium mt-1">{author.credentials}</p>
        )}
      </div>
    </div>
  );
}
