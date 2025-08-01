// app/components/Bullets/Bullets.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import './styles.css';


interface BulletsProps {
  content: string;
  config?: {
    className?: string;
  };
}

export function Bullets({ content, config }: BulletsProps) {
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  return (
    <div className={`bullets-section ${className}`}>
      <MarkdownRenderer 
        content={content}
        className="bullets-container"
        prose={true}
        convertMarkdown={true}
      />
    </div>
  );
}

