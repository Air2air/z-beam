// app/components/Bullets/BulletsConfig.ts
export interface BulletsConfig {
  style?: 'bulleted' | 'numbered';
  maxItems?: number;
  showIcons?: boolean;
}

export const DEFAULT_BULLETS_CONFIG: BulletsConfig = {
  style: 'bulleted',
  maxItems: 10,
  showIcons: false,
};