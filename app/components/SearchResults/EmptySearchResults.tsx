// app/components/SearchResults/EmptySearchResults.tsx
export function EmptySearchResults() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        No results found. Try a different search term or tag.
      </p>
    </div>
  );
}