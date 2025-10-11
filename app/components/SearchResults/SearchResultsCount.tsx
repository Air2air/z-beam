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
    <div className="mb-4 text-sm text-gray-600">
      Showing {count} result{count !== 1 ? 's' : ''}
      {selectedTag && <span> for tag <strong>{selectedTag}</strong></span>}
      {searchQuery && <span> matching <strong>&quot;{searchQuery}&quot;</strong></span>}
    </div>
  );
}