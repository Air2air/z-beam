'use client';

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
          <h2 className="text-3xl font-bold text-red-600">Application Error</h2>
          <p className="text-gray-600 text-center max-w-md">
            A critical error occurred. Please refresh the page or try again later.
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 max-w-md text-center break-words">
              Error: {error.message}
            </p>
          )}
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
