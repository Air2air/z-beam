// app/settings/[category]/page.tsx
// Dynamic settings category pages - uses unified content system

import { createCategoryPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = false;

const { generateStaticParams, generateMetadata, default: SettingsCategoryPage } = createCategoryPage('settings');

export { generateStaticParams, generateMetadata };
export default SettingsCategoryPage;
