// app/materials/[category]/[subcategory]/[slug]/loading.tsx
// Loading state for material detail pages

import { LoadingState } from '@/app/components/LoadingState';

export default function MaterialDetailLoading() {
  return <LoadingState message="Loading material details..." minHeightClass="min-h-[50vh]" />;
}
