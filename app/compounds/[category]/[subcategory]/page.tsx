// app/compounds/[category]/[subcategory]/page.tsx
// Dynamic compound subcategory pages - uses unified content system

import { createSubcategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: CompoundSubcategoryPage } = createSubcategoryPage('compounds');

export { generateStaticParams, generateMetadata };
export default CompoundSubcategoryPage;
