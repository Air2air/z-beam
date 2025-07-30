// app/components/Bullets/Bullets.tsx
import { BulletsConfig, DEFAULT_BULLETS_CONFIG } from './BulletsConfig';

interface BulletsProps {
  content: string;
  config?: BulletsConfig;
}

export function Bullets({ content, config }: BulletsProps) {
  if (!content) {
    return null;
  }

  // Merge with defaults
  const finalConfig = {
    style: config?.style || DEFAULT_BULLETS_CONFIG.style,
    maxItems: config?.maxItems || DEFAULT_BULLETS_CONFIG.maxItems,
    showIcons: config?.showIcons !== undefined ? config.showIcons : DEFAULT_BULLETS_CONFIG.showIcons,
  };
  
  return (
    <div className="bullets-section">
      <div 
        className="bullets-container"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export { loadBulletsData } from './BulletsLoader';
export type { BulletsConfig } from './BulletsConfig';