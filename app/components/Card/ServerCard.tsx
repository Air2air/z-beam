// app/components/Card/ServerCard.tsx
import { getMaterialFrontmatter, getMaterialImagePath } from '@/app/utils/serverUtils';
import { Card } from './Card';

interface ServerCardProps {
  href: string;
  title: string;
  name?: string;
  description?: string;
  imageAlt?: string;
  materialSlug?: string;
  tags?: string[];
  className?: string;
  height?: string;
}

/**
 * Server-side Card component that loads material data
 */
export async function ServerCard({ 
  href, 
  title, 
  name, 
  description, 
  imageAlt,
  materialSlug,
  tags,
  className,
  height
}: ServerCardProps) {
  // Load material data if a slug is provided
  let imageUrl: string | undefined = undefined;
  let metadata: any = null;
  
  if (materialSlug) {
    imageUrl = await getMaterialImagePath(materialSlug);
    metadata = await getMaterialFrontmatter(materialSlug);
  }
  
  return (
    <Card
      href={href}
      title={title}
      name={name}
      description={description}
      imageUrl={imageUrl}
      imageAlt={imageAlt || title}
      tags={tags}
      metadata={metadata}
      className={className}
      height={height}
    />
  );
}
