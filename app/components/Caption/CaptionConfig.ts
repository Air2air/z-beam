// app/components/Caption/CaptionConfig.ts
export interface CaptionConfig {
  style?: 'default' | 'italic' | 'bold' | 'highlight';
  size?: 'small' | 'default' | 'large';
  alignment?: 'left' | 'center' | 'right';
  maxLength?: number;
  showBorder?: boolean;
  position?: 'above' | 'below' | 'overlay';
}

export const DEFAULT_CAPTION_CONFIG: Required<CaptionConfig> = {
  style: 'default',
  size: 'default',
  alignment: 'left',
  maxLength: 300,
  showBorder: false,
  position: 'below',
};