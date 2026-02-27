// app/materials/page.tsx
import { createIndexPage } from '@/app/utils/pages/createContentPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false;
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true };

const { generateMetadata, default: MaterialsIndexPage } = createIndexPage('materials');
export { generateMetadata };
export default MaterialsIndexPage;
