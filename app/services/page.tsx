// app/services/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Services | ${SITE_CONFIG.name}`,
  description: `Explore ${SITE_CONFIG.shortName}'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
};

export default async function ServicesPage() {
  return (
    <StaticPage 
      slug="services" 
      fallbackTitle="Z-Beam Laser Cleaning Services"
      fallbackDescription={metadata.description}
    />
  );
}
