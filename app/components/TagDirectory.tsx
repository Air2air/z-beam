// app/components/TagDirectory.tsx
import Link from 'next/link';
import { FadeInOnScroll } from "./FadeInOnScroll";
import { getTagStats } from '../utils/tags';
import { getTagInfo } from '../utils/tagConfig';

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
  const config = getTagInfo(tag);
  const bgClass = config.color.bg;
  const textClass = config.color.text;
  
  // Create hover variant by replacing -600 with -700 for darker hover effect
  const hoverBgClass = bgClass.replace('-600', '-700');
  const colorClass = `${bgClass} ${textClass} hover:${hoverBgClass}`;

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
