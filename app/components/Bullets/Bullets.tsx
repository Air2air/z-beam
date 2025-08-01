// app/components/Bullets/Bullets.tsx
// import './bullets.css';


interface BulletsProps {
  content: string;
  config?: {
    style?: 'bulleted' | 'numbered';
  };
}

export function Bullets({ content, config }: BulletsProps) {
  if (!content) return null;
  
  const style = config?.style || 'bulleted';
  const styleClass = style === 'numbered' ? 'numbered-style' : 'bulleted-style';
  
  return (
    <div className={`bullets-section ${styleClass}`}>
      <div 
        className="bullets-container prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

