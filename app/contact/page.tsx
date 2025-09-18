// app/contact/page.tsx
import { UniversalPage, pageConfigs } from "../components/Templates/UniversalPage";

export const metadata = {
  title: 'Contact Z-Beam',
  description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.'
};

// Default export - the page component
export default async function ContactPage() {
  return <UniversalPage {...pageConfigs.contact} />;
}
