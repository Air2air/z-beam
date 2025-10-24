import { SITE_CONFIG } from './utils/constants';
import Link from 'next/link';

export const metadata = {
  title: `404 - Page Not Found | ${SITE_CONFIG.shortName}`,
  description: 'The page you are looking for does not exist.'
};

export default function NotFound() {
  return (
    <section className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-2xl px-4">
        <h1 className="mb-4 text-4xl md:text-6xl font-bold tracking-tight">
          404
        </h1>
        <h2 className="mb-6 text-xl md:text-2xl text-gray-300">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            View Services
          </Link>
        </div>
      </div>
    </section>
  );
}
