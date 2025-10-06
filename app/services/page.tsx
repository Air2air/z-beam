// app/services/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Services | ${SITE_CONFIG.name}`,
  description: `Explore ${SITE_CONFIG.shortName}'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.`
};

export default async function ServicesPage() {
  return <UniversalPage {...pageConfigs.services} />;
}
