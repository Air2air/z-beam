// app/settings/[category]/[subcategory]/page.tsx
// Dynamic settings subcategory pages - uses unified content system

import { createSubcategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: SettingsSubcategoryPage } = createSubcategoryPage('settings');

export { generateStaticParams, generateMetadata };
export default SettingsSubcategoryPage;
