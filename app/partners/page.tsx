// app/partners/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Partners | ${SITE_CONFIG.shortName}`,
  description: `Trusted partners providing laser cleaning equipment, services, and training across North America and Europe.`,
};

export default async function PartnersPage() {
  return (
    <StaticPage 
      slug="partners" 
      fallbackTitle="Partners"
      fallbackDescription={metadata.description}
    />
  );
}
