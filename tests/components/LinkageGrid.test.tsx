/**
 * LinkageGrid Component Tests
 * Tests the simplified wrapper for LinkageSection + DataGrid pattern
 */

import { render, screen } from '@testing-library/react';
import LinkageGrid from '@/app/components/LinkageGrid/LinkageGrid';

// Mock child components
jest.mock('@/app/components/LinkageSection/LinkageSection', () => ({
  __esModule: true,
  default: ({ title, description, type, children }: any) => (
    <div data-testid="linkage-section" data-title={title} data-type={type}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}));

jest.mock('@/app/components/DataGrid/DataGrid', () => ({
  DataGrid: ({ data, mapper, sorter, variant }: any) => (
    <div 
      data-testid="data-grid" 
      data-count={data?.length || 0}
      data-variant={variant}
    >
      DataGrid with {data?.length || 0} items
    </div>
  ),
}));

describe('LinkageGrid', () => {
  const mockMaterialData = [
    { material: 'Aluminum', frequency: 'Very Common' },
    { material: 'Steel', frequency: 'Common' },
  ];

  const mockContaminantData = [
    { contaminant: 'Rust', severity: 'High' },
    { contaminant: 'Paint', severity: 'Medium' },
  ];

  const mockSettingsData = [
    { setting: 'Power', value: '100W' },
    { setting: 'Speed', value: '500mm/s' },
  ];

  it('renders LinkageSection with correct title and description', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Related Materials"
        description="Materials compatible with this setting"
      />
    );

    expect(screen.getByTestId('linkage-section')).toBeInTheDocument();
    expect(screen.getByText('Related Materials')).toBeInTheDocument();
    expect(screen.getByText('Materials compatible with this setting')).toBeInTheDocument();
  });

  it('renders DataGrid with materials data', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Related Materials"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toBeInTheDocument();
    expect(dataGrid).toHaveAttribute('data-count', '2');
    expect(dataGrid).toHaveAttribute('data-variant', 'domain-linkage');
  });

  it('renders DataGrid with contaminants data', () => {
    render(
      <LinkageGrid
        data={mockContaminantData}
        type="contaminants"
        title="Related Contaminants"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toBeInTheDocument();
    expect(dataGrid).toHaveAttribute('data-count', '2');
  });

  it('renders DataGrid with settings data', () => {
    render(
      <LinkageGrid
        data={mockSettingsData}
        type="settings"
        title="Recommended Settings"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toBeInTheDocument();
    expect(dataGrid).toHaveAttribute('data-count', '2');
  });

  it('uses frequency sort by default for materials and contaminants', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Materials"
      />
    );

    // Component should use sortByFrequency by default
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('overrides default sort when sortBy is provided', () => {
    render(
      <LinkageGrid
        data={mockContaminantData}
        type="contaminants"
        title="Contaminants"
        sortBy="severity"
      />
    );

    // Component should use sortBySeverity
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  it('accepts custom variant', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Materials"
        variant="compact"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toHaveAttribute('data-variant', 'compact');
  });

  it('handles empty data array', () => {
    render(
      <LinkageGrid
        data={[]}
        type="materials"
        title="Materials"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toHaveAttribute('data-count', '0');
  });

  it('handles undefined data', () => {
    render(
      <LinkageGrid
        data={undefined}
        type="materials"
        title="Materials"
      />
    );

    const dataGrid = screen.getByTestId('data-grid');
    expect(dataGrid).toHaveAttribute('data-count', '0');
  });

  it('passes type to LinkageSection', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Materials"
      />
    );

    const linkageSection = screen.getByTestId('linkage-section');
    expect(linkageSection).toHaveAttribute('data-type', 'materials');
  });

  it('renders without description when not provided', () => {
    render(
      <LinkageGrid
        data={mockMaterialData}
        type="materials"
        title="Materials"
      />
    );

    expect(screen.getByText('Materials')).toBeInTheDocument();
    // Description paragraph should not exist
    const linkageSection = screen.getByTestId('linkage-section');
    expect(linkageSection.querySelector('p')).not.toBeInTheDocument();
  });
});
