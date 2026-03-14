// app/services/page.tsx
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

// Viewport configuration for mobile optimization
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const { generateMetadata, default: ServicesPage } = createStaticPage('services');

export { generateMetadata };
export default ServicesPage;
