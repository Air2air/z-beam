/**
 * @component SectionContainerDark
 * @variant Dark - With padding and dark background color
 * @purpose Rich section container for page-width components that need visual emphasis
 * @usage For components like ParameterRelationships, interactive visualizations, etc.
 * 
 * @example
 * <SectionContainerDark 
 *   title="Parameter Relationships"
 *   icon={getSectionIcon('technical')}
 *   actionText="Learn more"
 *   actionUrl="/docs/parameters"
 * >
 *   <NetworkGraph parameters={params} />
 * </SectionContainerDark>
 */
import React from 'react';
import { SectionContainer, SectionContainerBaseProps } from './SectionContainer';

export type SectionContainerDarkProps = SectionContainerBaseProps;

export function SectionContainerDark(props: SectionContainerDarkProps) {
  return (
    <SectionContainer
      {...props}
      variant="dark"
    />
  );
}

export default SectionContainerDark;
