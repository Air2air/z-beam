/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CategoryPage, { generateStaticParams, generateMetadata } from '@/app/materials/[category]/page';
import { getAllCategories } from '@/app/utils/materialCategories';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '@/app/metadata';
import { SITE_CONFIG } from '@/app/config';

// Mock dependencies
jest.mock('@/app/utils/materialCategories');
jest.mock('@/app/components/Layout/Layout', () => ({
  Layout: ({ children, title, subtitle }: any) => (
    <div data-testid="layout">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
}));
jest.mock('@/app/components/CardGrid', () => ({
  CardGridSSR: ({ slugs }: any) => (
    <div data-testid="card-grid">{slugs?.length || 0} materials</div>
  ),
}));
jest.mock('@/app/components/JsonLD/JsonLD', () => ({
  JsonLD: ({ data }: any) => (
    <script
      type="application/ld+json"
      data-testid="jsonld-script"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ),
}));

const mockCategoryData = {
  slug: 'metal',
  label: 'Metal',
  materials: [
    { slug: 'aluminum-laser-cleaning', name: 'Aluminum', title: 'Aluminum Laser Cleaning', category: 'metal', subcategory: 'non-ferrous' },
    { slug: 'steel-laser-cleaning', name: 'Steel', title: 'Steel Laser Cleaning', category: 'metal', subcategory: 'ferrous' },
    { slug: 'copper-laser-cleaning', name: 'Copper', title: 'Copper Laser Cleaning', category: 'metal', subcategory: 'non-ferrous' },
  ],
  subcategories: [
    {
      slug: 'non-ferrous',
      label: 'Non-Ferrous',
      materials: [
        { slug: 'aluminum-laser-cleaning', name: 'Aluminum', title: 'Aluminum Laser Cleaning', category: 'metal', subcategory: 'non-ferrous' },
        { slug: 'copper-laser-cleaning', name: 'Copper', title: 'Copper Laser Cleaning', category: 'metal', subcategory: 'non-ferrous' },
      ],
    },
    {
      slug: 'ferrous',
      label: 'Ferrous',
      materials: [
        { slug: 'steel-laser-cleaning', name: 'Steel', title: 'Steel Laser Cleaning', category: 'metal', subcategory: 'ferrous' },
      ],
    },
  ],
};

describe('CategoryPage Component', () => {
  beforeEach(() => {
    (getAllCategories as jest.Mock).mockResolvedValue([mockCategoryData]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStaticParams', () => {
    it('should generate params for all valid categories', async () => {
      const params = await generateStaticParams();
      
      expect(params).toEqual(
        VALID_CATEGORIES.map(category => ({ category }))
      );
      expect(params.length).toBe(VALID_CATEGORIES.length);
    });

    it('should include metal category', async () => {
      const params = await generateStaticParams();
      expect(params).toContainEqual({ category: 'metal' });
    });

    it('should include ceramic category', async () => {
      const params = await generateStaticParams();
      expect(params).toContainEqual({ category: 'ceramic' });
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata for valid category', async () => {
      const metadata = await generateMetadata({ params: { category: 'metal' } });
      
      expect(metadata.title).toBe(CATEGORY_METADATA.metal.title);
      expect(metadata.description).toBe(CATEGORY_METADATA.metal.description);
      expect(metadata.keywords).toContain('metal laser cleaning');
    });

    it('should include canonical URL', async () => {
      const metadata = await generateMetadata({ params: { category: 'metal' } });
      
      expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.url}/metal`);
    });

    it('should return not found metadata for invalid category', async () => {
      const metadata = await generateMetadata({ params: { category: 'invalid-category' } });
      
      expect(metadata.title).toContain('Not Found');
      expect(metadata.description).toContain('not found');
    });

    it('should include OG image for category', async () => {
      const metadata = await generateMetadata({ params: { category: 'metal' } });
      
      expect(metadata.openGraph?.images).toBeDefined();
    });
  });

  describe('CategoryPage Rendering', () => {
    it('should render category page with title and subtitle', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      expect(screen.getByText(/Metal Laser Cleaning/i)).toBeInTheDocument();
      expect(container).toBeTruthy();
    });

    it('should render subcategory sections with headers', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      expect(screen.getByText('Non-Ferrous')).toBeInTheDocument();
      expect(screen.getByText('Ferrous')).toBeInTheDocument();
    });

    it('should render CardGrid for each subcategory', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const cardGrids = screen.getAllByTestId('card-grid');
      expect(cardGrids).toHaveLength(2); // Non-Ferrous and Ferrous
    });

    it('should pass correct material slugs to CardGrid', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const cardGrids = screen.getAllByTestId('card-grid');
      expect(cardGrids[0]).toHaveTextContent('2 materials'); // Non-Ferrous
      expect(cardGrids[1]).toHaveTextContent('1 material'); // Ferrous
    });

    it('should throw not found for invalid category', async () => {
      await expect(
        CategoryPage({ params: { category: 'invalid-category' } })
      ).rejects.toThrow();
    });
  });

  describe('JSON-LD Schema Generation', () => {
    it('should generate CollectionPage schema', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      expect(schemaData['@type']).toBe('CollectionPage');
      expect(schemaData.name).toBe('Metal Laser Cleaning');
    });

    it('should include breadcrumb in schema', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      expect(schemaData.breadcrumb).toBeDefined();
      expect(schemaData.breadcrumb['@type']).toBe('BreadcrumbList');
      expect(schemaData.breadcrumb.itemListElement).toHaveLength(2);
    });

    it('should include ItemList with subcategories', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      expect(schemaData.mainEntity['@type']).toBe('ItemList');
      expect(schemaData.mainEntity.numberOfItems).toBe(3); // Total materials
      expect(schemaData.mainEntity.itemListElement).toHaveLength(2); // 2 subcategories
    });

    it('should include nested ItemList for each subcategory', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      const firstSubcategory = schemaData.mainEntity.itemListElement[0];
      expect(firstSubcategory.name).toBe('Non-Ferrous');
      expect(firstSubcategory.item['@type']).toBe('ItemList');
      expect(firstSubcategory.item.numberOfItems).toBe(2);
      expect(firstSubcategory.item.itemListElement).toHaveLength(2);
    });

    it('should include correct URLs for materials', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      const firstSubcategory = schemaData.mainEntity.itemListElement[0];
      const firstMaterial = firstSubcategory.item.itemListElement[0];
      
      expect(firstMaterial.url).toBe(
        `${SITE_CONFIG.url}/materials/metal/non-ferrous/aluminum-laser-cleaning`
      );
    });

    it('should include publisher information', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      expect(schemaData.publisher['@type']).toBe('Organization');
      expect(schemaData.publisher.name).toBe(SITE_CONFIG.name);
      expect(schemaData.publisher.url).toBe(SITE_CONFIG.url);
    });

    it('should include canonical URL in schema', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const jsonLdScript = screen.getByTestId('jsonld-script');
      const schemaData = JSON.parse(jsonLdScript.innerHTML);
      
      expect(schemaData.url).toBe(`${SITE_CONFIG.url}/materials/metal`);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic section elements', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should use proper heading hierarchy', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const h2Headings = container.querySelectorAll('h2');
      expect(h2Headings.length).toBe(2); // One for each subcategory
    });

    it('should have descriptive heading text', async () => {
      const page = await CategoryPage({ params: { category: 'metal' } });
      render(page);
      
      expect(screen.getByRole('heading', { name: 'Non-Ferrous' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ferrous' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle category with no subcategories', async () => {
      (getAllCategories as jest.Mock).mockResolvedValue([
        {
          slug: 'metal',
          label: 'Metal',
          materials: [],
          subcategories: [],
        },
      ]);

      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      const cardGrids = screen.queryAllByTestId('card-grid');
      expect(cardGrids).toHaveLength(0);
    });

    it('should handle subcategory with single material', async () => {
      (getAllCategories as jest.Mock).mockResolvedValue([
        {
          ...mockCategoryData,
          subcategories: [
            {
              slug: 'single',
              label: 'Single',
              materials: [
                { slug: 'single-material', name: 'Single', title: 'Single Material', category: 'metal', subcategory: 'single' },
              ],
            },
          ],
        },
      ]);

      const page = await CategoryPage({ params: { category: 'metal' } });
      const { container } = render(page);
      
      expect(screen.getByText(/1 material/)).toBeInTheDocument();
    });

    it('should throw error when category data not found', async () => {
      (getAllCategories as jest.Mock).mockResolvedValue([]);

      await expect(
        CategoryPage({ params: { category: 'metal' } })
      ).rejects.toThrow();
    });
  });
});
