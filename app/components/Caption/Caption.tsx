// app/components/Caption/Caption.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import Image from 'next/image';
import './styles.css';

interface CaptionProps {
  content: string;
  image?: string;
  frontmatter?: any; // Frontmatter contains all image path information
  config?: {
    className?: string;
  };
}

export function Caption({ content, image, frontmatter, config }: CaptionProps) {
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  // Determine image source, prioritizing frontmatter
  let imageSource = image;
  
  if (!imageSource && frontmatter?.images?.closeup?.url) {
    // Use the closeup image URL from frontmatter
    imageSource = frontmatter.images.closeup.url;
  }
  
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