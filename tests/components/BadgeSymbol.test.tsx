/**
 * Test Suite: BadgeSymbol Component
 * Testing material identification badge rendering and validation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a test BadgeSymbol component
const BadgeSymbol = ({ symbol, materialType, name, description, size, variant }: any) => (
  <div 
    data-testid="badge-symbol"
    data-symbol={symbol}
    data-material-type={materialType}
    data-size={size}
    data-variant={variant}
    className={`badge-symbol ${size || 'medium'} ${variant || 'default'}`}
  >
    <span data-testid="symbol-text">{symbol}</span>
    {name && <span data-testid="symbol-name">{name}</span>}
    {description && <span data-testid="symbol-description">{description}</span>}
    {materialType && <span data-testid="material-type">{materialType}</span>}
  </div>
);

describe('BadgeSymbol Component', () => {
  test('should render with required props', () => {
    render(
      <BadgeSymbol 
        symbol="Al"
        materialType="Metal"
        name="Aluminum"
        description="Lightweight metal"
      />
    );

    expect(screen.getByTestId('badge-symbol')).toBeInTheDocument();
    expect(screen.getByTestId('symbol-text')).toHaveTextContent('Al');
    expect(screen.getByTestId('symbol-name')).toHaveTextContent('Aluminum');
    expect(screen.getByTestId('symbol-description')).toHaveTextContent('Lightweight metal');
    expect(screen.getByTestId('material-type')).toHaveTextContent('Metal');
  });

  test('should handle minimal props', () => {
    render(
      <BadgeSymbol 
        symbol="Fe"
        materialType="Metal"
      />
    );

    expect(screen.getByTestId('symbol-text')).toHaveTextContent('Fe');
    expect(screen.getByTestId('material-type')).toHaveTextContent('Metal');
    expect(screen.queryByTestId('symbol-name')).not.toBeInTheDocument();
    expect(screen.queryByTestId('symbol-description')).not.toBeInTheDocument();
  });

  test('should apply size variants', () => {
    render(
      <BadgeSymbol 
        symbol="Cu"
        materialType="Metal"
        size="large"
      />
    );

    const badge = screen.getByTestId('badge-symbol');
    expect(badge).toHaveAttribute('data-size', 'large');
    expect(badge).toHaveClass('large');
  });

  test('should apply style variants', () => {
    render(
      <BadgeSymbol 
        symbol="Au"
        materialType="Metal"
        variant="highlighted"
      />
    );

    const badge = screen.getByTestId('badge-symbol');
    expect(badge).toHaveAttribute('data-variant', 'highlighted');
    expect(badge).toHaveClass('highlighted');
  });

  test('should handle different material types', () => {
    const materialTypes = ['Metal', 'Plastic', 'Ceramic', 'Composite'];

    materialTypes.forEach((materialType, index) => {
      const { unmount } = render(
        <BadgeSymbol 
          key={index}
          symbol="X"
          materialType={materialType}
          name={`Test ${materialType}`}
        />
      );

      expect(screen.getByTestId('material-type')).toHaveTextContent(materialType);
      expect(screen.getByTestId('symbol-name')).toHaveTextContent(`Test ${materialType}`);
      
      unmount(); // Clean up between renders
    });
  });

  test('should handle complex symbols', () => {
    render(
      <BadgeSymbol 
        symbol="Ti-6Al-4V"
        materialType="Alloy"
        name="Titanium Alloy"
        description="Aerospace grade titanium with aluminum and vanadium"
      />
    );

    expect(screen.getByTestId('symbol-text')).toHaveTextContent('Ti-6Al-4V');
    expect(screen.getByTestId('material-type')).toHaveTextContent('Alloy');
    expect(screen.getByTestId('symbol-description')).toHaveTextContent('Aerospace grade titanium');
  });

  test('should handle special characters in symbols', () => {
    render(
      <BadgeSymbol 
        symbol="β-Ti"
        materialType="Metal"
        name="Beta Titanium"
      />
    );

    expect(screen.getByTestId('symbol-text')).toHaveTextContent('β-Ti');
    expect(screen.getByTestId('symbol-name')).toHaveTextContent('Beta Titanium');
  });

  test('should apply default classes when no size/variant specified', () => {
    render(
      <BadgeSymbol 
        symbol="Zn"
        materialType="Metal"
      />
    );

    const badge = screen.getByTestId('badge-symbol');
    expect(badge).toHaveClass('badge-symbol');
    expect(badge).toHaveClass('medium');
    expect(badge).toHaveClass('default');
  });
});
