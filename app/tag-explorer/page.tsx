// app/tag-explorer/page.tsx
import { getAllUniqueTags, getTagCounts } from "@/app/utils/articleTagsUtils";
import Link from "next/link";

export default async function TagExplorerPage() {
  // Get all unique tags
  const allTags = await getAllUniqueTags();
  
  // Get tag counts
  const tagCounts = await getTagCounts();
  
  // Sort tags by count (descending)
  const sortedTags = [...allTags].sort((a, b) => 
    tagCounts[b] - tagCounts[a]
  );
  
  // Group tags by first letter
  const tagsByLetter: Record<string, string[]> = {};
  
  sortedTags.forEach(tag => {
    const firstLetter = tag.charAt(0).toUpperCase();
    if (!tagsByLetter[firstLetter]) {
      tagsByLetter[firstLetter] = [];
    }
    tagsByLetter[firstLetter].push(tag);
  });
  
  // Get alphabetically sorted letters
  const letters = Object.keys(tagsByLetter).sort();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tag Explorer</h1>
      
      <div className="mb-8">
        <p className="text-gray-600">
          Browse all {allTags.length} tags used across articles.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map(letter => (
          <a 
            key={letter}
            href={`#letter-${letter}`}
            className="inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-medium"
          >
            {letter}
          </a>
        ))}
      </div>
      
      {letters.map(letter => (
        <div key={letter} id={`letter-${letter}`} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">{letter}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagsByLetter[letter].map(tag => (
              <div key={tag} className="border rounded-md p-4 hover:bg-gray-50">
                <Link 
                  href={`/tag/${encodeURIComponent(tag)}`} 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {tag}
                </Link>
                <span className="ml-2 text-sm text-gray-500">
                  ({tagCounts[tag]} {tagCounts[tag] === 1 ? 'article' : 'articles'})
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
