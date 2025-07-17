// app/tags/page.tsx
import { getAllTags, getTagStats } from '../utils/server';
import Link from 'next/link';
import { SmartTagList } from '../components/Tag/SmartTagList';

export const metadata = {
  title: 'All Tags | Z-Beam',
  description: 'Browse all tags and topics covered in Z-Beam articles.',
};

export default async function TagsPage() {
  const allTags = getAllTags();
  const tagStats = getTagStats();
  
  // Create a map for quick lookup of tag counts
  const tagCountMap = tagStats.reduce((map, stat) => {
    map[stat.tag] = stat.count;
    return map;
  }, {} as Record<string, number>);
  
  // Sort tags by frequency (most used first)
  const sortedTags = allTags.sort((a, b) => {
    const aCount = tagCountMap[a] || 0;
    const bCount = tagCountMap[b] || 0;
    return bCount - aCount;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-2">
        All Tags
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Browse articles by topic and category.
      </p>
      
      {/* All Tags Display */}
      <div className="mb-12">
        <SmartTagList 
          tags={sortedTags}
          title=""
          showByCategory={true}
          linkable={true}
          className="mb-0"
        />
      </div>
      
      {/* Tag Cloud with Counts */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Popular Tags
        </h2>
        <div className="flex flex-wrap gap-3">
          {sortedTags.slice(0, 20).map((tag) => {
            const count = tagCountMap[tag] || 0;
            const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            return (
              <Link
                key={tag}
                href={`/tags/${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {tag}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
