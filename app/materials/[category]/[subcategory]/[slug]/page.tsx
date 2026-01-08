// app/materials/[category]/[subcategory]/[slug]/page.tsx
// Dynamic material item pages - uses unified content system

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false; // 1 hour ISR in production

const { generateStaticParams, generateMetadata, default: MaterialItemPage } = createItemPage('materials');

export { generateStaticParams, generateMetadata };
export default MaterialItemPage;
