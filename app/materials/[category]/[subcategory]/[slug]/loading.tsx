// app/materials/[category]/[subcategory]/[slug]/loading.tsx
// Loading state for material detail pages

import HeroSkeleton from '@/app/components/Hero/HeroSkeleton';
import MicroSkeleton from '@/app/components/Micro/MicroSkeleton';
import CardGridSkeleton from '@/app/components/CardGrid/CardGridSkeleton';

export default function MaterialDetailLoading() {
  return (
    <div>
      {/* Hero section */}
      <HeroSkeleton />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-8 animate-pulse">
          <div className="h-4 bg-tertiary rounded w-20"></div>
          <div className="h-4 bg-tertiary rounded w-4"></div>
          <div className="h-4 bg-tertiary rounded w-24"></div>
          <div className="h-4 bg-tertiary rounded w-4"></div>
          <div className="h-4 bg-tertiary rounded w-28"></div>
          <div className="h-4 bg-tertiary rounded w-4"></div>
          <div className="h-4 bg-tertiary rounded w-32"></div>
        </div>
        
        {/* Title and description skeleton */}
        <div className="mb-12 space-y-6 animate-pulse">
          <div className="h-14 bg-secondary rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-tertiary rounded w-full"></div>
            <div className="h-6 bg-tertiary rounded w-5/6"></div>
          </div>
        </div>
        
        {/* Content sections */}
        <div className="space-y-12">
          {/* LaserMaterialInteraction section */}
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-primary rounded w-full"></div>
              <div className="h-4 bg-primary rounded w-full"></div>
              <div className="h-4 bg-primary rounded w-4/5"></div>
            </div>
          </div>
          
          {/* MaterialCharacteristics section */}
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-2/5 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-primary rounded"></div>
              <div className="h-32 bg-primary rounded"></div>
              <div className="h-32 bg-primary rounded"></div>
              <div className="h-32 bg-primary rounded"></div>
            </div>
          </div>
          
          {/* Micro component */}
          <MicroSkeleton />
          
          {/* Relationship Cards */}
          <CardGridSkeleton count={6} showTitle={true} titleText="Related Items" />
        </div>
      </div>
    </div>
  );
}
