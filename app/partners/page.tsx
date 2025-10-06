// app/partners/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Partners | ${SITE_CONFIG.shortName}`,
  description: `Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.`,
};

export default async function PartnersPage() {
  return <UniversalPage {...pageConfigs.partners} />;
}
