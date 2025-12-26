'use client';

import { useEffect } from 'react';
import { Button } from './components/Button';
import { SectionTitle } from './components/SectionTitle/SectionTitle';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <SectionTitle title="Something went wrong!" alignment="center" />
      <p className="text-gray-600 text-center max-w-md">
        An error occurred while rendering this page. Please try again.
      </p>
      {error.message && (
        <p className="text-sm text-gray-500 max-w-md text-center break-words">
          Error: {error.message}
        </p>
      )}
      <Button
        onClick={reset}
        variant="primary"
        size="md"
      >
        Try again
      </Button>
    </div>
  );
}
