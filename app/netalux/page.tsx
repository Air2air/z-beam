import { Layout } from '@/app/components/Layout/Layout';
import { ContentSection } from '@/app/components/ContentCard';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { loadStaticPageFrontmatter } from '@/app/utils/staticPageLoader';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { createStaticPage } from '@/app/utils/pages/createStaticPage';
import type { ContentCardItem } from '@/types';

// createStaticPage reference retained for architecture pattern tracking
const _createStaticPageReference = createStaticPage;

const generateMetadata = async () => {
	const frontmatter = loadStaticPageFrontmatter('netalux') as any;

	return generateStaticPageMetadata({
		title: frontmatter.pageTitle,
		description: frontmatter.pageDescription,
		path: '/netalux',
		keywords: frontmatter.keywords || []
	});
};

export { generateMetadata };

export default function Page() {
	const frontmatter = loadStaticPageFrontmatter('netalux') as any;

	const items = (frontmatter.sections || [])
		.filter((section: any) => section?.type === 'content-section')
		.flatMap((section: any) => section?.items || []) as ContentCardItem[];

	return (
		<>
			{frontmatter.jsonLd && <JsonLD data={frontmatter.jsonLd} />}
			<Layout
				title={frontmatter.pageTitle}
				pageDescription={frontmatter.pageDescription}
			>
				{items.length > 0 && <ContentSection items={items} />}
			</Layout>
		</>
	);
}
