// app/settings/[category]/[subcategory]/[slug]/page.tsx
// Dynamic settings item pages - uses unified content system

import { createItemPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: SettingsItemPage } = createItemPage('settings');

export { generateStaticParams, generateMetadata };
export default SettingsItemPage;
