// app/components/Caption/Caption.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css'; // Change to .css from .scss

interface CaptionProps {
  content: string;
  config?: {
    className?: string; // Just keep a single className config
  };
}

export function Caption({ content, config }: CaptionProps) {
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  return (
    <div className={`caption-container ${className}`}>
      <MarkdownRenderer 
        content={content}
        prose={false}
        className="caption-content"
      />
    </div>
  );
}