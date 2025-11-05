'use client';

import { Title } from './components/Title';

import { Button } from './components/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
          <Title level="section" title="Application Error" />
          <p className="text-gray-600 text-center max-w-md">
            A critical error occurred. Please refresh the page or try again later.
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
      </body>
    </html>
  );
}
