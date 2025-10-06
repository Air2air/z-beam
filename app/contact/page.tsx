// app/contact/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";
import { SITE_CONFIG } from "@/app/utils/constants";

export const metadata = {
  title: `Contact ${SITE_CONFIG.shortName}`,
  description: `Get in touch with ${SITE_CONFIG.shortName}'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.`
};

export default async function ContactPage() {
  return <UniversalPage {...pageConfigs.contact} />;
}
