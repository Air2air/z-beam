// app/components/Content/Content.tsx
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { ContentProps } from '@/types';

// ContentProps now imported from centralized types - enhanced with config

export function Content({ content, config }: ContentProps) {
  if (!content) return null;
  
  const {
    wrapHeadings = true,
    maxWidth = 'max-w-none'
  } = config || {};
  
  return (
    <div className={`${maxWidth}`}>
      <div className={wrapHeadings ? 'wrap-headings' : ''}>
        <MarkdownRenderer 
          content={content}
          convertMarkdown={true}
        />
      </div>
    </div>
  );
}