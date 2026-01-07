/**
 * @file sectionIcons.tsx
 * @purpose Centralized icon configuration for SectionContainer components
 * @pattern Maps section types to appropriate Feather icons with consistent styling
 * @usage Import getSectionIcon() and pass section type to automatically get styled icon
 * 
 * @example
 * import { getSectionIcon } from '@/app/config/sectionIcons';
 * 
 * <SectionContainer 
 *   title="Related Materials"
 *   icon={getSectionIcon('related-materials')}
 * />
 */

import {
  LayersIcon,
  DatabaseIcon,
  SettingsIcon,
  FileTextIcon,
  ShieldIcon,
  InfoIcon,
  TrendingUpIcon,
  BarChartIcon,
  AlertCircleIcon,
  PackageIcon,
  ZapIcon,
  CodeIcon,
  BookIcon,
  ToolIcon,
} from '@/app/components/Buttons/ButtonIcons';

/**
 * Standard icon size and color for section headers
 * Orange color for brand consistency
 */
const SECTION_ICON_CLASS = "w-5 h-5 text-orange-500";

/**
 * Section type definitions
 * Maps semantic section types to icon components
 */
export type SectionType = 
  | 'related-materials'
  | 'material-properties'
  | 'machine-settings'
  | 'dataset'
  | 'safety'
  | 'faq'
  | 'comparison'
  | 'effectiveness'
  | 'regulatory'
  | 'research'
  | 'technical'
  | 'overview'
  | 'warning'
  | 'expert-qa'
  | 'diagnostic'
  | 'citations'
  | 'default';

/**
 * Icon mapping configuration
 * Each section type maps to an appropriate Feather icon
 */
const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  'related-materials': <LayersIcon className={SECTION_ICON_CLASS} />,
  'material-properties': <PackageIcon className={SECTION_ICON_CLASS} />,
  'machine-settings': <SettingsIcon className={SECTION_ICON_CLASS} />,
  'dataset': <DatabaseIcon className={SECTION_ICON_CLASS} />,
  'safety': <ShieldIcon className={SECTION_ICON_CLASS} />,
  'faq': <InfoIcon className={SECTION_ICON_CLASS} />,
  'comparison': <BarChartIcon className={SECTION_ICON_CLASS} />,
  'effectiveness': <TrendingUpIcon className={SECTION_ICON_CLASS} />,
  'regulatory': <FileTextIcon className={SECTION_ICON_CLASS} />,
  'research': <ZapIcon className={SECTION_ICON_CLASS} />,
  'technical': <CodeIcon className={SECTION_ICON_CLASS} />,
  'overview': <InfoIcon className={SECTION_ICON_CLASS} />,
  'warning': <AlertCircleIcon className={SECTION_ICON_CLASS} />,
  'expert-qa': <InfoIcon className={SECTION_ICON_CLASS} />,
  'diagnostic': <ToolIcon className={SECTION_ICON_CLASS} />,
  'citations': <BookIcon className={SECTION_ICON_CLASS} />,
  'default': <InfoIcon className={SECTION_ICON_CLASS} />,
};

/**
 * Get icon for a section type
 * Returns a styled icon component ready for SectionContainer
 * 
 * @param type - The semantic section type
 * @returns React node with icon component or null if type not found
 * 
 * @example
 * <SectionContainer 
 *   title="Machine Settings"
 *   icon={getSectionIcon('machine-settings')}
 * />
 */
export function getSectionIcon(type: SectionType): React.ReactNode {
  return SECTION_ICONS[type] || null;
}

/**
 * Get custom icon with section styling
 * Use when you need a specific icon not in the standard mapping
 * 
 * @param IconComponent - The icon component from ButtonIcons
 * @returns React node with consistent section styling
 * 
 * @example
 * <SectionContainer 
 *   title="Custom Section"
 *   icon={getCustomSectionIcon(CalendarIcon)}
 * />
 */
export function getCustomSectionIcon(
  IconComponent: React.ComponentType<{ className?: string }>
): React.ReactNode {
  return <IconComponent className={SECTION_ICON_CLASS} />;
}
