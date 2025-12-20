// app/materials/[category]/[subcategory]/[slug]/page.tsx
// Dynamic material item pages - uses unified content system

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: MaterialItemPage } = createItemPage('materials');

export { generateStaticParams, generateMetadata };
export default MaterialItemPage;
