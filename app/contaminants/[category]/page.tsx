// app/contaminants/[category]/page.tsx
// Dynamic contaminant category pages - uses unified content system

import { createCategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: ContaminantCategoryPage } = createCategoryPage('contaminants');

export { generateStaticParams, generateMetadata };
export default ContaminantCategoryPage;
