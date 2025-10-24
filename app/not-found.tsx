import { SITE_CONFIG } from './utils/constants';
import Link from 'next/link';

export const metadata = {
  title: `404 - Page Not Found | ${SITE_CONFIG.shortName}`,
  description: 'The page you are looking for does not exist.'
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-900 px-4 -mt-0">
      <div className="text-center max-w-2xl z-10">
        <h1 className="mb-4 text-6xl md:text-8xl font-bold tracking-tight text-white">
          404
        </h1>
        <h2 className="mb-6 text-2xl md:text-3xl font-semibold text-gray-100">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            Go to Home
          </Link>
          <Link
            href="/services"
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            View Services
          </Link>
        </div>
      </div>
    </div>
  );
}
