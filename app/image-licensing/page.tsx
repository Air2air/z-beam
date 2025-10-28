import { StaticPage } from '@/app/components/StaticPage/StaticPage';
import { SITE_CONFIG } from '@/app/utils/constants';

export default function ImageLicensingPage() {
  return <StaticPage slug="image-licensing" />;
}

export const metadata = {
  title: 'Image Licensing | Z-Beam',
  description: 'Information about image licensing, usage rights, and how to obtain permission for Z-Beam photographs and graphics',
  alternates: {
    canonical: `${SITE_CONFIG.url}/image-licensing`,
  },
};
