import type { Metadata } from 'next/types';
import SocialDashboardClient from './SocialDashboardClient';

export const metadata: Metadata = {
  title: 'Social Dashboard | Z-Beam',
  description: 'Create, manage, and upload social media posts and images from one panel.'
};

export default function SocialDashboardPage(): JSX.Element {
  return <SocialDashboardClient />;
}
