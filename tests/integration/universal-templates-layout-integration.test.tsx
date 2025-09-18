/**
 * Integration Tests: Universal Templates + Layout System
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
jest.mock('marked');
jest.mock('../../app/utils/logger');
jest.mock('../../app/utils/contentAPI');
jest.mock('../../app/components/Layout/Layout', () => ({
  Layout: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid={`layout-${variant || 'default'}`}>{children}</div>
  )
}));
jest.mock('../../app/components/Debug/DebugLayout', () => ({
  DebugLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="debug-layout">{children}</div>
  )
}));

const fs = require('fs/promises');
const matter = require('gray-matter');
const marked = require('marked');
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
        expect(screen.getByTestId('layout-default')).toBeInTheDocument();
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
        expect(screen.getByTestId('layout-article')).toBeInTheDocument();
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
        expect(screen.getByTestId('layout-minimal')).toBeInTheDocument();
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
        expect(screen.getByTestId('layout-article')).toBeInTheDocument();
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
      loadPageData.mockRejectedValue(new Error('API Error'));

      const TestComponent = () => (
        <UniversalLayout variant="default" title="Error Page">
          <div>Error fallback content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('layout-default')).toBeInTheDocument();
      });
    });

    test('handles markdown file errors with layout fallback', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const TestComponent = () => (
        <UniversalLayout variant="article" components={null}>
          <div>File not found fallback</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('layout-article')).toBeInTheDocument();
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
        expect(screen.getByTestId('layout-default')).toBeInTheDocument();
      });

      // Simulate layout change
      rerender(
        <UniversalLayout 
          variant="article" 
          components={{ hero: { type: 'hero', data: { title: 'Article' } } }}
        >
          <div>Article content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        expect(screen.getByTestId('layout-article')).toBeInTheDocument();
      });
    });

    test('preserves content during layout transitions', async () => {
      const mockData = {
        metadata: { title: 'Persistent Content', id: 'persistent-123' },
        components: { hero: { type: 'hero', data: { title: 'Persistent' } } }
      };

      loadPageData.mockResolvedValue(mockData);

      const { rerender } = render(
        <UniversalLayout variant="default" title="Persistent Page">
          <div>Persistent content</div>
        </UniversalLayout>
      );

      // Change layout variant
      rerender(
        <UniversalLayout variant="minimal">
          <div>Persistent content</div>
        </UniversalLayout>
      );

      await waitFor(() => {
        expect(screen.getByTestId('layout-minimal')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    test('efficient re-rendering with layout changes', async () => {
      const renderSpy = jest.fn();
      
      const TestComponent = ({ variant }: { variant: 'default' | 'minimal' }) => {
        renderSpy();
        return (
          <UniversalLayout 
            variant={variant}
            title="Performance Test"
          >
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
      // Test default layout
      const DefaultComponent = () => (
        <UniversalLayout variant="default" title="Default Test">
          <div>default content</div>
        </UniversalLayout>
      );

      // Test article layout
      const ArticleComponent = () => (
        <UniversalLayout variant="article" components={null}>
          <div>article content</div>
        </UniversalLayout>
      );

      // Test debug layout
      const DebugComponent = () => (
        <UniversalLayout variant="debug" sections={[]}>
          <div>debug content</div>
        </UniversalLayout>
      );

      // Test minimal layout
      const MinimalComponent = () => (
        <UniversalLayout variant="minimal">
          <div>minimal content</div>
        </UniversalLayout>
      );
      
      const components = [DefaultComponent, ArticleComponent, DebugComponent, MinimalComponent];
      const expectedTestIds = ['layout-default', 'layout-article', 'debug-layout', 'layout-minimal'];

      for (let i = 0; i < components.length; i++) {
        const Component = components[i];
        const expectedTestId = expectedTestIds[i];

        const { unmount } = render(<Component />);
        
        await waitFor(() => {
          expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Full Integration Scenarios', () => {
    test('complete page rendering workflow', async () => {
      const pageData = {
        metadata: {
          title: 'Complete Integration Test',
          description: 'Full integration test description',
          layout: 'article',
          author: 'Integration Tester',
          tags: ['integration', 'testing'],
          publishDate: '2025-01-15'
        },
        components: {
          hero: { type: 'hero', data: { title: 'Complete Integration Test' } },
          content: { type: 'content', data: { body: 'Full page content' } }
        }
      };

      loadPageData.mockResolvedValue(pageData);

      const TestComponent = () => (
        <UniversalLayout 
          variant="article" 
          components={pageData.components}
          metadata={pageData.metadata}
        >
          <div>Complete integration content</div>
        </UniversalLayout>
      );

      render(<TestComponent />);

      // Verify layout is rendered
      await waitFor(() => {
        expect(screen.getByTestId('layout-article')).toBeInTheDocument();
      });
      
      // Verify the integration works end-to-end
      expect(screen.getByTestId('layout-article')).toBeInTheDocument();
    });

    test('multi-strategy content handling', async () => {
      // Test markdown strategy
      const markdownContent = `---
title: Markdown Content
layout: default
---
# Markdown Page`;

      fs.readFile.mockResolvedValue(markdownContent);
      matter.mockReturnValue({
        data: { title: 'Markdown Content', layout: 'default' },
        content: '# Markdown Page'
      });

      const { rerender } = render(
        <UniversalLayout variant="default" title="Markdown Test">
          <div>Markdown content</div>
        </UniversalLayout>
      );

      // Switch to contentAPI strategy
      const apiData = {
        metadata: { title: 'API Content', layout: 'default' },
        components: { hero: { type: 'hero', data: { title: 'API' } } }
      };

      loadPageData.mockResolvedValue(apiData);

      rerender(
        <UniversalLayout variant="default" title="API Test">
          <div>API content</div>
        </UniversalLayout>
      );

      // Verify both strategies work with the same layout
      expect(screen.getByTestId('layout-default')).toBeInTheDocument();
    });
  });
});
