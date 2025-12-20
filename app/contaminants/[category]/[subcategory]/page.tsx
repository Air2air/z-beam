// app/contaminants/[category]/[subcategory]/page.tsx
// Dynamic contaminant subcategory pages - uses unified content system

import { createSubcategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: ContaminantSubcategoryPage } = createSubcategoryPage('contaminants');

export { generateStaticParams, generateMetadata };
export default ContaminantSubcategoryPage;
