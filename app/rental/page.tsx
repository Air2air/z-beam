// app/rental/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Equipment Rental | ${SITE_CONFIG.shortName}`,
  description: `Rent professional laser cleaning equipment from ${SITE_CONFIG.shortName}. Flexible rental options for your industrial cleaning needs.`,
};

export default async function RentalPage() {
  return (
    <StaticPage 
      slug="rental" 
      fallbackTitle="Equipment Rental"
      fallbackDescription={metadata.description}
    />
  );
}
