/**
 * LinkageGridGroup Component Tests
 * Tests the grouping component for multiple LinkageGrid components
 */

import { render, screen } from '@testing-library/react';
import LinkageGridGroup from '@/app/components/LinkageGridGroup/LinkageGridGroup';

// Mock LinkageGrid component
jest.mock('@/app/components/LinkageGrid/LinkageGrid', () => ({
  __esModule: true,
  default: ({ data, type, title, description }: any) => {
    if (!data || data.length === 0) return null;
    return (
      <div 
        data-testid="linkage-grid" 
        data-type={type}
        data-title={title}
      >
        <h4>{title}</h4>
        {description && <p>{description}</p>}
        <div>Count: {data.length}</div>
      </div>
    );
  },
}));

describe('LinkageGridGroup', () => {
  const mockGrids = [
    {
      data: [{ id: 1 }, { id: 2 }],
      type: 'materials' as const,
      title: 'Related Materials',
      description: 'Materials that work with this setting',
    },
    {
      data: [{ id: 3 }],
      type: 'contaminants' as const,
      title: 'Effective Against',
      description: 'Contaminants this setting removes',
    },
    {
      data: [{ id: 4 }, { id: 5 }, { id: 6 }],
      type: 'settings' as const,
      title: 'Related Settings',
    },
  ];

  it('renders group title and description when provided', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        description="Explore related materials, contaminants, and settings"
        grids={mockGrids}
      />
    );

    expect(screen.getByText('Related Content')).toBeInTheDocument();
    expect(screen.getByText('Explore related materials, contaminants, and settings')).toBeInTheDocument();
  });

  it('renders all non-empty grids', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids).toHaveLength(3);
  });

  it('filters out grids with empty data', () => {
    const gridsWithEmpty = [
      ...mockGrids,
      {
        data: [],
        type: 'materials' as const,
        title: 'Empty Grid',
      },
    ];

    render(
      <LinkageGridGroup
        title="Related Content"
        grids={gridsWithEmpty}
      />
    );

    // Should only render 3 grids (excluding the empty one)
    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids).toHaveLength(3);
    expect(screen.queryByText('Empty Grid')).not.toBeInTheDocument();
  });

  it('filters out grids with undefined data', () => {
    const gridsWithUndefined = [
      ...mockGrids,
      {
        data: undefined,
        type: 'materials' as const,
        title: 'Undefined Grid',
      },
    ];

    render(
      <LinkageGridGroup
        title="Related Content"
        grids={gridsWithUndefined}
      />
    );

    // Should only render 3 grids (excluding the undefined one)
    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids).toHaveLength(3);
  });

  it('renders grid titles correctly', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    expect(screen.getByText('Related Materials')).toBeInTheDocument();
    expect(screen.getByText('Effective Against')).toBeInTheDocument();
    expect(screen.getByText('Related Settings')).toBeInTheDocument();
  });

  it('renders grid descriptions when provided', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    expect(screen.getByText('Materials that work with this setting')).toBeInTheDocument();
    expect(screen.getByText('Contaminants this setting removes')).toBeInTheDocument();
  });

  it('renders without group header when title is not provided', () => {
    render(<LinkageGridGroup grids={mockGrids} />);

    // Should render grids but no heading element
    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids).toHaveLength(3);
    
    // No h2 heading should exist
    const headings = document.querySelectorAll('h2');
    expect(headings).toHaveLength(0);
  });

  it('renders without description when not provided', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    // Title should be there
    expect(screen.getByText('Related Content')).toBeInTheDocument();
    
    // But the group description paragraph should not
    const container = screen.getByText('Related Content').parentElement;
    expect(container?.querySelector('p.text-zinc-600')).not.toBeInTheDocument();
  });

  it('renders nothing when all grids are empty', () => {
    const emptyGrids = [
      {
        data: [],
        type: 'materials' as const,
        title: 'Materials',
      },
      {
        data: undefined,
        type: 'contaminants' as const,
        title: 'Contaminants',
      },
    ];

    const { container } = render(
      <LinkageGridGroup
        title="Related Content"
        grids={emptyGrids}
      />
    );

    expect(screen.queryByTestId('linkage-grid')).not.toBeInTheDocument();
  });

  it('maintains grid order', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids[0]).toHaveAttribute('data-title', 'Related Materials');
    expect(grids[1]).toHaveAttribute('data-title', 'Effective Against');
    expect(grids[2]).toHaveAttribute('data-title', 'Related Settings');
  });

  it('passes correct type to each grid', () => {
    render(
      <LinkageGridGroup
        title="Related Content"
        grids={mockGrids}
      />
    );

    const grids = screen.getAllByTestId('linkage-grid');
    expect(grids[0]).toHaveAttribute('data-type', 'materials');
    expect(grids[1]).toHaveAttribute('data-type', 'contaminants');
    expect(grids[2]).toHaveAttribute('data-type', 'settings');
  });
});
