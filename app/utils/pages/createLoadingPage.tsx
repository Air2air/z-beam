// app/utils/pages/createLoadingPage.tsx
// Factory for creating simple domain loading pages.
// Usage: export default createLoadingPage('Loading materials...');

import { LoadingState } from '@/app/components/LoadingState';

/**
 * Returns a loading page component with the given message and optional min-height.
 * Avoids the 8-line boilerplate for every loading.tsx in each domain route segment.
 */
export function createLoadingPage(message?: string, minHeightClass?: string) {
  return function LoadingPage() {
    return <LoadingState message={message} minHeightClass={minHeightClass} />;
  };
}
