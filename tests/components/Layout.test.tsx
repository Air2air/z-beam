/**
 * Layout Component Tests
 * Tests the main layout system that handles both article and page layouts
 */

import { render, screen } from '@testing-library/react';
import { Layout } from '../../app/components/Layout/Layout';
import { ArticleMetadata, ComponentData } from '../../types/centralized';

// Mock child components to focus on layout logic
jest.mock('../../app/components/Hero/Hero', () => ({
  Hero: ({ frontmatter, theme }: any) => (
    <div data-testid="hero" data-theme={theme}>
      Hero for {frontmatter?.title}
    </div>
  ),
}));

jest.mock('../../app/components/Title/Title', () => ({
  Title: ({ frontmatter, title, children }: any) => (
    <div data-testid="title" data-title={frontmatter?.title || title} data-subtitle={frontmatter?.description}>
      {frontmatter?.title || title || children}
    </div>
  ),
}));

jest.mock('../../app/components/Author/Author', () => ({
  Author: ({ frontmatter }: any) => (
    <div data-testid="author">
      Author: {frontmatter?.authorInfo?.name}
    </div>
  ),
}));

jest.mock('../../app/components/JsonLD/JsonLD', () => ({
  JsonLD: ({ data }: any) => (
    <script data-testid="json-ld" type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  ),
  schemas: {
    technicalArticle: (data: any) => ({ ...data, '@type': 'TechnicalArticle' }),
  },
}));

jest.mock('../../app/components/Content/Content', () => ({
  Content: ({ content, config }: any) => (
    <div data-testid="content-component" data-config={JSON.stringify(config)}>
      {content}
    </div>
  ),
}));

jest.mock('../../app/components/Caption/Caption', () => ({
  Caption: ({ content, frontmatter, config }: any) => (
    <div data-testid="caption-component" data-content={content}>
      Caption: {frontmatter?.title}
    </div>
  ),
}));

jest.mock('../../app/components/Tags/Tags', () => ({
  Tags: ({ content, config }: any) => (
    <div data-testid="tags-component" data-content={content}>
      Tags Component
    </div>
  ),
}));

jest.mock('../../app/components/Table/Table', () => ({
  Table: ({ content, config }: any) => (
    <div data-testid="table-component" data-content={content}>
      Table Component
    </div>
  ),
}));

jest.mock('../../app/components/BadgeSymbol/BadgeSymbol', () => ({
  BadgeSymbol: ({ content, config }: any) => (
    <div data-testid="badge-symbol-component" data-content={content}>
      Badge Symbol: {config?.symbol}
    </div>
  ),
}));

describe('Layout Component', () => {
  const mockMetadata: ArticleMetadata = {
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test article description',
    authorInfo: { name: 'Test Author' },
    datePublished: '2023-01-01',
    lastModified: '2023-01-02',
    image: '/test-image.jpg',
    keywords: ['test', 'article'],
  };

  describe('Regular Page Layout', () => {
    it('should render basic page layout with title', () => {
      render(
        <Layout 
          title="Test Page" 
          description="Test page description"
        >
          <div data-testid="page-content">Page content</div>
        </Layout>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Test Page')).toBeInTheDocument();
      // Note: Layout component doesn't render description for regular pages, only for articles
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('should render without header when fullWidth is true', () => {
      render(
        <Layout 
          title="Test Page" 
          description="Test page description"
          fullWidth={true}
        >
          <div data-testid="page-content">Page content</div>
        </Layout>
      );

      // Title should not be shown when fullWidth is true for regular pages
      expect(screen.queryByText('Test Page')).not.toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('should apply full width layout when fullWidth is true', () => {
      render(
        <Layout fullWidth={true}>
          <div data-testid="page-content">Page content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('w-full');
    });

    it('should apply contained layout by default', () => {
      render(
        <Layout>
          <div data-testid="page-content">Page content</div>
        </Layout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('max-w-7xl');
    });
  });

  describe('Article Layout', () => {
    const mockComponents: Record<string, ComponentData> = {
      content: {
        content: 'Test article content',
        config: { style: 'default' },
      },
      caption: {
        content: 'Test caption content',
        config: { variant: 'default' },
      },
      tags: {
        content: 'tag1, tag2, tag3',
        config: { display: 'list' },
      },
    };

    it('should render article layout with components', () => {
      render(
        <Layout
          title="Test Article"
          metadata={mockMetadata}
          components={mockComponents}
          slug="test-article"
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByText('Test Article')).toBeInTheDocument(); // Check for title text instead of testid
      expect(screen.getByTestId('author')).toBeInTheDocument();
      // Note: Caption is rendered from metadata.caption, not components.caption
      expect(screen.getByTestId('tags-component')).toBeInTheDocument();
    });

    it('should render empty state when no components provided', () => {
      render(
        <Layout
          title="Empty Article"
          components={{}}
          slug="empty-article"
        />
      );

      expect(screen.getByText('Empty Article')).toBeInTheDocument();
      expect(screen.getByText('This page is currently being prepared. Please check back later.')).toBeInTheDocument();
    });

    it('should generate JSON-LD structured data for articles', () => {
      render(
        <Layout
          metadata={mockMetadata}
          components={mockComponents}
          slug="test-article"
        />
      );

      const jsonLd = screen.getByTestId('json-ld');
      expect(jsonLd).toBeInTheDocument();
      
      const data = JSON.parse(jsonLd.textContent || '{}');
      expect(data['@type']).toBe('TechnicalArticle');
      expect(data.headline).toBe('Test Article');
      expect(data.description).toBe('Test article description');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure for articles', () => {
      render(
        <Layout
          metadata={mockMetadata}
          components={{ content: { content: 'Test', config: {} } }}
          slug="test-article"
        />
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have proper semantic structure for pages', () => {
      render(
        <Layout title="Test Page">
          <div>Page content</div>
        </Layout>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
  });
});
