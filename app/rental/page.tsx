// app/rental/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Equipment Rental | ${SITE_CONFIG.shortName}`,
  description: `Rent professional laser cleaning equipment from ${SITE_CONFIG.shortName}. Flexible rental options for your industrial cleaning needs.`,
};

export default async function RentalPage() {
  return <UniversalPage {...pageConfigs.rental} />;
}
