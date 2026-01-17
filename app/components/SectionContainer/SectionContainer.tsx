import React from 'react';
import { Button } from '../Button';
import { BaseSection } from '../BaseSection/BaseSection';
import type { SectionContainerProps } from '@/types/centralized';
import { getSectionIcon } from '@/app/config/sectionIcons';

/**
 * SectionContainer - Legacy wrapper component
 * @deprecated Use BaseSection directly for new components
 * 
 * This component is maintained for backward compatibility with existing code.
 * It now delegates to BaseSection internally while preserving the original API.
 * 
 * For new development, use BaseSection instead which provides:
 * - More consistent API
 * - Better variant support
 * - Enhanced spacing options
 * - Cleaner prop naming
 */
export function SectionContainer({
  title,
  description,
  bgColor = 'transparent',
  horizPadding = false,
  radius = false,
  icon,
  action,
  actionText,
  actionUrl,
  className = '',
  variant = 'default',
  children,
}: SectionContainerProps) {
  // Convert string icon names to ReactNode
  const iconNode = typeof icon === 'string' ? getSectionIcon(icon) : icon;
  
  // Support legacy actionText/actionUrl props by creating Button
  const finalAction = action || (actionText && actionUrl ? (
    <Button variant="primary" size="md" href={actionUrl} showIcon>
      {actionText}
    </Button>
  ) : undefined);
  
  // Map old variant to new BaseSection variant
  const baseSectionVariant = variant === 'dark' ? 'dark' : 'default';
  
  return (
    <BaseSection
      title={title}
      description={description}
      icon={iconNode}
      action={finalAction}
      variant={baseSectionVariant}
      bgColor={bgColor}
      horizPadding={horizPadding}
      radius={radius}
      spacing="tight"
      className={className}
    >
      {children}
    </BaseSection>
  );
}

export default SectionContainer;
