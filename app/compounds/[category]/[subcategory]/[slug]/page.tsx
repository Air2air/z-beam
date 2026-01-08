// app/compounds/[category]/[subcategory]/[slug]/page.tsx
// Dynamic compound item pages - uses unified content system

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false; // 1 hour ISR in production

const { generateStaticParams, generateMetadata, default: CompoundItemPage } = createItemPage('compounds');

export { generateStaticParams, generateMetadata };
export default CompoundItemPage;
