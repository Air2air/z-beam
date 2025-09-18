// app/about/page.tsx
import { UniversalPage, pageConfigs } from '../components/Templates/UniversalPage';

export const metadata = {
  title: 'About Z-Beam',
  description: 'Learn about Z-Beam&apos;s mission, team, and expertise in laser cleaning technology.'
};

// Default export - the page component
export default async function AboutPage() {
  return <UniversalPage {...pageConfigs.about} />;
}
