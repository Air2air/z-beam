// app/components/Caption/Caption.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import Image from 'next/image';
import './styles.css';

interface CaptionProps {
  content: string;
  image?: string;
  materialSlug?: string;
  slug?: string;  // Adding slug parameter for the new path format
  config?: {
    className?: string;
  };
}

export function Caption({ content, image, materialSlug, slug, config }: CaptionProps) {
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  // Determine image source with the new format
  const imageSource = image || (slug ? `/images/${slug}-closeup.jpg` : undefined);
  
  return (
    <div className={`caption-container ${className}`}>
      {imageSource && (
        <div className="caption-image-wrapper">
          <Image
            src={imageSource}
            alt="Detail closeup"
            width={800}
            height={450}
            className="caption-image"
          />
        </div>
      )}
      
      <div className="caption-text p-8">
        <MarkdownRenderer 
          content={content}
        />
      </div>
    </div>
  );
}