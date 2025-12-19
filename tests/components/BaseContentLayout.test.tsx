/**
 * BaseContentLayout Component Tests
 * Tests the unified base layout component for content pages
 */

import { render, screen } from '@testing-library/react';
import BaseContentLayout from '@/app/components/BaseContentLayout/BaseContentLayout';
import { ArticleMetadata } from '@/types/centralized';

// Mock child components
jest.mock('@/app/components/Layout/Layout', () => ({
  Layout: ({ frontmatter, children }: any) => (
    <div data-testid="layout" data-title={frontmatter?.title}>
      {children}
    </div>
  ),
}));

jest.mock('@/app/components/Micro/Micro', () => ({
  Micro: ({ frontmatter }: any) => (
    <div data-testid="micro">{frontmatter?.micro}</div>
  ),
}));

describe('BaseContentLayout', () => {
  const mockMetadata: ArticleMetadata = {
    title: 'Test Content',
    slug: 'test-content',
    description: 'Test description',
    micro: 'Test micro content',
  };

  const TestSection = ({ text }: { text: string }) => (
    <div data-testid="test-section">{text}</div>
  );

  it('renders Layout wrapper with metadata', () => {
    render(
      <BaseContentLayout metadata={mockMetadata} sections={[]}>
        <div>Content</div>
      </BaseContentLayout>
    );

    const layout = screen.getByTestId('layout');
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveAttribute('data-title', 'Test Content');
  });

  it('renders Micro component when showMicro is true', () => {
    render(
      <BaseContentLayout 
        metadata={mockMetadata} 
        sections={[]}
        showMicro={true}
      >
        <div>Content</div>
      </BaseContentLayout>
    );

    expect(screen.getByTestId('micro')).toBeInTheDocument();
    expect(screen.getByText('Test micro content')).toBeInTheDocument();
  });

  it('does not render Micro component when showMicro is false', () => {
    render(
      <BaseContentLayout 
        metadata={mockMetadata} 
        sections={[]}
        showMicro={false}
      >
        <div>Content</div>
      </BaseContentLayout>
    );

    expect(screen.queryByTestId('micro')).not.toBeInTheDocument();
  });

  it('renders all sections without conditions', () => {
    const sections = [
      {
        component: TestSection,
        props: { text: 'Section 1' },
      },
      {
        component: TestSection,
        props: { text: 'Section 2' },
      },
      {
        component: TestSection,
        props: { text: 'Section 3' },
      },
    ];

    render(
      <BaseContentLayout metadata={mockMetadata} sections={sections}>
        <div>Content</div>
      </BaseContentLayout>
    );

    const testSections = screen.getAllByTestId('test-section');
    expect(testSections).toHaveLength(3);
    expect(testSections[0]).toHaveTextContent('Section 1');
    expect(testSections[1]).toHaveTextContent('Section 2');
    expect(testSections[2]).toHaveTextContent('Section 3');
  });

  it('renders sections conditionally when condition is provided', () => {
    const sections = [
      {
        component: TestSection,
        props: { text: 'Always visible' },
      },
      {
        component: TestSection,
        props: { text: 'Conditional - shown' },
        condition: true,
      },
      {
        component: TestSection,
        props: { text: 'Conditional - hidden' },
        condition: false,
      },
    ];

    render(
      <BaseContentLayout metadata={mockMetadata} sections={sections}>
        <div>Content</div>
      </BaseContentLayout>
    );

    const testSections = screen.getAllByTestId('test-section');
    expect(testSections).toHaveLength(2);
    expect(screen.getByText('Always visible')).toBeInTheDocument();
    expect(screen.getByText('Conditional - shown')).toBeInTheDocument();
    expect(screen.queryByText('Conditional - hidden')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BaseContentLayout metadata={mockMetadata} sections={[]}>
        <div data-testid="child-content">Child Content</div>
      </BaseContentLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('passes metadata to section components via props', () => {
    const MetadataSection = ({ metadata }: { metadata: ArticleMetadata }) => (
      <div data-testid="metadata-section">{metadata.title}</div>
    );

    const sections = [
      {
        component: MetadataSection,
        props: { metadata: mockMetadata },
      },
    ];

    render(
      <BaseContentLayout metadata={mockMetadata} sections={sections}>
        <div>Content</div>
      </BaseContentLayout>
    );

    expect(screen.getByTestId('metadata-section')).toHaveTextContent('Test Content');
  });

  it('handles empty sections array', () => {
    render(
      <BaseContentLayout metadata={mockMetadata} sections={[]}>
        <div data-testid="main-content">Main Content</div>
      </BaseContentLayout>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});
