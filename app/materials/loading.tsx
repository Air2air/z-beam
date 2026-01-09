// app/materials/loading.tsx
// Loading state for materials listing page

import CardGridSkeleton from '@/app/components/CardGrid/CardGridSkeleton';

export default function MaterialsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CardGridSkeleton count={9} showTitle={true} titleText="Materials" />
    </div>
  );
}
