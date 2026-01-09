// app/materials/[category]/[subcategory]/loading.tsx
// Loading state for material subcategory listing pages

export default function MaterialSubcategoryLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-4 bg-tertiary rounded w-20"></div>
          <div className="h-4 bg-tertiary rounded w-4"></div>
          <div className="h-4 bg-tertiary rounded w-24"></div>
          <div className="h-4 bg-tertiary rounded w-4"></div>
          <div className="h-4 bg-tertiary rounded w-28"></div>
        </div>
        
        {/* Header skeleton */}
        <div className="h-12 bg-secondary rounded w-3/5 mb-6"></div>
        <div className="h-6 bg-tertiary rounded w-4/5 mb-10"></div>
        
        {/* Material grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border border-tertiary rounded-lg overflow-hidden bg-primary">
              <div className="h-48 bg-secondary"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-tertiary rounded w-full"></div>
                <div className="h-4 bg-tertiary rounded w-4/5"></div>
                <div className="h-4 bg-tertiary rounded w-full"></div>
                <div className="h-8 bg-secondary rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
