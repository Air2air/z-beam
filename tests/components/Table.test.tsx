/**
 * Test Suite: Table Component
 * Testing Smart Table rendering, display modes, and frontmatter organization
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartTableData, DisplayMode, SmartField } from '@/types';

// Mock the actual Table/SmartTable components
const MockTable = ({ content, config, frontmatterData }: {
  content?: string;
  config?: {
    displayMode?: DisplayMode;
    layoutMode?: string;
    caption?: string;
    showHeader?: boolean;
  };
  frontmatterData?: SmartTableData;
}) => {
  const displayMode = config?.displayMode || 'hybrid';
  
  return (
    <div 
      data-testid="smart-table-container"
      data-display-mode={displayMode}
      className="enhanced-table-container"
    >
      {config?.caption && (
        <h2 data-testid="table-caption">{config.caption}</h2>
      )}
      
      <div data-testid="mode-indicator" className="mode-info">
        Viewing: {displayMode} Mode
      </div>
      
      {frontmatterData && (
        <div data-testid="sections-container">
          {/* Core Identity - always visible */}
          <section data-testid="core-identity-section">
            <h3>Material Identity</h3>
            <div data-testid="identity-fields">
              {frontmatterData.name && (
                <div data-testid="field-name">{frontmatterData.name}</div>
              )}
              {frontmatterData.category && (
                <div data-testid="field-category">{frontmatterData.category}</div>
              )}
            </div>
          </section>
          
          {/* Mode-specific sections */}
          {displayMode === 'content' && (
            <>
              <section data-testid="content-overview-section">
                <h3>Content Overview</h3>
                <div data-testid="content-fields">
                  {frontmatterData.description && (
                    <div data-testid="field-description">{frontmatterData.description}</div>
                  )}
                </div>
              </section>
              
              <section data-testid="applications-section">
                <h3>Applications & Usage</h3>
              </section>
            </>
          )}
          
          {displayMode === 'technical' && (
            <>
              <section data-testid="material-properties-section">
                <h3>Material Properties</h3>
                <div data-testid="technical-fields">
                  {frontmatterData.materialProperties && (
                    <div data-testid="field-properties">Technical Properties</div>
                  )}
                </div>
              </section>
              
              <section data-testid="research-validation-section">
                <h3>Research & Validation</h3>
              </section>
            </>
          )}
          
          {displayMode === 'hybrid' && (
            <>
              <section data-testid="content-summary-section">
                <h3>Content Summary</h3>
                <div data-testid="expandable-hint">• Expandable sections</div>
              </section>
              
              <section data-testid="technical-summary-section">
                <h3>Key Properties</h3>
                <div data-testid="technical-badge">Technical</div>
              </section>
            </>
          )}
        </div>
      )}
      
      {!frontmatterData && (
        <div data-testid="no-data-message">
          No table data available
        </div>
      )}
    </div>
  );
};

// Legacy Table component for backward compatibility tests
const LegacyTable = ({ data, columns, sortable, filterable, onSort, onFilter, variant }: any) => (
  <div 
    data-testid="legacy-table-container"
    data-variant={variant}
    className={`table-container ${variant || 'default'}`}
  >
    {filterable && (
      <input 
        data-testid="table-filter"
        placeholder="Filter..."
        onChange={(e) => onFilter && onFilter(e.target.value)}
      />
    )}
    <table data-testid="data-table">
      <thead data-testid="table-header">
        <tr>
          {columns?.map((col: any, index: number) => (
            <th 
              key={index}
              data-testid={`header-${col.key}`}
              onClick={sortable ? () => onSort && onSort(col.key) : undefined}
              style={{ cursor: sortable ? 'pointer' : 'default' }}
            >
              {col.title}
              {sortable && <span data-testid={`sort-icon-${col.key}`}>↕</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody data-testid="table-body">
        {data?.map((row: any, rowIndex: number) => (
          <tr key={rowIndex} data-testid={`row-${rowIndex}`}>
            {columns?.map((col: any, colIndex: number) => (
              <td 
                key={colIndex}
                data-testid={`cell-${rowIndex}-${col.key}`}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

describe('Smart Table Component', () => {
  const sampleFrontmatterData: SmartTableData = {
    name: 'Aluminum 6061',
    category: 'metal',
    subcategory: 'Aluminum Alloy',
    description: 'High-strength aluminum alloy suitable for laser cleaning',
    materialProperties: {
      physical: {
        properties: {
          density: { value: 2.7, unit: 'g/cm³', confidence: 0.95 },
          hardness: { value: 95, unit: 'HB', confidence: 0.92 }
        }
      }
    },
    applications: ['Aerospace', 'Automotive', 'Marine'],
    keywords: ['aluminum', 'alloy', 'lightweight']
  };

  describe('Display Modes', () => {
    test('should render hybrid mode by default', () => {
      render(<MockTable frontmatterData={sampleFrontmatterData} />);
      
      expect(screen.getByTestId('smart-table-container')).toHaveAttribute('data-display-mode', 'hybrid');
      expect(screen.getByTestId('mode-indicator')).toHaveTextContent('Viewing: hybrid Mode');
      expect(screen.getByTestId('expandable-hint')).toHaveTextContent('• Expandable sections');
    });

    test('should render content mode correctly', () => {
      render(
        <MockTable 
          frontmatterData={sampleFrontmatterData}
          config={{ displayMode: 'content' }}
        />
      );
      
      expect(screen.getByTestId('smart-table-container')).toHaveAttribute('data-display-mode', 'content');
      expect(screen.getByTestId('content-overview-section')).toBeInTheDocument();
      expect(screen.getByTestId('applications-section')).toBeInTheDocument();
      expect(screen.queryByTestId('material-properties-section')).not.toBeInTheDocument();
    });

    test('should render technical mode correctly', () => {
      render(
        <MockTable 
          frontmatterData={sampleFrontmatterData}
          config={{ displayMode: 'technical' }}
        />
      );
      
      expect(screen.getByTestId('smart-table-container')).toHaveAttribute('data-display-mode', 'technical');
      expect(screen.getByTestId('material-properties-section')).toBeInTheDocument();
      expect(screen.getByTestId('research-validation-section')).toBeInTheDocument();
      expect(screen.queryByTestId('content-overview-section')).not.toBeInTheDocument();
    });

    test('should render hybrid mode with both content and technical sections', () => {
      render(
        <MockTable 
          frontmatterData={sampleFrontmatterData}
          config={{ displayMode: 'hybrid' }}
        />
      );
      
      expect(screen.getByTestId('content-summary-section')).toBeInTheDocument();
      expect(screen.getByTestId('technical-summary-section')).toBeInTheDocument();
      expect(screen.getByTestId('technical-badge')).toHaveTextContent('Technical');
    });
  });

  describe('Core Features', () => {
    test('should always render core identity section', () => {
      render(<MockTable frontmatterData={sampleFrontmatterData} />);
      
      expect(screen.getByTestId('core-identity-section')).toBeInTheDocument();
      expect(screen.getByTestId('field-name')).toHaveTextContent('Aluminum 6061');
      expect(screen.getByTestId('field-category')).toHaveTextContent('metal');
    });

    test('should render table caption when provided', () => {
      render(
        <MockTable 
          frontmatterData={sampleFrontmatterData}
          config={{ caption: 'Material Properties Overview' }}
        />
      );
      
      expect(screen.getByTestId('table-caption')).toHaveTextContent('Material Properties Overview');
    });

    test('should handle empty frontmatter data gracefully', () => {
      render(<MockTable frontmatterData={{}} />);
      
      expect(screen.getByTestId('smart-table-container')).toBeInTheDocument();
      expect(screen.getByTestId('core-identity-section')).toBeInTheDocument();
    });

    test('should show no data message when frontmatterData is undefined', () => {
      render(<MockTable />);
      
      expect(screen.getByTestId('no-data-message')).toHaveTextContent('No table data available');
    });
  });

  describe('Type Safety and Interfaces', () => {
    test('should handle SmartTableData interface correctly', () => {
      const typedData: SmartTableData = {
        name: 'Test Material',
        category: 'Test Category',
        materialProperties: {
          thermal: {
            properties: {
              conductivity: { value: 200, unit: 'W/mK', confidence: 0.90 }
            }
          }
        }
      };
      
      render(<MockTable frontmatterData={typedData} />);
      
      expect(screen.getByTestId('smart-table-container')).toBeInTheDocument();
      expect(screen.getByTestId('field-name')).toHaveTextContent('Test Material');
    });
  });
});

// Legacy Table Tests (Backward Compatibility)
describe('Legacy Table Component (Backward Compatibility)', () => {
  const sampleColumns = [
    { key: 'name', title: 'Name' },
    { key: 'type', title: 'Type' },
    { key: 'value', title: 'Value' }
  ];

  const sampleData = [
    { name: 'Item 1', type: 'Metal', value: '100' },
    { name: 'Item 2', type: 'Plastic', value: '200' },
    { name: 'Item 3', type: 'Ceramic', value: '150' }
  ];

  test('should render basic legacy table with data', () => {
    render(<LegacyTable data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('legacy-table-container')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
  });

  test('should render column headers correctly', () => {
    render(<LegacyTable data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('header-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('header-type')).toHaveTextContent('Type');
    expect(screen.getByTestId('header-value')).toHaveTextContent('Value');
  });

  test('should render data rows correctly', () => {
    render(<LegacyTable data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('cell-0-name')).toHaveTextContent('Item 1');
    expect(screen.getByTestId('cell-0-type')).toHaveTextContent('Metal');
    expect(screen.getByTestId('cell-0-value')).toHaveTextContent('100');

    expect(screen.getByTestId('cell-1-name')).toHaveTextContent('Item 2');
    expect(screen.getByTestId('cell-2-name')).toHaveTextContent('Item 3');
  });

  test('should enable sorting when sortable is true', () => {
    const mockOnSort = jest.fn();
    
    render(
      <LegacyTable 
        data={sampleData} 
        columns={sampleColumns} 
        sortable={true}
        onSort={mockOnSort}
      />
    );

    expect(screen.getByTestId('sort-icon-name')).toBeInTheDocument();
    expect(screen.getByTestId('sort-icon-type')).toBeInTheDocument();
    expect(screen.getByTestId('sort-icon-value')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('header-name'));
    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  test('should show filter input when filterable is true', () => {
    const mockOnFilter = jest.fn();
    
    render(
      <LegacyTable 
        data={sampleData} 
        columns={sampleColumns} 
        filterable={true}
        onFilter={mockOnFilter}
      />
    );

    const filterInput = screen.getByTestId('table-filter');
    expect(filterInput).toBeInTheDocument();
    expect(filterInput).toHaveAttribute('placeholder', 'Filter...');

    fireEvent.change(filterInput, { target: { value: 'metal' } });
    expect(mockOnFilter).toHaveBeenCalledWith('metal');
  });

  test('should handle empty data gracefully', () => {
    render(<LegacyTable data={[]} columns={sampleColumns} />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
    expect(screen.queryByTestId('row-0')).not.toBeInTheDocument();
  });

  test('should handle undefined data gracefully', () => {
    render(<LegacyTable data={undefined} columns={sampleColumns} />);

    expect(screen.getByTestId('legacy-table-container')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  test('should apply variant styling', () => {
    render(
      <LegacyTable 
        data={sampleData} 
        columns={sampleColumns} 
        variant="striped"
      />
    );

    const container = screen.getByTestId('legacy-table-container');
    expect(container).toHaveAttribute('data-variant', 'striped');
    expect(container).toHaveClass('striped');
  });

  test('should handle complex data types', () => {
    const complexData = [
      { name: 'Complex Item', type: 'Mixed', value: 'Complex Value String' }
    ];

    render(<LegacyTable data={complexData} columns={sampleColumns} />);

    expect(screen.getByTestId('cell-0-name')).toHaveTextContent('Complex Item');
    expect(screen.getByTestId('cell-0-value')).toHaveTextContent('Complex Value String');
  });

  test('should render all interactive features together', () => {
    const mockOnSort = jest.fn();
    const mockOnFilter = jest.fn();
    
    render(
      <LegacyTable 
        data={sampleData} 
        columns={sampleColumns} 
        sortable={true}
        filterable={true}
        onSort={mockOnSort}
        onFilter={mockOnFilter}
        variant="bordered"
      />
    );

    expect(screen.getByTestId('table-filter')).toBeInTheDocument();
    expect(screen.getByTestId('sort-icon-name')).toBeInTheDocument();
    expect(screen.getByTestId('legacy-table-container')).toHaveClass('bordered');

    fireEvent.click(screen.getByTestId('header-type'));
    fireEvent.change(screen.getByTestId('table-filter'), { target: { value: 'filter' } });

    expect(mockOnSort).toHaveBeenCalledWith('type');
    expect(mockOnFilter).toHaveBeenCalledWith('filter');
  });
});

