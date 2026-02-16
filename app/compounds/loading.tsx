// app/compounds/loading.tsx
// Loading state for compounds listing page

import { LoadingState } from '@/app/components/LoadingState';

export default function CompoundsLoading() {
  return <LoadingState message="Loading compounds..." />;
}
