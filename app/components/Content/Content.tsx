// app/components/Content/Content.tsx
import './styles.css';

interface ContentProps {
  content: string;
  config?: {
    wrapHeadings?: boolean;
    maxWidth?: string;
    enhanceTables?: boolean;
  };
}

export function Content({ content, config }: ContentProps) {
  if (!content) return null;
  
  const {
    wrapHeadings = true,
    maxWidth = 'max-w-3xl'
  } = config || {};
  
  return (
    <div className={`content-section ${maxWidth}`}>
      <div 
        className={`content-container prose dark:prose-invert ${wrapHeadings ? 'wrap-headings' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}