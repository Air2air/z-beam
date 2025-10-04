// app/components/Caption/MetadataDisplay.tsx
"use client";

import { FrontmatterType } from '@/types';
import { SITE_CONFIG } from '../../utils/constants';

interface MetadataType {
  generated?: string;
  format?: string;
  version?: string;
}

interface MetadataDisplayProps {
  metadata?: MetadataType;
  material?: string;
  show: boolean;
  frontmatter?: FrontmatterType;
}

export function MetadataDisplay({ metadata, material, show, frontmatter }: MetadataDisplayProps) {
  if (!show || !metadata) return null;

  return (
    <div 
      className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500"
      itemScope
      itemType={`${SITE_CONFIG.schema.context}/DataCatalog`}
      role="complementary"
      aria-label="Analysis metadata"
    >
      <div className="space-y-1">
        {material && (
          <div itemProp="material">
            <span className="text-gray-400">Material:</span> {material}
          </div>
        )}
        {metadata.format && metadata.version && (
          <div itemProp="encodingFormat">
            <span className="text-gray-400">Format:</span> {metadata.format} v{metadata.version}
          </div>
        )}
        {metadata.generated && (
          <div itemProp="dateCreated">
            <span className="text-gray-400">Generated:</span> {new Date(metadata.generated).toLocaleString()}
          </div>
        )}
        {frontmatter?.author && (
          <div itemProp="creator">
            <span className="text-gray-400">Author:</span> {
              typeof frontmatter.author === 'string' 
                ? frontmatter.author 
                : frontmatter.author.name
            }
          </div>
        )}
      </div>
      
      {/* Enhanced SEO metadata */}
      <meta itemProp="name" content="Laser Cleaning Analysis Dataset" />
      <meta itemProp="description" content={`Scientific analysis data for ${material} laser cleaning process`} />
      <meta itemProp="keywords" content="laser cleaning, materials analysis, surface processing" />
    </div>
  );
}
