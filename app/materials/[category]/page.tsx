// app/materials/[category]/page.tsx
// Dynamic material category pages - uses unified content system

import { createCategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: MaterialCategoryPage } = createCategoryPage('materials');

export { generateStaticParams, generateMetadata };
export default MaterialCategoryPage;
