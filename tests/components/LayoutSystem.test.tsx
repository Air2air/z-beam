/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  UniversalLayout, 
  LayoutFactories, 
  useLayoutVariant,
  type LayoutVariant,
  type UniversalLayoutProps
} from '../../app/components/Layout/LayoutSystem';
import { renderHook } from '@testing-library/react';

// Mock dependencies
jest.mock('../../app/components/Layout/Layout', () => ({
  Layout: ({ children, title, slug, components, metadata, hideHeader, className }: any) => (
    <div 
      data-testid="layout-component" 
      data-title={title}
      data-slug={slug}
      data-hide-header={hideHeader}
      className={className}
      data-components={JSON.stringify(components)}
      data-metadata={JSON.stringify(metadata)}
    >
      {children || 'Layout Content'}
    </div>
  ),
}));

jest.mock('../../app/components/Debug/DebugLayout', () => ({
  DebugLayout: ({ children, activeSection, sections }: any) => (
    <div 
      data-testid="debug-layout" 
      data-active-section={activeSection}
      data-sections={JSON.stringify(sections)}
    >
      {children}
    </div>
  ),
}));

describe('UniversalLayout', () => {
  describe('article variant', () => {
    it('should render article layout with required props', () => {
      const mockComponents = { content: { content: 'test content' } };
      const mockMetadata = { title: 'Test Article', description: 'Test description' };

      render(
        <UniversalLayout
          variant="article"
          components={mockComponents}
          metadata={mockMetadata}
          slug="test-article"
          title="Test Article Title"
        />
      );

      const layout = screen.getByTestId('layout-component');
      expect(layout).toBeInTheDocument();
      expect(layout).toHaveAttribute('data-title', 'Test Article Title');
      expect(layout).toHaveAttribute('data-slug', 'test-article');
      expect(layout).toHaveAttribute('data-components', JSON.stringify(mockComponents));
      expect(layout).toHaveAttribute('data-metadata', JSON.stringify(mockMetadata));
    });

    it('should handle article layout with optional props', () => {
      const mockComponents = { content: { content: 'test content' } };

      render(
        <UniversalLayout
          variant="article"
          components={mockComponents}
          hideHeader={true}
          className="custom-class"
        />
      );

      const layout = screen.getByTestId('layout-component');
      expect(layout).toBeInTheDocument();
      expect(layout).toHaveAttribute('data-hide-header', 'true');
      expect(layout).toHaveClass('custom-class');
    });
  });

  describe('debug variant', () => {
    it('should render debug layout with children', () => {
      const mockSections = [
        { id: 'section1', title: 'Section 1', icon: 'icon1', description: 'Description 1' },
        { id: 'section2', title: 'Section 2', icon: 'icon2', description: 'Description 2' },
      ];

      render(
        <UniversalLayout
          variant="debug"
          activeSection="section1"
          sections={mockSections}
        >
          <div data-testid="debug-content">Debug Content</div>
        </UniversalLayout>
      );

      const debugLayout = screen.getByTestId('debug-layout');
      expect(debugLayout).toBeInTheDocument();
      expect(debugLayout).toHaveAttribute('data-active-section', 'section1');
      expect(debugLayout).toHaveAttribute('data-sections', JSON.stringify(mockSections));
      expect(screen.getByTestId('debug-content')).toBeInTheDocument();
    });

    it('should throw error when debug layout has no children', () => {
      // Expect console.error to be called due to React error boundary
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <UniversalLayout
            variant="debug"
            activeSection="section1"
          />
        );
      }).toThrow('Debug layout requires children');

      consoleSpy.mockRestore();
    });
  });

  describe('minimal variant', () => {
    it('should render minimal layout with title and description', () => {
      render(
        <UniversalLayout
          variant="minimal"
          title="Minimal Title"
          description="Minimal description"
          className="minimal-class"
        >
          <div data-testid="minimal-content">Minimal Content</div>
        </UniversalLayout>
      );

      expect(screen.getByText('Minimal Title')).toBeInTheDocument();
      expect(screen.getByText('Minimal description')).toBeInTheDocument();
      expect(screen.getByTestId('minimal-content')).toBeInTheDocument();
      expect(screen.getByText('Minimal Title').closest('div')).toHaveClass('minimal-class');
    });

    it('should render minimal layout without title and description', () => {
      render(
        <UniversalLayout variant="minimal">
          <div data-testid="minimal-content-only">Content Only</div>
        </UniversalLayout>
      );

      expect(screen.getByTestId('minimal-content-only')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('default variant', () => {
    it('should render default layout with title and description', () => {
      render(
        <UniversalLayout
          variant="default"
          title="Default Title"
          description="Default description"
          showContainer={true}
        >
          <div data-testid="default-content">Default Content</div>
        </UniversalLayout>
      );

      expect(screen.getByText('Default Title')).toBeInTheDocument();
      expect(screen.getByText('Default description')).toBeInTheDocument();
      expect(screen.getByTestId('default-content')).toBeInTheDocument();
    });

    it('should handle default layout without container', () => {
      render(
        <UniversalLayout
          title="No Container Title"
          showContainer={false}
        >
          <div data-testid="no-container-content">No Container Content</div>
        </UniversalLayout>
      );

      const wrapper = screen.getByTestId('no-container-content').closest('div');
      expect(wrapper).not.toHaveClass('max-w-4xl');
      expect(wrapper).not.toHaveClass('mx-auto');
    });

    it('should default to variant="default" when no variant specified', () => {
      render(
        <UniversalLayout title="Implicit Default">
          <div data-testid="implicit-default">Content</div>
        </UniversalLayout>
      );

      expect(screen.getByText('Implicit Default')).toBeInTheDocument();
      expect(screen.getByTestId('implicit-default')).toBeInTheDocument();
    });
  });

  describe('className handling', () => {
    it('should apply custom className to all variants', () => {
      const { rerender } = render(
        <UniversalLayout
          variant="minimal"
          className="custom-minimal"
        >
          Content
        </UniversalLayout>
      );

      expect(screen.getByText('Content').closest('div')).toHaveClass('custom-minimal');

      rerender(
        <UniversalLayout
          variant="default"
          className="custom-default"
        >
          Content
        </UniversalLayout>
      );

      expect(screen.getByText('Content').closest('div')).toHaveClass('custom-default');
    });
  });
});

describe('LayoutFactories', () => {
  describe('article factory', () => {
    it('should create article layout with factory', () => {
      const mockComponents = { content: { content: 'factory content' } };
      const mockMetadata = { title: 'Factory Article' };

      render(
        LayoutFactories.article({
          components: mockComponents,
          metadata: mockMetadata,
          slug: 'factory-article',
        })
      );

      const layout = screen.getByTestId('layout-component');
      expect(layout).toBeInTheDocument();
      expect(layout).toHaveAttribute('data-slug', 'factory-article');
    });
  });

  describe('debug factory', () => {
    it('should create debug layout with factory', () => {
      const mockSections = [{ id: 'test', title: 'Test', icon: 'icon', description: 'desc' }];

      render(
        LayoutFactories.debug({
          activeSection: 'test',
          sections: mockSections,
          children: <div data-testid="factory-debug">Debug Factory</div>,
        })
      );

      expect(screen.getByTestId('debug-layout')).toBeInTheDocument();
      expect(screen.getByTestId('factory-debug')).toBeInTheDocument();
    });
  });

  describe('page factory', () => {
    it('should create default page layout with factory', () => {
      render(
        LayoutFactories.page({
          title: 'Factory Page',
          description: 'Factory description',
          children: <div data-testid="factory-page">Page Factory</div>,
        })
      );

      expect(screen.getByText('Factory Page')).toBeInTheDocument();
      expect(screen.getByText('Factory description')).toBeInTheDocument();
      expect(screen.getByTestId('factory-page')).toBeInTheDocument();
    });
  });

  describe('minimal factory', () => {
    it('should create minimal layout with factory', () => {
      render(
        LayoutFactories.minimal({
          title: 'Factory Minimal',
          children: <div data-testid="factory-minimal">Minimal Factory</div>,
        })
      );

      expect(screen.getByText('Factory Minimal')).toBeInTheDocument();
      expect(screen.getByTestId('factory-minimal')).toBeInTheDocument();
    });
  });
});

describe('useLayoutVariant hook', () => {
  it('should return debug variant when isDebug is true', () => {
    const { result } = renderHook(() =>
      useLayoutVariant({ isDebug: true, hasComponents: true, isMinimal: true })
    );

    expect(result.current).toBe('debug');
  });

  it('should return article variant when hasComponents is true', () => {
    const { result } = renderHook(() =>
      useLayoutVariant({ isDebug: false, hasComponents: true, isMinimal: true })
    );

    expect(result.current).toBe('article');
  });

  it('should return minimal variant when isMinimal is true', () => {
    const { result } = renderHook(() =>
      useLayoutVariant({ isDebug: false, hasComponents: false, isMinimal: true })
    );

    expect(result.current).toBe('minimal');
  });

  it('should return default variant when no conditions are met', () => {
    const { result } = renderHook(() =>
      useLayoutVariant({ isDebug: false, hasComponents: false, isMinimal: false })
    );

    expect(result.current).toBe('default');
  });

  it('should handle empty context object', () => {
    const { result } = renderHook(() => useLayoutVariant({}));

    expect(result.current).toBe('default');
  });

  it('should prioritize debug over other options', () => {
    const { result } = renderHook(() =>
      useLayoutVariant({ isDebug: true, hasComponents: true, isMinimal: true })
    );

    expect(result.current).toBe('debug');
  });
});

describe('Type Safety and Props Validation', () => {
  it('should handle all variant-specific props correctly', () => {
    // Article variant props
    const articleProps: UniversalLayoutProps = {
      variant: 'article',
      components: { content: { content: 'test' } },
      metadata: { title: 'Test' },
      slug: 'test',
    };

    // Debug variant props
    const debugProps: UniversalLayoutProps = {
      variant: 'debug',
      activeSection: 'test',
      sections: [{ id: 'test', title: 'Test', icon: 'icon', description: 'desc' }],
      children: <div>Debug content</div>,
    };

    // Default variant props
    const defaultProps: UniversalLayoutProps = {
      variant: 'default',
      title: 'Default',
      description: 'Description',
      showContainer: true,
    };

    // All props should be type-safe
    expect(articleProps.variant).toBe('article');
    expect(debugProps.variant).toBe('debug');
    expect(defaultProps.variant).toBe('default');
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle undefined children gracefully', () => {
    render(
      <UniversalLayout variant="default" title="No Children Test" />
    );

    expect(screen.getByText('No Children Test')).toBeInTheDocument();
  });

  it('should handle missing optional props', () => {
    const mockComponents = { content: { content: 'minimal props' } };

    render(
      <UniversalLayout variant="article" components={mockComponents} />
    );

    const layout = screen.getByTestId('layout-component');
    expect(layout).toBeInTheDocument();
  });

  it('should handle empty components object', () => {
    render(
      <UniversalLayout variant="article" components={{}} />
    );

    const layout = screen.getByTestId('layout-component');
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute('data-components', '{}');
  });
});
