// app/contaminants/loading.tsx
// Loading state for contaminants listing page

import { LoadingState } from '@/app/components/LoadingState';

export default function ContaminantsLoading() {
  return <LoadingState message="Loading contaminants..." />;
}
