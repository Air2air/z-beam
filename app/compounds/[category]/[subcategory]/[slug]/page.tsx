// app/compounds/[category]/[subcategory]/[slug]/page.tsx
// Dynamic compound item pages - uses unified content system

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: CompoundItemPage } = createItemPage('compounds');

export { generateStaticParams, generateMetadata };
export default CompoundItemPage;
