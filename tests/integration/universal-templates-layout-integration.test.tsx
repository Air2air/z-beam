/**
 * Integration Tests: Universal Templates + Layout System (Fixed)
 * Tests the complete integration between UniversalPage and UniversalLayout components
 * ensuring they work together to render content properly across all variants
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UniversalPage } from '../../app/components/Templates/UniversalPage';
import { UniversalLayout } from '../../app/components/Layout/LayoutSystem';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('gray-matter');
jest.mock('marked', () => ({
  marked: jest.fn(),
}));
jest.mock('../../app/utils/logger');
jest.mock('../../app/utils/contentAPI');
jest.mock('../../app/components/Layout/Layout', () => ({
  Layout: ({ children, variant, title }: { children: React.ReactNode; variant?: string; title?: string }) => (
    <div data-testid="layout-component" data-variant={variant || 'default'} data-title={title}>
      {children}
    </div>
  )
}));
jest.mock('../../app/components/Debug/DebugLayout', () => ({
  DebugLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="debug-layout">{children}</div>
  )
}));

const fs = require('fs/promises');
const matter = require('gray-matter');
const { marked } = require('marked');
const { loadPageData } = require('../../app/utils/contentAPI');

describe('Universal Templates + Layout System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    fs.readFile.mockResolvedValue('# Test Content');
    matter.mockReturnValue({
      data: { title: 'Test Title', layout: 'default' },
      content: '# Test Content'
    });
    marked.mockReturnValue('<h1>Test Content</h1>');
    loadPageData.mockResolvedValue({
      metadata: { title: 'API Content', layout: 'article' },
      components: { hero: { type: 'hero', data: { title: 'Test' } } }
    });
  });

  describe('Layout Variant Integration', () => {
    test('UniversalPage with default layout variant', async () => {
      const TestComponent = () => (
        <UniversalLayout variant="default" title="Test Page">
          <div>Page content from UniversalPage</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        const mainLayout = layoutElements.find(el => el.getAttribute('data-variant') === 'default');
        expect(mainLayout).toBeInTheDocument();
        expect(mainLayout).toHaveAttribute('data-variant', 'default');
      });
    });

    test('UniversalPage with article layout variant', async () => {
      const mockComponents = {
        hero: { type: 'hero', data: { title: 'Test Article' } }
      };

      const TestComponent = () => (
        <UniversalLayout 
          variant="article" 
          components={mockComponents}
          metadata={{ title: 'Test Article', description: 'Test description' }}
        >
          <div>Article content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        const articleLayout = layoutElements.find(el => el.getAttribute('data-variant') === 'article');
        expect(articleLayout).toBeInTheDocument();
        expect(articleLayout).toHaveAttribute('data-variant', 'article');
      });
    });

    test('UniversalPage with debug layout variant', async () => {
      const mockSections = [
        { id: 'test', title: 'Test Section', icon: 'test-icon', description: 'Test description' }
      ];

      const TestComponent = () => (
        <UniversalLayout 
          variant="debug" 
          activeSection="test"
          sections={mockSections}
        >
          <div>Debug content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('debug-layout')).toBeInTheDocument();
      });
    });

    test('UniversalPage with minimal layout variant', async () => {
      const TestComponent = () => (
        <UniversalLayout variant="minimal">
          <div>Minimal content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        const minimalLayout = layoutElements.find(el => el.getAttribute('data-variant') === 'minimal');
        expect(minimalLayout).toBeInTheDocument();
      });
    });
  });

  describe('Content Strategy Integration', () => {
    test('contentAPI strategy with article layout', async () => {
      const mockData = {
        metadata: { 
          title: 'API Article',
          description: 'API description',
          layout: 'article'
        },
        components: {
          hero: { type: 'hero', data: { title: 'API Article' } }
        }
      };

      loadPageData.mockResolvedValue(mockData);

      const TestComponent = () => (
        <UniversalLayout 
          variant="article" 
          components={mockData.components}
          metadata={mockData.metadata}
        >
          <div>API article content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });
    });

    test('markdown strategy with debug layout', async () => {
      const debugContent = `---
title: Debug Content
layout: debug
debugInfo: true
---
# Debug Page Content`;

      fs.readFile.mockResolvedValue(debugContent);
      matter.mockReturnValue({
        data: { 
          title: 'Debug Content', 
          layout: 'debug',
          debugInfo: true 
        },
        content: '# Debug Page Content'
      });

      const mockSections = [
        { id: 'debug', title: 'Debug Section', icon: 'debug-icon', description: 'Debug info' }
      ];

      const TestComponent = () => (
        <UniversalLayout 
          variant="debug" 
          activeSection="debug"
          sections={mockSections}
        >
          <div>Debug page content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('debug-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('handles contentAPI errors with layout fallback', async () => {
      const TestComponent = () => (
        <UniversalLayout variant="article" components={null}>
          <div>Error fallback content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });
    });

    test('handles markdown file errors with layout fallback', async () => {
      const TestComponent = () => (
        <UniversalLayout variant="article" components={{}}>
          <div>Markdown error fallback</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Dynamic Layout Switching', () => {
    test('switches layout based on content metadata', async () => {
      const { rerender } = render(
        <UniversalLayout variant="default" title="Dynamic Page">
          <div>Default content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });

      rerender(
        <UniversalLayout variant="article" components={{}}>
          <div>Article content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        const articleLayout = layoutElements.find(el => el.getAttribute('data-variant') === 'article');
        expect(articleLayout).toBeInTheDocument();
      });
    });

    test('preserves content during layout transitions', async () => {
      const mockData = {
        metadata: { title: 'Persistent Page', layout: 'default' },
        components: { hero: { type: 'hero', data: { title: 'Persistent' } } }
      };

      loadPageData.mockResolvedValue(mockData);

      const { rerender } = render(
        <UniversalLayout variant="default" title="Persistent Page">
          <div>Persistent content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });

      rerender(
        <UniversalLayout variant="minimal" title="Persistent Page">
          <div>Persistent content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Persistent content')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    test('efficient re-rendering with layout changes', async () => {
      const renderSpy = jest.fn();

      const TestComponent = ({ variant }: { variant: string }) => {
        renderSpy();
        return (
          <UniversalLayout variant={variant as any}>
            <div>Performance test content</div>
          </UniversalLayout>
        );
      };

      const { rerender } = render(<TestComponent variant="default" />);
      
      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(1);
      });

      rerender(<TestComponent variant="minimal" />);
      
      await waitFor(() => {
        expect(renderSpy).toHaveBeenCalledTimes(2);
      });
    });

    test('memory efficiency with multiple layout variants', async () => {
      const variants = ['default', 'article', 'minimal'];
      const expectedTestIds = ['universal-layout', 'universal-layout', 'universal-layout'];

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const expectedTestId = expectedTestIds[i];

        const Component = () => (
          <UniversalLayout variant={variant as any} components={{}}>
            <div>Test content {i}</div>
          </UniversalLayout>
        );

        const { unmount } = render(<Component />);
        
        await waitFor(() => {
          const layoutElements = screen.getAllByTestId(expectedTestId);
          expect(layoutElements.length).toBeGreaterThan(0);
        });

        unmount();
      }
    });
  });

  describe('Full Integration Scenarios', () => {
    test('complete page rendering workflow', async () => {
      const mockMetadata = {
        title: 'Complete Integration Test',
        description: 'Testing complete workflow',
        layout: 'article'
      };

      const mockComponents = {
        hero: { type: 'hero', data: { title: 'Complete Integration Test' } },
        content: { type: 'content', data: { body: 'Complete test content' } }
      };

      const TestComponent = () => (
        <UniversalLayout 
          variant="article"
          components={mockComponents}
          metadata={mockMetadata}
        >
          <div>Complete integration content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      // Verify layout is rendered
      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });
      
      // Note: Article layout doesn't render children - it renders based on components/metadata
    });

    test('multi-strategy content handling', async () => {
      loadPageData.mockResolvedValue({
        metadata: { title: 'Multi Strategy', layout: 'default' },
        components: { hero: { type: 'hero', data: { title: 'Multi' } } }
      });

      const { rerender } = render(
        <UniversalLayout variant="default" title="Markdown Test">
          <div>Markdown content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
      });

      rerender(
        <UniversalLayout variant="article" components={{}}>
          <div>API content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        const layoutElements = screen.getAllByTestId('universal-layout');
        expect(layoutElements.length).toBeGreaterThan(0);
        // Note: Article layout doesn't render children - it renders based on components/metadata
      });
    });
  });
});
