// app/components/Article/ArticleHeader.tsx
// Extracted header component for article pages

import { Hero } from "../Hero/Hero";
import { Title } from "../Title/Title";
import { Author } from "../Author/Author";
import { extractSafeValue } from "../../utils/stringHelpers";
import type { ArticleMetadata, ComponentData } from "@/types";

interface ArticleHeaderProps {
  metadata?: ArticleMetadata;
  slug?: string;
  title?: string;
  components?: Record<string, ComponentData>;
}

export function ArticleHeader({ metadata, slug, title, components }: ArticleHeaderProps) {
  // Extract material name for hero image (from subject or slug)
  const materialName = extractSafeValue(metadata?.subject).toLowerCase() || 
    (slug && extractSafeValue(slug).includes('-') ? extractSafeValue(slug).split('-')[0].toLowerCase() : extractSafeValue(slug || '').toLowerCase());

  // Simplified title determination
  const displayTitle = title || metadata?.title || metadata?.subject || '';
  const displaySubtitle = metadata?.title ? String(metadata?.description || '') : String(metadata?.description || '');

  return (
    <div className="header-section mb-6">
      {/* Hero component for background image */}
      {materialName && (
        <Hero
          frontmatter={metadata}
          theme="dark"
        />
      )}

      {/* Title section */}
      {displayTitle && (
        <Title subtitle={displaySubtitle}>
          {String(displayTitle)}
        </Title>
      )}
      
      {/* Author component - simplified direct usage */}
      {metadata?.authorInfo && (
        <Author 
          frontmatter={metadata}
          showAvatar={true}
          showCredentials={true}
          showCountry={true}
          showSpecialties={true}
          className="mt-2 mb-4"
        />
      )}
    </div>
  );
}
