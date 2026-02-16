// app/contaminants/[category]/[subcategory]/[slug]/loading.tsx
// Loading state for contaminant detail pages

import { LoadingState } from '@/app/components/LoadingState';

export default function ContaminantDetailLoading() {
  return <LoadingState message="Loading contaminant details..." minHeightClass="min-h-[50vh]" />;
}
