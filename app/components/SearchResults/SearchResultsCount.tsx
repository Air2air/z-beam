// app/components/SearchResults/SearchResultsCount.tsx
interface SearchResultsCountProps {
  count: number;
  selectedTag?: string;
  searchQuery?: string;
}

export function SearchResultsCount({
  count,
  selectedTag,
  searchQuery
}: SearchResultsCountProps) {
  return (
    <div className="text-center text-gray-600 dark:text-gray-300">
      Found {count} {count === 1 ? 'result' : 'results'}
      {selectedTag && <span> for tag <span className="font-medium">{selectedTag}</span></span>}
      {searchQuery && <span> matching <span className="font-medium">&quot;{searchQuery}&quot;</span></span>}
    </div>
  );
}