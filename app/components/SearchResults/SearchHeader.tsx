// app/components/SearchResults/SearchHeader.tsx
import { SearchBar } from "../UI/SearchBar";
import { TagFilter } from "../UI/TagFilter";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  placeholder?: string;
  showTagFilter?: boolean;
  tagItemCounts?: Record<string, number>; // Add count information
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  tags,
  selectedTag,
  onTagSelect,
  placeholder = "Search materials, articles, and more...",
  showTagFilter = true,
  tagItemCounts,
}: SearchHeaderProps) {
  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={placeholder}
        className="w-full max-w-2xl mx-auto"
      />
      
      {showTagFilter && (
        <TagFilter
          tags={tags}
          selectedTag={selectedTag}
          onSelectTag={(tag) => {
            onTagSelect(tag);
          }}
          className="flex flex-wrap gap-4 justify-center"
          tagItemCounts={tagItemCounts}
        />
      )}
    </div>
  );
}