// app/components/Card/Card.tsx - Master card component
import './styles.scss';
import Link from "next/link";
import { OptimizedImage } from "../UI/OptimizedImage";
import { BadgeSymbol } from "./BadgeSymbol";

export interface CardProps {
  href: string;
  title: string;
  description?: string;
  imageUrl?: string; // Keep for backward compatibility
  image?: string;    // Add this for new code
  imageAlt?: string;
  
  // Variant controls
  variant?: 'default' | 'large' | 'compact' | 'featured';
  layout?: 'vertical' | 'horizontal';
  
  // Content options
  showBadge?: boolean;
  badge?: {
    text: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  };
  
  // Metadata
  metadata?: {
    date?: string;
    category?: string;
    articleType?: string;
    atomicNumber?: number;
    chemicalSymbol?: string;
    nameShort?: string;
  };
  
  // Styling
  className?: string;
}

export function Card({
  href,
  title,
  description,
  imageUrl,
  image, // Add this prop
  imageAlt,
  variant = 'default',
  layout = 'vertical',
  showBadge = false,
  badge,
  metadata,
  className = ''
}: CardProps) {
  // Size configurations
  const variantConfig = {
    default: {
      imageHeight: 'h-40',
      padding: 'p-4',
      titleSize: 'text-lg',
      descLines: 'line-clamp-2'
    },
    large: {
      imageHeight: 'h-56',
      padding: 'p-6',
      titleSize: 'text-xl',
      descLines: 'line-clamp-3'
    },
    compact: {
      imageHeight: 'h-32',
      padding: 'p-3',
      titleSize: 'text-base',
      descLines: 'line-clamp-1'
    },
    featured: {
      imageHeight: 'h-64',
      padding: 'p-8',
      titleSize: 'text-2xl',
      descLines: 'line-clamp-4'
    }
  };

  const config = variantConfig[variant];
  
  const cardClasses = `
    group block bg-white rounded-lg shadow-md hover:shadow-xl 
    transition-all duration-300 overflow-hidden border border-gray-100 
    dark:bg-gray-800 dark:border-gray-700 ${className}
  `;

  // Use either imageUrl or image
  const displayImage = imageUrl || image;
  
  if (layout === 'horizontal') {
    return (
      <Link href={href} className={cardClasses}>
        <article className="flex h-full">
          {displayImage && (
            <div className={`relative w-1/3 ${config.imageHeight} overflow-hidden`}>
              <OptimizedImage
                src={displayImage}
                alt={imageAlt || title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Add BadgeSymbol for horizontal layout */}
              {metadata?.chemicalSymbol && (
                <div className="absolute top-2 right-2">
                  <BadgeSymbol 
                    chemicalSymbol={metadata.chemicalSymbol}
                    atomicNumber={metadata.atomicNumber}
                  />
                </div>
              )}
            </div>
          )}
          
          <div className={`flex-1 ${config.padding} flex flex-col justify-between`}>
            <CardContent 
              title={title}
              description={description}
              metadata={metadata}
              badge={badge}
              showBadge={showBadge}
              config={config}
            />
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} className={cardClasses}>
      <article className="flex flex-col h-full">
        {displayImage && (
          <div className={`relative w-full ${config.imageHeight} overflow-hidden`}>
            <OptimizedImage
              src={displayImage}
              alt={imageAlt || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Uncomment and use BadgeSymbol for vertical layout */}
            {metadata?.chemicalSymbol && (
              <div className="absolute top-2 right-2">
                <BadgeSymbol 
                  chemicalSymbol={metadata.chemicalSymbol}
                  atomicNumber={metadata.atomicNumber}
                />
              </div>
            )}
          </div>
        )}
        
        <div className={`${config.padding} flex-grow`}>
          <CardContent 
            title={title}
            description={description}
            metadata={metadata}
            badge={badge}
            showBadge={showBadge}
            config={config}
          />
        </div>
      </article>
    </Link>
  );
}

// Add proper typing to CardContent
interface CardContentProps {
  title: string;
  description?: string;
  metadata?: {
    date?: string;
    category?: string;
    articleType?: string;
    atomicNumber?: number;
    chemicalSymbol?: string;
    nameShort?: string;
  };
  badge?: {
    text: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  };
  showBadge?: boolean;
  config: {
    titleSize: string;
    descLines: string;
  };
}

function CardContent({ 
  title, 
  description, 
  metadata, 
  badge, 
  showBadge, 
  config 
}: CardContentProps) {
  return (
    <>
      {/* Badges and metadata */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showBadge && badge && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full
              ${badge.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
              ${badge.color === 'green' ? 'bg-green-100 text-green-800' : ''}
              ${badge.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
              ${badge.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
              ${!badge.color ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {badge.text}
            </span>
          )}
          
          {metadata?.articleType && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
              {metadata.articleType}
            </span>
          )}
        </div>

        {metadata?.nameShort && (
          <span className="text-xs text-gray-500 font-mono">
            {metadata.nameShort}
          </span>
        )}
      </div>
      
      {/* Title */}
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 
        group-hover:text-blue-600 transition-colors ${config.titleSize}`}>
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className={`text-gray-600 dark:text-gray-300 text-sm ${config.descLines} flex-grow`}>
          {description}
        </p>
      )}
      
      {/* Additional metadata */}
      {metadata && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {metadata.category && (
              <span>Category: {metadata.category}</span>
            )}
            {metadata.date && (
              <span>{metadata.date}</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
