// app/materials/[category]/loading.tsx
// Loading state for material category pages

export default function MaterialCategoryLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-tertiary rounded w-1/4 mb-4"></div>
        
        {/* Header skeleton */}
        <div className="h-10 bg-secondary rounded w-1/2 mb-6"></div>
        <div className="h-5 bg-tertiary rounded w-2/3 mb-10"></div>
        
        {/* Subcategory grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-tertiary rounded-lg p-4 bg-primary">
              <div className="h-32 bg-secondary rounded mb-3"></div>
              <div className="h-5 bg-tertiary rounded w-full mb-2"></div>
              <div className="h-3 bg-tertiary rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
