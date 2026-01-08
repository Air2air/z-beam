// app/materials/loading.tsx
// Loading state for materials listing page

export default function MaterialsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-12 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-12"></div>
        
        {/* Category grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
