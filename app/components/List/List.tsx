// app/components/List/UnifiedList.tsx
import { Card, CardProps } from '../Card/Card';

export interface ListItem {
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: any;
  [key: string]: any;
}

export interface UnifiedListProps {
  items: ListItem[];
  
  // Layout options
  layout?: 'grid' | 'list' | 'masonry';
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  
  // Card options
  cardVariant?: CardProps['variant'];
  cardLayout?: CardProps['layout'];
  showBadges?: boolean;
  
  // List metadata
  heading?: string;
  description?: string;
  
  // Filtering & sorting
  limit?: number;
  sortBy?: 'title' | 'date' | 'category' | 'custom';
  filterBy?: {
    category?: string;
    articleType?: string;
    tag?: string;
  };
  
  // Customization
  className?: string;
  emptyMessage?: string;
  
  // Custom rendering
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  generateHref?: (item: ListItem) => string;
}

export function UnifiedList({
  items,
  layout = 'grid',
  columns = 3,
  gap = 'md',
  cardVariant = 'default',
  cardLayout = 'vertical',
  showBadges = true,
  heading,
  description,
  limit,
  sortBy,
  filterBy,
  className = '',
  emptyMessage = 'No items found.',
  renderItem,
  generateHref = (item) => `/${item.slug}`
}: UnifiedListProps) {
  
  // Apply filtering
  let filteredItems = [...items];
  
  if (filterBy) {
    filteredItems = filteredItems.filter(item => {
      if (filterBy.category && item.metadata?.category !== filterBy.category) return false;
      if (filterBy.articleType && item.metadata?.articleType !== filterBy.articleType) return false;
      if (filterBy.tag && !item.metadata?.tags?.includes(filterBy.tag)) return false;
      return true;
    });
  }
  
  // Apply sorting
  if (sortBy) {
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.metadata?.date || 0).getTime() - new Date(a.metadata?.date || 0).getTime();
        case 'category':
          return (a.metadata?.category || '').localeCompare(b.metadata?.category || '');
        default:
          return 0;
      }
    });
  }
  
  // Apply limit
  if (limit && limit > 0) {
    filteredItems = filteredItems.slice(0, limit);
  }
  
  // Layout classes
  const layoutClasses = {
    grid: {
      1: 'grid grid-cols-1',
      2: 'grid grid-cols-1 md:grid-cols-2',
      3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    },
    list: 'space-y-4',
    masonry: 'columns-1 md:columns-2 lg:columns-3 space-y-4'
  };
  
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6', 
    lg: 'gap-8'
  };
  
  const containerClass = layout === 'grid' 
    ? `${layoutClasses.grid[columns]} ${gapClasses[gap]}`
    : layoutClasses[layout];

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      {(heading || description) && (
        <header className="space-y-2">
          {heading && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </header>
      )}
      
      {/* Items */}
      <div className={containerClass}>
        {filteredItems.map((item, index) => {
          if (renderItem) {
            return (
              <div key={item.slug || index}>
                {renderItem(item, index)}
              </div>
            );
          }
          
          return (
            <Card
              key={item.slug || index}
              href={generateHref(item)}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              imageAlt={item.title}
              variant={cardVariant}
              layout={cardLayout}
              showBadge={showBadges}
              badge={item.metadata?.articleType ? {
                text: item.metadata.articleType,
                color: getBadgeColor(item.metadata.articleType)
              } : undefined}
              metadata={item.metadata}
            />
          );
        })}
      </div>
    </section>
  );
}

function getBadgeColor(articleType: string): 'blue' | 'green' | 'purple' | 'orange' {
  const colors = {
    material: 'blue',
    application: 'green', 
    technique: 'purple',
    equipment: 'orange'
  };
  return colors[articleType] || 'blue';
}