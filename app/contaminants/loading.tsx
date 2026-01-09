// app/contaminants/loading.tsx
// Loading state for contaminants listing page

import CardGridSkeleton from '@/app/components/CardGrid/CardGridSkeleton';

export default function ContaminantsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CardGridSkeleton count={9} showTitle={true} titleText="Contaminants" />
    </div>
  );
}
