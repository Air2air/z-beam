// app/components/Caption/Caption.tsx
import { CaptionConfig, DEFAULT_CAPTION_CONFIG } from './CaptionConfig';

interface CaptionProps {
  content: string;
  config?: CaptionConfig;
}

export function Caption({ content, config = {} }: CaptionProps) {
  const finalConfig = { ...DEFAULT_CAPTION_CONFIG, ...config };
  
  if (!content) {
    return null;
  }
  
  return (
    <div className={`
      caption-section
      ${finalConfig.style}
      ${finalConfig.size}
      ${finalConfig.alignment}
    `}>
      <div 
        className={`
          caption-container
          ${finalConfig.showBorder ? 'with-border' : ''}
        `}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export { loadCaptionData } from './CaptionLoader';
export type { CaptionConfig } from './CaptionConfig';