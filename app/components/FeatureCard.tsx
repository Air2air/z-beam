// app/components/FeatureCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface FeatureCardProps {
  /** The URL for the card's link */
  href: string;
  /** The source URL for the image */
  imageUrl: string;
  /** Alt text for the image */
  imageAlt: string;
  /** The main title of the card */
  title: string;
  /** A short description or summary */
  description: string;
  /** Optional date string (e.g., "June 28, 2025") */
  date?: string;
  /** Optional array of tags */
  tags?: string[];
}

export function FeatureCard({
  href,
  imageUrl,
  imageAlt,
  title,
  description,
  date,
  tags,
}: FeatureCardProps) {
  return (
    // The entire card is a clickable link.
    // - group: Enables styling child elements on hover of this parent link.
    // - rounded-lg: Rounded corners for the whole card.
    // - shadow-md: Standard shadow, increases on hover.
    // - hover:shadow-xl: Larger shadow on hover for a lift effect.
    // - transition-all duration-300: Smooth transition for all property changes.
    // - overflow-hidden: Ensures content/shadows are clipped to the rounded corners.
    // - bg-white dark:bg-gray-800: Background color for light and dark modes.
    // - border border-gray-100 dark:border-gray-700: Subtle border for separation.
    <Link
      href={href}
      className="group block rounded-lg shadow-md hover:shadow-xl
                 transition-all duration-300 overflow-hidden
                 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <article className="flex flex-col h-full"> {/* Use material for semantic content */}
        {/* Image Section */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            // fill: Makes the image fill its parent container, good for responsive images.
            // object-cover: Ensures the image covers the area without distortion, cropping if needed.
            // group-hover:scale-105: Scales the image slightly on card hover for a dynamic effect.
            // transition-transform duration-300: Smooth transition for the scale.
            // bg-gray-200 dark:bg-gray-700: Placeholder background if image takes time to load.
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive image sizes
            className="object-cover group-hover:scale-105 transition-transform duration-300
                       bg-gray-200 dark:bg-gray-700"
            priority={false} // Adjust based on your content, set true for above-the-fold images
          />
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 flex flex-col flex-grow"> {/* Increased padding on small screens */}
          {date && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 tabular-nums">
              {date}
            </p>
          )}

          <h3
            // text-xl: Larger title.
            // font-semibold: Bold font.
            // text-gray-900 dark:text-white: Main text color for light/dark mode.
            // tracking-tight: Slightly condensed letter spacing for titles.
            // mb-2: Margin below the title.
            // group-hover:text-blue-600 dark:group-hover:text-blue-400: Color change on hover.
            // transition-colors: Smooth color transition.
            className="text-xl font-semibold text-gray-900 dark:text-white
                       tracking-tight mb-2
                       group-hover:text-blue-600 dark:group-hover:text-blue-400
                       transition-colors"
          >
            {title}
          </h3>

          <p
            // text-gray-700 dark:text-gray-300: Softer text color for description.
            // text-base: Standard base font size.
            // line-clamp-3: Limits description to 3 lines, adding ellipsis if longer.
            //   (Requires @tailwindcss/line-clamp plugin in tailwind.config.js)
            className="text-gray-700 dark:text-gray-300 text-base flex-grow
                       line-clamp-3 leading-relaxed"
          >
            {description}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-blue-100 text-blue-800
                             dark:bg-blue-900 dark:text-blue-200 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}