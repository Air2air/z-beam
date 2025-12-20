// app/contaminants/[category]/[subcategory]/[slug]/page.tsx
// Dynamic contaminant item pages - uses unified content system
// Second cache bust attempt - Dec 15, 2025
// Vercel cache invalidation test

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: ContaminantItemPage } = createItemPage('contaminants');

export { generateStaticParams, generateMetadata };
export default ContaminantItemPage;
