/**
 * @component SectionContainerDefault
 * @variant Default - No padding or background color
 * @purpose Lightweight section container for page-width components
 * @usage For components that manage their own spacing like RelatedMaterials, CardGrids, etc.
 * 
 * @example
 * <SectionContainerDefault 
 *   title="Related Ceramic › Oxide Materials"
 *   icon={getSectionIcon('related-materials')}
 *   actionText="Show all"
 *   actionUrl="/search?q=ceramic"
 * >
 *   <CardGridSSR slugs={relatedSlugs} />
 * </SectionContainerDefault>
 */
import React from 'react';
import { SectionContainer, SectionContainerBaseProps } from './SectionContainer';

export type SectionContainerDefaultProps = SectionContainerBaseProps;

export function SectionContainerDefault(props: SectionContainerDefaultProps) {
  return (
    <SectionContainer
      {...props}
      variant="default"
    />
  );
}

export default SectionContainerDefault;
