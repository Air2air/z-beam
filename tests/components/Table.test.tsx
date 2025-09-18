/**
 * Test Suite: Table Component
 * Testing data table rendering, sorting, and filtering functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a test Table component
const Table = ({ data, columns, sortable, filterable, onSort, onFilter, variant }: any) => (
  <div 
    data-testid="table-container"
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

describe('Table Component', () => {
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

  test('should render basic table with data', () => {
    render(<Table data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('table-container')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
  });

  test('should render column headers correctly', () => {
    render(<Table data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('header-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('header-type')).toHaveTextContent('Type');
    expect(screen.getByTestId('header-value')).toHaveTextContent('Value');
  });

  test('should render data rows correctly', () => {
    render(<Table data={sampleData} columns={sampleColumns} />);

    expect(screen.getByTestId('cell-0-name')).toHaveTextContent('Item 1');
    expect(screen.getByTestId('cell-0-type')).toHaveTextContent('Metal');
    expect(screen.getByTestId('cell-0-value')).toHaveTextContent('100');

    expect(screen.getByTestId('cell-1-name')).toHaveTextContent('Item 2');
    expect(screen.getByTestId('cell-2-name')).toHaveTextContent('Item 3');
  });

  test('should enable sorting when sortable is true', () => {
    const mockOnSort = jest.fn();
    
    render(
      <Table 
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
      <Table 
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
    render(<Table data={[]} columns={sampleColumns} />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(screen.getByTestId('table-body')).toBeInTheDocument();
    expect(screen.queryByTestId('row-0')).not.toBeInTheDocument();
  });

  test('should handle undefined data gracefully', () => {
    render(<Table data={undefined} columns={sampleColumns} />);

    expect(screen.getByTestId('table-container')).toBeInTheDocument();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  test('should apply variant styling', () => {
    render(
      <Table 
        data={sampleData} 
        columns={sampleColumns} 
        variant="striped"
      />
    );

    const container = screen.getByTestId('table-container');
    expect(container).toHaveAttribute('data-variant', 'striped');
    expect(container).toHaveClass('striped');
  });

  test('should handle complex data types', () => {
    const complexData = [
      { name: 'Complex Item', type: 'Mixed', value: 'Complex Value String' }
    ];

    render(<Table data={complexData} columns={sampleColumns} />);

    expect(screen.getByTestId('cell-0-name')).toHaveTextContent('Complex Item');
    expect(screen.getByTestId('cell-0-value')).toHaveTextContent('Complex Value String');
  });

  test('should render all interactive features together', () => {
    const mockOnSort = jest.fn();
    const mockOnFilter = jest.fn();
    
    render(
      <Table 
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
    expect(screen.getByTestId('table-container')).toHaveClass('bordered');

    fireEvent.click(screen.getByTestId('header-type'));
    fireEvent.change(screen.getByTestId('table-filter'), { target: { value: 'filter' } });

    expect(mockOnSort).toHaveBeenCalledWith('type');
    expect(mockOnFilter).toHaveBeenCalledWith('filter');
  });
});
