// app/materials/[category]/[subcategory]/page.tsx
// Dynamic material subcategory pages - uses unified content system

import { createSubcategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: MaterialSubcategoryPage } = createSubcategoryPage('materials');

export { generateStaticParams, generateMetadata };
export default MaterialSubcategoryPage;
