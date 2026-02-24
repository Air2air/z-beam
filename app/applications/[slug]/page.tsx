// app/applications/[slug]/page.tsx
// Dynamic application detail page (flat route)

import { notFound, redirect } from 'next/navigation';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllApplicationSlugs, getApplicationArticle } from '@/app/utils/contentAPI';
import { getAllCategories } from '@/app/utils/applicationCategories';
import { Layout } from '@/app/components/Layout/Layout';
import { ContentSection } from '@/app/components/ContentCard/ContentSection';
import { BaseSection } from '@/app/components/BaseSection/BaseSection';
import { CardGrid, CardGridSSR } from '@/app/components/CardGrid';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import { generateCollectionPageSchema, generateItemListSchema, generateWebPageSchema } from '@/app/utils/schemas/collectionPageSchema';
import { generateBreadcrumbs, breadcrumbsToSchema } from '@/app/utils/breadcrumbs';
import { toCardGridItems } from '@/app/utils/metadataExtractor';
import type { ComponentData } from '@/types';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false;

export async function generateStaticParams() {
  const slugs = await getAllApplicationSlugs();
  const categories = await getAllCategories();
  const subcategorySlugs = categories.flatMap(category =>
    category.subcategories.map(subcategory => subcategory.slug)
  );

  const allSlugs = new Set([...slugs, ...subcategorySlugs]);
  return Array.from(allSlugs).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const normalizedSlug = normalizeForUrl(slug);

  if (normalizedSlug !== slug) {
    return createMetadata({
      title: SITE_CONFIG.shortName,
      description: 'Redirecting to canonical URL.',
      slug: `applications/${normalizedSlug}`,
      canonical: `${SITE_CONFIG.url}/applications/${normalizedSlug}`
    });
  }

  const categories = await getAllCategories();
  const matchingSubcategory = categories
    .flatMap(category => category.subcategories)
    .find(subcategory => subcategory.slug === normalizedSlug);

  if (matchingSubcategory) {
    const itemCount = matchingSubcategory.applications.length;
    const description = `Laser cleaning solutions for ${matchingSubcategory.label.toLowerCase()} applications. ${itemCount} applications cataloged.`;

    return createMetadata({
      title: `${matchingSubcategory.label} Applications`,
      description,
      keywords: [
        `${matchingSubcategory.label} laser cleaning`,
        `${matchingSubcategory.label} applications`,
        'laser cleaning applications'
      ],
      image: '/images/z-beam-laser-cleaning-og.jpg',
      slug: `applications/${normalizedSlug}`,
      canonical: `${SITE_CONFIG.url}/applications/${normalizedSlug}`
    });
  }

  const article = await getApplicationArticle(slug);

  if (!article) {
    return createMetadata({
      title: `Application Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested application could not be found.',
      slug: `applications/${slug}`,
      canonical: `${SITE_CONFIG.url}/applications/${slug}`
    });
  }

  const frontmatter = article.frontmatter as Record<string, any>;
  const title = frontmatter.pageTitle || frontmatter.displayName || frontmatter.name || slug;
  const description = frontmatter.metaDescription || frontmatter.pageDescription || '';

  return createMetadata({
    title,
    description,
    keywords: frontmatter.keywords || [],
    image: frontmatter.images?.hero?.url,
    slug: `applications/${slug}`,
    canonical: `${SITE_CONFIG.url}/applications/${slug}`,
    author: frontmatter.author,
    datePublished: frontmatter.datePublished,
    lastModified: frontmatter.dateModified
  });
}

export default async function ApplicationPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const normalizedSlug = normalizeForUrl(slug);

  if (normalizedSlug !== slug) {
    redirect(`/applications/${normalizedSlug}`);
  }

  if (normalizedSlug === 'applications') {
    redirect('/applications');
  }

  const applicationSlugs = await getAllApplicationSlugs();
  const subcategoryApplicationSlug = `${normalizedSlug}-laser-cleaning`;
  if (applicationSlugs.includes(subcategoryApplicationSlug)) {
    redirect(`/applications/${subcategoryApplicationSlug}`);
  }

  const categories = await getAllCategories();
  const matchingSubcategory = categories
    .flatMap(category => category.subcategories)
    .find(subcategory => subcategory.slug === normalizedSlug);

  if (matchingSubcategory) {
    const items = matchingSubcategory.applications;
    const pageTitle = `${matchingSubcategory.label} Applications`;
    const pageDescription = `Laser cleaning solutions for ${matchingSubcategory.label.toLowerCase()} applications. ${items.length} applications cataloged.`;
    const pageUrl = `${SITE_CONFIG.url}/applications/${normalizedSlug}`;

    const metadata = {
      title: pageTitle,
      description: pageDescription,
      breadcrumb: [
        { label: 'Home', href: '/' },
        { label: 'Applications', href: '/applications' },
        { label: matchingSubcategory.label, href: `/applications/${normalizedSlug}` }
      ]
    };

    const schemas = {
      '@context': 'https://schema.org',
      '@graph': [
        generateCollectionPageSchema({
          url: pageUrl,
          name: pageTitle,
          description: pageDescription,
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'url': `${SITE_CONFIG.url}/applications/${item.slug}`,
            'item': {
              '@type': 'Article',
              '@id': `${SITE_CONFIG.url}/applications/${item.slug}`,
              'name': item.name,
              'url': `${SITE_CONFIG.url}/applications/${item.slug}`
            }
          }))
        }),
        generateItemListSchema({
          url: pageUrl,
          name: pageTitle,
          description: pageDescription,
          items: items.map(item => ({
            name: item.name,
            url: `${SITE_CONFIG.url}/applications/${item.slug}`
          }))
        }),
        generateWebPageSchema({
          url: pageUrl,
          name: pageTitle,
          description: pageDescription,
          breadcrumbId: `${pageUrl}#breadcrumb`,
          authorId: `${SITE_CONFIG.url}#author-technical-team`
        })
      ]
    };

    return (
      <>
        <JsonLD data={schemas} />
        <Layout
          metadata={metadata as any}
          slug={`applications/${normalizedSlug}`}
          title={pageTitle}
          pageDescription={pageDescription}
        >
          <CardGridSSR
            slugs={items.map(item => item.slug)}
            columns={3}
            contentType="applications"
          />
        </Layout>
      </>
    );
  }

  const article = await getApplicationArticle(slug);

  if (!article) {
    notFound();
  }

  const frontmatter = article.frontmatter as Record<string, any>;
  const contentCards = Array.isArray(frontmatter.contentCards)
    ? frontmatter.contentCards
    : [];
  const contentCardsTitle = frontmatter.contentCardsTitle;
  const relatedMaterials = frontmatter.relationships?.discovery?.relatedMaterials;
  const commonContaminants = frontmatter.relationships?.interactions?.contaminatedBy;

  // Build page-specific JSON-LD schemas
  const pageUrl = `${SITE_CONFIG.url}${frontmatter.fullPath || `/applications/${slug}`}`;
  const pageTitle = frontmatter.pageTitle || frontmatter.displayName || frontmatter.name || slug;
  const pageDescription = frontmatter.pageDescription || '';
  const breadcrumbItems = generateBreadcrumbs(frontmatter as any, frontmatter.fullPath || '');

  const articleSchemas: object[] = [
    generateWebPageSchema({
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      datePublished: frontmatter.datePublished,
      dateModified: frontmatter.dateModified,
      breadcrumbId: breadcrumbItems ? `${pageUrl}#breadcrumb` : undefined,
      authorId: `${SITE_CONFIG.url}#author-technical-team`,
    }),
  ];
  if (breadcrumbItems && breadcrumbItems.length > 0) {
    articleSchemas.push(breadcrumbsToSchema(breadcrumbItems, SITE_CONFIG.url));
  }
  const articleJsonLd = { '@context': 'https://schema.org', '@graph': articleSchemas };

  return (
    <>
      <JsonLD data={articleJsonLd} />
      <Layout
        metadata={frontmatter as any}
        slug={`applications/${slug}`}
        title={pageTitle}
        pageDescription={pageDescription}
      >
      {contentCards.length > 0 && (
        <ContentSection
          title={contentCardsTitle}
          items={contentCards}
        />
      )}
      {relatedMaterials?.items?.length > 0 && (
        <BaseSection section={relatedMaterials._section} className="mt-8">
          <CardGrid
            items={toCardGridItems(relatedMaterials.items, 'material')}
            columns={3}
            variant="relationship"
          />
        </BaseSection>
      )}
      {commonContaminants?.items?.length > 0 && (
        <BaseSection section={commonContaminants._section} className="mt-10">
          <CardGrid
            items={toCardGridItems(commonContaminants.items, 'contaminant')}
            columns={3}
            variant="relationship"
          />
        </BaseSection>
      )}
    </Layout>
    </>
  );
}
