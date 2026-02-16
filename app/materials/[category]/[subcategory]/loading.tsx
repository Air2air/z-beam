// app/materials/[category]/[subcategory]/loading.tsx
// Loading state for material subcategory listing pages

import { LoadingState } from '@/app/components/LoadingState';

export default function MaterialSubcategoryLoading() {
  return <LoadingState message="Loading subcategory..." />;
}
