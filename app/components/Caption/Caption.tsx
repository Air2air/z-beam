// app/components/Caption/Caption.tsx
import './styles.scss';

interface CaptionProps {
  content: string;
  config?: {
    style?: 'default' | 'large' | 'small';
    alignment?: 'left' | 'center' | 'right';
  };
}

export function Caption({ content, config }: CaptionProps) {
  if (!content) return null;
  
  const {
    style = 'default',
    alignment = 'left'
  } = config || {};
  
  const styleClass = style !== 'default' ? `caption-${style}` : '';
  const alignClass = alignment !== 'left' ? `text-${alignment}` : '';
  
  return (
    <div className={`caption-container ${styleClass} ${alignClass}`}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}