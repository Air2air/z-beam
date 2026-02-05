/**
 * @file sectionIcons.tsx
 * @purpose Centralized icon configuration for SectionContainer components
 * @pattern Maps section types to appropriate Lucide React icons with consistent styling
 * @usage Import getSectionIcon() and pass section type or Lucide icon name to automatically get styled icon
 * 
 * @example
 * import { getSectionIcon } from '@/app/config/sectionIcons';
 * 
 * <SectionContainer 
 *   title="Related Materials"
 *   icon={getSectionIcon('related-materials')}
 * />
 */

import React from 'react';
import {
  Layers,
  Database,
  Settings,
  FileText,
  Shield,
  Info,
  TrendingUp,
  BarChart,
  AlertCircle,
  Package,
  Zap,
  Code,
  Book,
  Droplet,
  Building,
  HelpCircle,
  Briefcase,
  Box,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Thermometer,
  Atom,
  Cloud,
  EyeOff,
  Flame,
  FlaskConical,
  Wind,
  Tag,
  Eye,
  HeartPulse,
  Gauge,
  HardHat,
  Ambulance,
  Warehouse,
  FileCheck2,
  Search,
  Globe,
  Activity,
  Link,
  Camera,
  Microscope,
} from 'lucide-react';

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
 * Each section type maps to an appropriate Lucide React icon
 */
const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  'related-materials': <Layers className={SECTION_ICON_CLASS} />,
  'material-properties': <Package className={SECTION_ICON_CLASS} />,
  'machine-settings': <Settings className={SECTION_ICON_CLASS} />,
  'dataset': <Database className={SECTION_ICON_CLASS} />,
  'safety': <Shield className={SECTION_ICON_CLASS} />,
  'faq': <Info className={SECTION_ICON_CLASS} />,
  'comparison': <BarChart className={SECTION_ICON_CLASS} />,
  'effectiveness': <TrendingUp className={SECTION_ICON_CLASS} />,
  'regulatory': <FileText className={SECTION_ICON_CLASS} />,
  'research': <Zap className={SECTION_ICON_CLASS} />,
  'technical': <Code className={SECTION_ICON_CLASS} />,
  'overview': <Info className={SECTION_ICON_CLASS} />,
  'warning': <AlertCircle className={SECTION_ICON_CLASS} />,
  'expert-qa': <Info className={SECTION_ICON_CLASS} />,
  'diagnostic': <Wrench className={SECTION_ICON_CLASS} />,
  'citations': <Book className={SECTION_ICON_CLASS} />,
  'default': <Info className={SECTION_ICON_CLASS} />,
};

/**
 * Get icon for a section type
 * Returns a styled icon component ready for SectionContainer
 * Supports both semantic names and Lucide icon names from frontmatter
 * 
 * @param type - The semantic section type or Lucide icon name
 * @returns React node with icon component or null if type not found
 * 
 * @example
 * <SectionContainer 
 *   title="Machine Settings"
 *   icon={getSectionIcon('machine-settings')}
 * />
 */
export function getSectionIcon(type: SectionType | string): React.ReactNode {
  // First check semantic SECTION_ICONS mapping
  if (type in SECTION_ICONS) {
    return SECTION_ICONS[type as SectionType];
  }
  
  // Map Lucide icon names from frontmatter to icon components
  const lucideIconMap: Record<string, React.ReactNode> = {
    'wrench': <Wrench className={SECTION_ICON_CLASS} />,
    'zap': <Zap className={SECTION_ICON_CLASS} />,
    'layers': <Layers className={SECTION_ICON_CLASS} />,
    'thermometer': <Thermometer className={SECTION_ICON_CLASS} />,
    'flask': <Atom className={SECTION_ICON_CLASS} />,
    'tag': <Tag className={SECTION_ICON_CLASS} />,
    'file-text': <FileText className={SECTION_ICON_CLASS} />,
    'eye': <Eye className={SECTION_ICON_CLASS} />,
    'heart-pulse': <HeartPulse className={SECTION_ICON_CLASS} />,
    'gauge': <Gauge className={SECTION_ICON_CLASS} />,
    'hard-hat': <HardHat className={SECTION_ICON_CLASS} />,
    'ambulance': <Ambulance className={SECTION_ICON_CLASS} />,
    'warehouse': <Warehouse className={SECTION_ICON_CLASS} />,
    'shield-check': <ShieldCheck className={SECTION_ICON_CLASS} />,
    'cloud': <Cloud className={SECTION_ICON_CLASS} />,
    'eye-off': <EyeOff className={SECTION_ICON_CLASS} />,
    'flame': <Flame className={SECTION_ICON_CLASS} />,
    'flask-conical': <FlaskConical className={SECTION_ICON_CLASS} />,
    'wind': <Wind className={SECTION_ICON_CLASS} />,
    'file-check-2': <FileCheck2 className={SECTION_ICON_CLASS} />,
    'briefcase': <Briefcase className={SECTION_ICON_CLASS} />,
    'alert-triangle': <AlertTriangle className={SECTION_ICON_CLASS} />,
    'search': <Search className={SECTION_ICON_CLASS} />,
    'shield': <Shield className={SECTION_ICON_CLASS} />,
    'globe': <Globe className={SECTION_ICON_CLASS} />,
    'help-circle': <HelpCircle className={SECTION_ICON_CLASS} />,
    'activity': <Activity className={SECTION_ICON_CLASS} />,
    'droplet': <Droplet className={SECTION_ICON_CLASS} />,
    'box': <Box className={SECTION_ICON_CLASS} />,
    'cube': <Box className={SECTION_ICON_CLASS} />,
    'link': <Link className={SECTION_ICON_CLASS} />,
    'atom': <Atom className={SECTION_ICON_CLASS} />,
    'camera': <Camera className={SECTION_ICON_CLASS} />,
    'building': <Building className={SECTION_ICON_CLASS} />,
    'alert-circle': <AlertCircle className={SECTION_ICON_CLASS} />,
    'info': <Info className={SECTION_ICON_CLASS} />,
    'database': <Database className={SECTION_ICON_CLASS} />,
    'settings': <Settings className={SECTION_ICON_CLASS} />,
    'trending-up': <TrendingUp className={SECTION_ICON_CLASS} />,
    'bar-chart': <BarChart className={SECTION_ICON_CLASS} />,
    'package': <Package className={SECTION_ICON_CLASS} />,
    'code': <Code className={SECTION_ICON_CLASS} />,
    'book': <Book className={SECTION_ICON_CLASS} />,
    'tool': <Wrench className={SECTION_ICON_CLASS} />,
    'microscope': <Microscope className={SECTION_ICON_CLASS} />,
  };
  
  return lucideIconMap[type] || null;
}

/**
 * Get custom icon with section styling
 * Use when you need a specific icon not in the standard mapping
 * 
 * @param IconComponent - The icon component from lucide-react
 * @returns React node with consistent section styling
 * 
 * @example
 * import { Calendar } from 'lucide-react';
 * <SectionContainer 
 *   title="Custom Section"
 *   icon={getCustomSectionIcon(Calendar)}
 * />
 */
export function getCustomSectionIcon(
  IconComponent: React.ComponentType<{ className?: string }>
): React.ReactNode {
  return <IconComponent className={SECTION_ICON_CLASS} />;
}
