/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UniversalPage, createPageComponent, pageConfigs } from '../../app/components/Templates/UniversalPage';

// Mock dependencies
jest.mock('../../app/components/Layout/Layout', () => ({
  UniversalLayout: ({ children, title, slug }: any) => (
    <div data-testid="universal-layout" data-title={title} data-slug={slug}>
      {children || title || 'Mocked Layout'}
    </div>
  ),
}));

jest.mock('../../app/utils/contentAPI', () => ({
  loadPageData: jest.fn(),
}));



jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('gray-matter', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('marked', () => ({
  marked: jest.fn(),
}));

const mockLoadPageData = require('../../app/utils/contentAPI').loadPageData;
const mockFsReadFile = require('fs/promises').readFile;
const mockGrayMatter = require('gray-matter').default;
const mockMarked = require('marked').marked;

describe('UniversalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('contentAPI strategy', () => {
    it('should render with contentAPI data successfully', async () => {
      const mockMetadata = {
        title: 'Test Page',
        description: 'Test description',
      };
      const mockComponents = {
        content: { content: '<p>Test content</p>' },
      };

      mockLoadPageData.mockResolvedValue({
        metadata: mockMetadata,
        components: mockComponents,
      });

      // For async components, we need to resolve them first
      const result = await UniversalPage({
        slug: 'test-page',
        title: 'Test Page',
        useContentAPI: true,
      });

      // Then render the resolved JSX
      render(result);

      await waitFor(() => {
        const layout = screen.getByTestId('universal-layout');
        expect(layout).toBeInTheDocument();
        expect(layout).toHaveAttribute('data-title', 'Test Page');
        expect(layout).toHaveAttribute('data-slug', 'test-page');
      });
    });

    it('should handle contentAPI loading errors gracefully', async () => {
      mockLoadPageData.mockRejectedValue(new Error('Content loading failed'));

      const result = await UniversalPage({
        slug: 'test-page',
        useContentAPI: true,
        errorTitle: 'Custom Error Title',
        errorMessage: 'Custom error message',
      });

      render(result);

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('markdown file strategy', () => {
    it('should render with markdown file data successfully', async () => {
      const mockFileContent = 'Test markdown content';
      const mockFrontmatter = {
        title: 'Markdown Title',
        description: 'Markdown description',
      };
      const mockHtmlContent = '<p>Test markdown content</p>';

      mockFsReadFile.mockResolvedValue(mockFileContent);
      mockGrayMatter.mockReturnValue({
        data: mockFrontmatter,
        content: 'Test markdown content',
      });
      mockMarked.mockResolvedValue(mockHtmlContent);

      // Await the async component before rendering
      const result = await UniversalPage({
        slug: 'markdown-page',
        useContentAPI: false,
        markdownPath: 'test/path/test.md',
        title: 'Override Title',
      });

      render(result);

      await waitFor(() => {
        const layout = screen.getByTestId('universal-layout');
        expect(layout).toBeInTheDocument();
        expect(layout).toHaveAttribute('data-title', 'Override Title');
      });

      expect(mockFsReadFile).toHaveBeenCalledWith(
        expect.stringContaining('test/path/test.md'),
        'utf8'
      );
    });

    it('should handle markdown file loading errors gracefully', async () => {
      mockFsReadFile.mockRejectedValue(new Error('File not found'));

      const result = await UniversalPage({
        slug: 'missing-page',
        useContentAPI: false,
        markdownPath: 'nonexistent/path.md',
      });

      render(result);

      expect(screen.getByText('Error Loading Missing-page Page')).toBeInTheDocument();
      expect(screen.getByText("We're sorry, but there was an error loading the missing-page page.")).toBeInTheDocument();
    });
  });

  describe('validation and error handling', () => {
    it('should throw error when neither contentAPI nor markdownPath is provided', async () => {
      const result = await UniversalPage({
        slug: 'invalid-config',
        useContentAPI: false,
        // markdownPath not provided
      });

      render(result);

      expect(screen.getByText('Error Loading Invalid-config Page')).toBeInTheDocument();
    });

    it('should use default error messages when not provided', async () => {
      mockLoadPageData.mockRejectedValue(new Error('Test error'));

      const result = await UniversalPage({
        slug: 'error-page',
        useContentAPI: true,
      });

      render(result);

      expect(screen.getByText('Error Loading Error-page Page')).toBeInTheDocument();
      expect(screen.getByText("We're sorry, but there was an error loading the error-page page.")).toBeInTheDocument();
    });
  });

  describe('props validation', () => {
    it('should handle optional props correctly', async () => {
      const mockMetadata = { title: 'Test' };
      const mockComponents = { content: { content: 'content' } };

      mockLoadPageData.mockResolvedValue({
        metadata: mockMetadata,
        components: mockComponents,
      });

      // Await the async component before rendering
      const result = await UniversalPage({
        slug: 'minimal-props',
      });

      render(result);

      await waitFor(() => {
        expect(screen.getByTestId('universal-layout')).toBeInTheDocument();
      });
    });

    it('should prioritize passed title over metadata title', async () => {
      const mockMetadata = { title: 'Metadata Title' };
      const mockComponents = { content: { content: 'content' } };

      mockLoadPageData.mockResolvedValue({
        metadata: mockMetadata,
        components: mockComponents,
      });

      // Await the async component before rendering
      const result = await UniversalPage({
        slug: 'title-priority',
        title: 'Override Title',
        useContentAPI: true,
      });

      render(result);

      await waitFor(() => {
        const layout = screen.getByTestId('universal-layout');
        expect(layout).toHaveAttribute('data-title', 'Override Title');
      });
    });
  });
});

describe('createPageComponent', () => {
  it('should create a page component with given configuration', async () => {
    const config = {
      slug: 'generated-page',
      title: 'Generated Page',
      useContentAPI: true,
    };

    mockLoadPageData.mockResolvedValue({
      metadata: { title: 'Generated Page' },
      components: { content: { content: 'content' } },
    });

    const GeneratedComponent = createPageComponent(config);
    // Await the async generated component before rendering
    const componentResult = await GeneratedComponent();
    render(componentResult);

    await waitFor(() => {
      const layout = screen.getByTestId('universal-layout');
      expect(layout).toHaveAttribute('data-slug', 'generated-page');
      expect(layout).toHaveAttribute('data-title', 'Generated Page');
    });
  });
});

describe('pageConfigs', () => {
  it('should have predefined configurations for common pages', () => {
    expect(pageConfigs.about).toEqual({
      slug: 'about',
      title: 'About Z-Beam',
      description: expect.stringContaining('Z-Beam\'s mission'),
      useContentAPI: true,
    });

    expect(pageConfigs.contact).toEqual({
      slug: 'contact',
      title: 'Contact Z-Beam',
      description: expect.stringContaining('Get in touch'),
      useContentAPI: false,
      markdownPath: 'app/pages/_md/contact.md',
    });

    expect(pageConfigs.services).toEqual({
      slug: 'services',
      title: 'Services | Z-Beam Laser Cleaning Solutions',
      description: expect.stringContaining('comprehensive laser cleaning services'),
      useContentAPI: false,
      markdownPath: 'app/pages/_md/services.md',
      dynamic: 'force-static',
      revalidate: false,
    });
  });

  it('should have all required fields for each config', () => {
    Object.values(pageConfigs).forEach(config => {
      expect(config).toHaveProperty('slug');
      expect(config).toHaveProperty('title');
      expect(config).toHaveProperty('description');
      expect(typeof config.useContentAPI).toBe('boolean');
    });
  });
});

describe('Integration with LayoutSystem', () => {
  it('should pass correct props to UniversalLayout', async () => {
    const mockMetadata = { title: 'Integration Test' };
    const mockComponents = { content: { content: 'test content' } };

    mockLoadPageData.mockResolvedValue({
      metadata: mockMetadata,
      components: mockComponents,
    });

    // Await the async component before rendering
    const result = await UniversalPage({
      slug: 'integration-test',
      title: 'Integration Test',
      useContentAPI: true,
    });

    render(result);

    await waitFor(() => {
      const layout = screen.getByTestId('universal-layout');
      expect(layout).toHaveAttribute('data-title', 'Integration Test');
      expect(layout).toHaveAttribute('data-slug', 'integration-test');
    });
  });
});
