// app/components/BadgeSymbol/ServerBadgeSymbol.tsx
import { getMaterialFrontmatter } from '@/app/utils/serverUtils';
import { BadgeSymbol } from './BadgeSymbol';
import { ArticleFrontmatter } from '@/app/types/Article';

interface ServerBadgeSymbolProps {
  materialSlug?: string;
  variant?: "card" | "large" | "small";
  position?: string;
  slug?: string;
}

/**
 * Server-side BadgeSymbol component that loads material data
 */
export async function ServerBadgeSymbol({
  materialSlug,
  variant,
  position,
  slug,
}: ServerBadgeSymbolProps) {
  // Load material data if a slug is provided
  let frontmatter: ArticleFrontmatter | null = null;
  
  if (materialSlug) {
    frontmatter = await getMaterialFrontmatter(materialSlug);
  }
  
  return (
    <BadgeSymbol
      frontmatter={frontmatter || undefined}
      variant={variant}
      position={position}
      slug={slug || materialSlug}
    />
  );
}
