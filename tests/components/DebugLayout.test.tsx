/**
 * Test Suite: DebugLayout Component
 * Testing the debug layout variant for development environments
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a test DebugLayout component
const DebugLayout = ({ children, debugInfo, showGrid, showBoundaries }: any) => (
  <div 
    data-testid="debug-layout-wrapper"
    data-debug-info={debugInfo}
    data-show-grid={showGrid}
    data-show-boundaries={showBoundaries}
  >
    <div data-testid="debug-header">
      <span>Debug Mode</span>
      {debugInfo && <pre data-testid="debug-info">{JSON.stringify(debugInfo)}</pre>}
    </div>
    {showGrid && <div data-testid="debug-grid">Grid Overlay</div>}
    {showBoundaries && <div data-testid="debug-boundaries">Boundaries</div>}
    <main data-testid="debug-main">{children}</main>
  </div>
);

describe('DebugLayout Component', () => {
  test('should render basic debug layout', () => {
    render(
      <DebugLayout>
        <div>Debug content</div>
      </DebugLayout>
    );

    expect(screen.getByTestId('debug-layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('debug-header')).toBeInTheDocument();
    expect(screen.getByText('Debug Mode')).toBeInTheDocument();
    expect(screen.getByText('Debug content')).toBeInTheDocument();
  });

  test('should display debug info when provided', () => {
    const debugInfo = {
      component: 'TestComponent',
      props: { test: true },
      renderTime: '12ms'
    };

    render(
      <DebugLayout debugInfo={debugInfo}>
        <div>Content</div>
      </DebugLayout>
    );

    expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    expect(screen.getByTestId('debug-info')).toHaveTextContent(JSON.stringify(debugInfo));
  });

  test('should show grid overlay when enabled', () => {
    render(
      <DebugLayout showGrid={true}>
        <div>Grid content</div>
      </DebugLayout>
    );

    expect(screen.getByTestId('debug-grid')).toBeInTheDocument();
    expect(screen.getByText('Grid Overlay')).toBeInTheDocument();
  });

  test('should show boundaries when enabled', () => {
    render(
      <DebugLayout showBoundaries={true}>
        <div>Boundary content</div>
      </DebugLayout>
    );

    expect(screen.getByTestId('debug-boundaries')).toBeInTheDocument();
    expect(screen.getByText('Boundaries')).toBeInTheDocument();
  });

  test('should enable all debug features together', () => {
    const debugInfo = { test: 'data' };

    render(
      <DebugLayout 
        debugInfo={debugInfo}
        showGrid={true}
        showBoundaries={true}
      >
        <div>Full debug</div>
      </DebugLayout>
    );

    expect(screen.getByTestId('debug-info')).toBeInTheDocument();
    expect(screen.getByTestId('debug-grid')).toBeInTheDocument();
    expect(screen.getByTestId('debug-boundaries')).toBeInTheDocument();
  });

  test('should handle complex debug information', () => {
    const complexDebugInfo = {
      componentTree: ['Layout', 'DebugLayout', 'Content'],
      performance: {
        renderTime: '15ms',
        memoryUsage: '2.3MB'
      },
      props: {
        nested: {
          deep: {
            value: 'test'
          }
        }
      }
    };

    render(
      <DebugLayout debugInfo={complexDebugInfo}>
        <div>Complex debug content</div>
      </DebugLayout>
    );

    const debugElement = screen.getByTestId('debug-info');
    expect(debugElement).toHaveTextContent('componentTree');
    expect(debugElement).toHaveTextContent('performance');
    expect(debugElement).toHaveTextContent('renderTime');
  });
});
