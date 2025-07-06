// app/components/TagDirectory.tsx
import Link from 'next/link';
import { FadeInOnScroll } from "./FadeInOnScroll";
import { getTagStats } from '../utils/tags';

interface TagDirectoryProps {
  className?: string;
}

export function TagDirectory({ className = "" }: TagDirectoryProps) {
  const tagStats = getTagStats();

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Topic</h2>
        <p className="text-gray-600">Discover laser cleaning content by subject area</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {tagStats.map((tagStat, index) => (
          <FadeInOnScroll
            key={tagStat.tag}
            delay={0.05 * index}
            yOffset={10}
            amount={0.1}
          >
            <TagCard tag={tagStat.tag} slug={tagStat.slug} count={tagStat.count} />
          </FadeInOnScroll>
        ))}
      </div>
    </div>
  );
}

// Individual tag card component
function TagCard({ 
  tag, 
  slug, 
  count 
}: { 
  tag: string; 
  slug: string; 
  count: number; 
}) {
  // Different colors for different tag types
  const getTagColor = (tag: string) => {
    if (tag.includes('Laser') || tag.includes('Cleaning')) return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    if (tag.includes('Aerospace') || tag.includes('Defense')) return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    if (tag.includes('Metal') || tag.includes('Material')) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (tag.includes('Safety') || tag.includes('Nuclear')) return 'bg-red-100 text-red-800 hover:bg-red-200';
    if (tag.includes('Surface') || tag.includes('Preparation')) return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  const colorClass = getTagColor(tag);

  return (
    <Link
      href={`/tags/${slug}`}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${colorClass}`}
    >
      <span>#{tag}</span>
      <span className="ml-2 opacity-75">({count})</span>
    </Link>
  );
}
