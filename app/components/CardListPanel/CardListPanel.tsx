/**
 * @component CardListPanel
 * @purpose Base component for rendering lists of items in a 2-column card grid
 * @dependencies BaseSection, @/types
 * @related RegulatoryStandards, IndustryApplicationsPanel
 * @complexity Low (base pattern for card list sections)
 * @aiContext Renders items in a responsive grid with consistent card styling.
 *           Uses BaseSection for consistent section rendering patterns.
 *           Extensions should override renderCard() for custom card content.
 */

import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import type { RelationshipSection } from '@/types';

export interface CardListItem {
  id: string;
  title?: string;
  name?: string;
  content?: string;
  description?: string;
  [key: string]: any;
}

export interface CardListPanelProps {
  items: CardListItem[];
  sectionMetadata?: RelationshipSection;
  className?: string;
  iconType?: string;
}

/**
 * Base CardListPanel component
 * Renders items in a 2-column responsive grid with card styling
 */
export function CardListPanel({
  items,
  sectionMetadata,
  className = '',
  iconType = 'default'
}: CardListPanelProps) {
  if (!items || items.length === 0) return null;

  return (
    <BaseSection
      section={sectionMetadata}
      className={className}
    >
      <ul className={`grid-2col ${GRID_GAP_RESPONSIVE} list-none`}>
        {items.map((item) => (
          <CardListItem key={item.id} item={item} />
        ))}
      </ul>
    </BaseSection>
  );
}

/**
 * Default card rendering for items
 * Can be overridden by extending components
 */
function CardListItem({ item }: { item: CardListItem }) {
  const displayTitle = item.title || item.name;
  const displayContent = item.content || item.description;

  return (
    <li className="card-background rounded-md p-3 md:p-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg text-secondary font-semibold mb-1">
        {displayTitle}
      </h3>
      {displayContent && (
        <p className="text-sm text-secondary mb-3">
          {displayContent}
        </p>
      )}
    </li>
  );
}

/**
 * Higher-order component for creating custom card list panels
 * Usage: const MyPanel = createCardListPanel(iconType, customRenderCard);
 */
export function createCardListPanel(
  iconType: string,
  renderCard?: (item: CardListItem, index: number) => React.ReactNode
) {
  return function CustomCardListPanel(props: CardListPanelProps) {
    const { items, sectionMetadata, className = '' } = props;
    
    if (!items || items.length === 0) return null;

    return (
      <BaseSection
        section={sectionMetadata}
        className={className}
      >
        <ul className={`grid-2col ${GRID_GAP_RESPONSIVE} list-none`}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderCard ? renderCard(item, index) : <CardListItem item={item} />}
            </React.Fragment>
          ))}
        </ul>
      </BaseSection>
    );
  };
}
