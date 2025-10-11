import { SITE_CONFIG } from './utils/constants';

export const metadata = {
  title: `404 - Page Not Found | ${SITE_CONFIG.shortName}`,
  description: 'The page you are looking for does not exist.'
};

export default function NotFound() {
  return (
    <section>
      <h1 className="mb-8 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
    </section>
  )
}
