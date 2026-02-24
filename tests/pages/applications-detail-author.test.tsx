import { render, screen } from '@testing-library/react';
import ApplicationPage from '@/app/applications/[slug]/page';
import { getAllApplicationSlugs, getApplicationArticle } from '@/app/utils/contentAPI';
import { getAllCategories } from '@/app/utils/applicationCategories';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound');
  }),
  redirect: jest.fn((target: string) => {
    throw new Error(`redirect:${target}`);
  }),
}));

jest.mock('@/app/utils/contentAPI', () => ({
  getAllApplicationSlugs: jest.fn(),
  getApplicationArticle: jest.fn(),
}));

jest.mock('@/app/utils/applicationCategories', () => ({
  getAllCategories: jest.fn(),
}));

jest.mock('@/app/components/Layout/Layout', () => ({
  Layout: ({ metadata, children, title, slug }: any) => (
    <div data-testid="layout" data-title={title} data-slug={slug}>
      <div data-testid="layout-author">{metadata?.author?.name || 'none'}</div>
      {children}
    </div>
  ),
}));

jest.mock('@/app/components/ContentCard/ContentSection', () => ({
  ContentSection: ({ title }: any) => <div data-testid="content-section">{title || 'content'}</div>,
}));

jest.mock('@/app/components/BaseSection/BaseSection', () => ({
  BaseSection: ({ children }: any) => <section data-testid="base-section">{children}</section>,
}));

jest.mock('@/app/components/CardGrid', () => ({
  CardGrid: () => <div data-testid="card-grid" />,
  CardGridSSR: () => <div data-testid="card-grid-ssr" />,
}));

jest.mock('@/app/components/JsonLD/JsonLD', () => ({
  JsonLD: () => <script data-testid="jsonld" type="application/ld+json" />,
}));

jest.mock('@/app/utils/metadataExtractor', () => ({
  toCardGridItems: (items: any[]) => items,
}));

const mockGetAllApplicationSlugs = getAllApplicationSlugs as jest.MockedFunction<typeof getAllApplicationSlugs>;
const mockGetApplicationArticle = getApplicationArticle as jest.MockedFunction<typeof getApplicationArticle>;
const mockGetAllCategories = getAllCategories as jest.MockedFunction<typeof getAllCategories>;

describe('Applications Detail Page - Author via Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllApplicationSlugs.mockResolvedValue([]);
    mockGetAllCategories.mockResolvedValue([] as any);
  });

  it('passes author metadata into shared Layout for detail pages', async () => {
    mockGetApplicationArticle.mockResolvedValue({
      frontmatter: {
        pageTitle: 'Defense Laser Cleaning',
        pageDescription: 'Overview of laser cleaning in defense applications.',
        author: {
          id: 3,
          name: 'Ikmanda Roswati',
          title: 'Ph.D.',
        },
        contentCards: [],
        relationships: {},
      },
    } as any);

    const page = await ApplicationPage({ params: { slug: 'defense-laser-cleaning' } } as any);
    render(page as any);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('layout-author')).toHaveTextContent('Ikmanda Roswati');
  });

  it('handles detail pages without author metadata', async () => {
    mockGetApplicationArticle.mockResolvedValue({
      frontmatter: {
        pageTitle: 'Defense Laser Cleaning',
        pageDescription: 'Overview of laser cleaning in defense applications.',
        contentCards: [],
        relationships: {},
      },
    } as any);

    const page = await ApplicationPage({ params: { slug: 'defense-laser-cleaning' } } as any);
    render(page as any);

    expect(screen.getByTestId('layout-author')).toHaveTextContent('none');
  });
});
