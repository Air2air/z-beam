// app/components/Content/Content.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
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
    maxWidth = 'max-w-none'
  } = config || {};
  
  return (
    <div className={`content-section ${maxWidth}`}>
      <div className={`content-container prose dark:prose-invert ${wrapHeadings ? 'wrap-headings' : ''}`}>
        <MarkdownRenderer 
          content={content}
          convertMarkdown={true}
        />
      </div>
    </div>
  );
}