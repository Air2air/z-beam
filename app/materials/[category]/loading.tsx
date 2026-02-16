// app/materials/[category]/loading.tsx
// Loading state for material category pages

import { LoadingState } from '@/app/components/LoadingState';

export default function MaterialCategoryLoading() {
  return <LoadingState message="Loading category..." />;
}
