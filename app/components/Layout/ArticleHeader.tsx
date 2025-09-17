// app/components/Layout/ArticleHeader.tsx
// Extracted header component to simplify Layout.tsx

import { Hero } from "../Hero/Hero";
import { Title } from "../Title/Title";
import { Author } from "../Author/Author";
import { extractSafeValue } from "../../utils/stringHelpers";
import type { ArticleMetadata } from "@/types";

interface ArticleHeaderProps {
  metadata?: ArticleMetadata;
  slug?: string;
  title?: string;
}

export function ArticleHeader({ metadata, slug, title }: ArticleHeaderProps) {
  // Extract material name for hero image (from subject or slug)
  const materialName = extractSafeValue(metadata?.subject).toLowerCase() || 
    (slug && extractSafeValue(slug).includes('-') ? extractSafeValue(slug).split('-')[0].toLowerCase() : extractSafeValue(slug || '').toLowerCase());

  // Simplified title determination
  const displayTitle = title || metadata?.title || metadata?.headline || metadata?.subject || '';
  const displaySubtitle = metadata?.title ? String(metadata?.headline || '') : String(metadata?.description || '');

  return (
    <div className="header-section mb-6">
      {/* Hero component for background image */}
      {materialName && (
        <Hero
          frontmatter={metadata}
          theme="dark"
          align="center"
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
          author={metadata.authorInfo}
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
