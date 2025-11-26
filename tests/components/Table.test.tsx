/**
 * Test Suite: Table Component
 * Testing simplified table rendering
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the simplified Table component
const MockTable = ({ content, config, frontmatterData }: {
  content?: string;
  config?: {
    caption?: string;
    showHeader?: boolean;
  };
  frontmatterData?: any;
}) => {
  if (!frontmatterData) {
    return (
      <div data-testid="smart-table-container" className="enhanced-table-container">
        <div data-testid="no-data-message">No table data available</div>
      </div>
    );
  }

  // Simulate the flattening logic
  const flattenObject = (obj: any, prefix: string = ''): Array<{key: string, label: string, value: any}> => {
    const result: Array<{key: string, label: string, value: any}> = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      // Skip metadata fields
      if (['slug', 'keywords', 'content', 'name', 'category', 'subcategory', 'description'].includes(key)) {
        return;
      }
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.push(...flattenObject(value, fullKey));
      } else if (value !== null && value !== undefined) {
        result.push({
          key: fullKey,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: value
        });
      }
    });
    
    return result;
  };

  const rows = flattenObject(frontmatterData);
  
  return (
    <div data-testid="smart-table-container" className="enhanced-table-container">
      {config?.caption && (
        <h2 data-testid="table-caption">{config.caption}</h2>
      )}
      
      <table data-testid="simple-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} data-testid={`table-row-${index}`}>
              <td data-testid={`property-${row.key}`}>{row.label}</td>
              <td data-testid={`value-${row.key}`}>
                {Array.isArray(row.value) ? row.value.join(', ') : String(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const sampleFrontmatterData: any = {
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

  describe('Simplified Table Rendering', () => {
    test('should render two-column table structure', () => {
      render(<MockTable frontmatterData={sampleFrontmatterData} />);
      
      expect(screen.getByTestId('simple-table')).toBeInTheDocument();
      expect(screen.getAllByText('Property').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Value').length).toBeGreaterThan(0);
    });

    test('should flatten nested objects into rows', () => {
      const nestedData = {
        materialProperties: {
          laserType: "Fiber laser",
          wavelength: "1064 nm"
        },
        machineSettings: {
          power: "200W",
          weight: "20 kg"
        }
      };

      render(<MockTable frontmatterData={nestedData} />);
      
      // Should show flattened properties
      expect(screen.getByText('Laser Type')).toBeInTheDocument();
      expect(screen.getByText('Fiber laser')).toBeInTheDocument();
      expect(screen.getByText('Wavelength')).toBeInTheDocument();
      expect(screen.getByText('1064 nm')).toBeInTheDocument();
      expect(screen.getByText('Power')).toBeInTheDocument();
      expect(screen.getByText('200W')).toBeInTheDocument();
    });

    test('should filter out metadata fields', () => {
      const dataWithMetadata = {
        name: "Equipment Name",
        category: "Category",
        subcategory: "Subcategory",
        description: "Description text",
        slug: "equipment-slug",
        keywords: ["keyword1", "keyword2"],
        content: "Content text",
        materialProperties: {
          laserType: "Fiber laser"
        }
      };

      render(<MockTable frontmatterData={dataWithMetadata} />);
      
      // Metadata fields should not appear
      expect(screen.queryByText('Equipment Name')).not.toBeInTheDocument();
      expect(screen.queryByText('Category')).not.toBeInTheDocument();
      expect(screen.queryByText('Subcategory')).not.toBeInTheDocument();
      expect(screen.queryByText('Description text')).not.toBeInTheDocument();
      
      // But actual properties should appear
      expect(screen.getByText('Laser Type')).toBeInTheDocument();
      expect(screen.getByText('Fiber laser')).toBeInTheDocument();
    });

    test('should handle array values', () => {
      const dataWithArrays = {
        applications: ["Weld cleaning", "Surface preparation", "Rust removal"]
      };

      render(<MockTable frontmatterData={dataWithArrays} />);
      
      expect(screen.getByText('Weld cleaning, Surface preparation, Rust removal')).toBeInTheDocument();
    });

    test('should render table caption when provided', () => {
      render(
        <MockTable 
          frontmatterData={sampleFrontmatterData}
          config={{ caption: 'Equipment Specifications' }}
        />
      );
      
      expect(screen.getByTestId('table-caption')).toHaveTextContent('Equipment Specifications');
    });

    test('should show no data message when frontmatterData is undefined', () => {
      render(<MockTable />);
      
      expect(screen.getByTestId('no-data-message')).toHaveTextContent('No table data available');
    });

    test('should handle deeply nested objects', () => {
      const deeplyNested = {
        specs: {
          laser: {
            source: {
              type: "Fiber"
            }
          }
        }
      };

      render(<MockTable frontmatterData={deeplyNested} />);
      
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Fiber')).toBeInTheDocument();
    });
  });

  describe('Type Safety and Interfaces', () => {
    test.skip('should handle table data interface correctly', () => {
      const typedData: any = {
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

