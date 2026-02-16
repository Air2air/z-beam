// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LinkageSection } from '@/app/components/LinkageSection/LinkageSection';
import { mapMaterialToGrid, type RelatedMaterial } from '@/app/utils/gridMappers';

jest.mock('@/app/components/CardGrid/CardGrid', () => ({
  CardGrid: ({ items }: { items: any[] }) => (
    <div data-testid="card-grid">
      {items?.map((item, index) => (
        <div key={index} data-testid="grid-item">
          <a href={item.href}>{item.metadata?.title || 'No title'}</a>
          {item.metadata?.subject && <p>{item.metadata.subject}</p>}
        </div>
      ))}
    </div>
  ),
}));

describe('LinkageSection Component', () => {
  it('should render using the shared relationship implementation', () => {
    const mockData: RelatedMaterial[] = [
      {
        title: 'Aluminum',
        url: '/materials/aluminum',
        material_type: 'Metal',
        micro: 'Lightweight metal',
      },
    ];

    render(
      <LinkageSection
        data={mockData}
        title="Related Materials"
        description="Materials commonly associated with this entity"
        mapper={mapMaterialToGrid}
      />
    );

    expect(screen.getByText('Related Materials')).toBeInTheDocument();
    expect(screen.getByText('Materials commonly associated with this entity')).toBeInTheDocument();
    expect(screen.getByText('Aluminum')).toBeInTheDocument();
    expect(screen.getByText('Lightweight metal')).toBeInTheDocument();
  });

  it('should return null when no data is provided', () => {
    const { container } = render(
      <LinkageSection
        data={undefined}
        title="Related Materials"
        mapper={mapMaterialToGrid}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
