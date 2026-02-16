interface LoadingStateProps {
  message?: string;
  minHeightClass?: string;
  size?: 'md' | 'lg';
}

export function LoadingState({
  message = 'Loading...',
  minHeightClass = 'min-h-[40vh]',
  size = 'md',
}: LoadingStateProps) {
  const spinnerSizeClass = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const marginTopClass = size === 'lg' ? 'mt-4' : 'mt-3';

  return (
    <div className={`${minHeightClass} flex items-center justify-center`}>
      <div className="text-center">
        <div className={`inline-block animate-spin rounded-full ${spinnerSizeClass} border-b-2 border-blue-600`} />
        <p className={`${marginTopClass} text-gray-600`}>{message}</p>
      </div>
    </div>
  );
}
