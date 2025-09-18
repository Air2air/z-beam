// app/services/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";

// Force static generation for services page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

export const metadata = {
  title: 'Services | Z-Beam Laser Cleaning Solutions',
  description: 'Explore Z-Beam\'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.'
};

// Default export - the page component
export default async function ServicesPage() {
  return <UniversalPage {...pageConfigs.services} />;
}
