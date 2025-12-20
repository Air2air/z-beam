// app/compounds/[category]/page.tsx
// Dynamic compound category pages - uses unified content system

import { createCategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: CompoundCategoryPage } = createCategoryPage('compounds');

export { generateStaticParams, generateMetadata };
export default CompoundCategoryPage;
