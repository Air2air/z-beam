// app/partners/page.tsx
import { StaticPage } from "../components/StaticPage/StaticPage";
import { SITE_CONFIG } from "@/app/config";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Laser Cleaning Partners | ${SITE_CONFIG.shortName}`,
  description: 'Authorized laser cleaning partners across North America and Europe. Laserverse (Canada), MacK Laser Restoration (California), and Netalux (Belgium) provide equipment, services, and training.',
  keywords: [
    'laser cleaning partners',
    'Laserverse Canada',
    'MacK Laser Restoration',
    'Netalux Belgium',
    'authorized distributors',
    'laser equipment suppliers',
    'laser cleaning services',
    'professional laser training'
  ],
  
  // OpenGraph for Facebook, LinkedIn
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SITE_CONFIG.url}/partners`,
    title: 'Laser Cleaning Partners - North America & Europe',
    description: 'Trusted laser cleaning partners: Laserverse (Equipment Distribution), MacK Laser (Professional Services), Netalux (Manufacturing).',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/pages/laser.jpg', // Temporary: Replace with /images/partners/partners-og-image.jpg when created
        width: 1200,
        height: 630,
        alt: 'Z-Beam laser cleaning partners across North America and Europe',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Partners | Z-Beam',
    description: 'Authorized partners for laser cleaning equipment, services, and training across North America and Europe.',
    images: ['/images/pages/laser.jpg'], // Temporary: Replace with /images/partners/partners-twitter-card.jpg when created
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: `${SITE_CONFIG.url}/partners`,
  },
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
