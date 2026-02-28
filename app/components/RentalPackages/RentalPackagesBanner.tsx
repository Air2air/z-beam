// app/components/RentalPackages/RentalPackagesBanner.tsx
import Link from 'next/link';
import { SITE_CONFIG } from '@/app/config/site';

export interface RentalPackagesBannerProps {
  variant?: 'compact' | 'full';
}

/**
 * Rental Pricing Banner Component
 * 
 * Displays rental package information with link to rental page.
 * Can be placed at top of static pages for quick rental info access.
 */
export function RentalPackagesBanner({ variant = 'compact' }: RentalPackagesBannerProps) {
  const { packages, minimumHours } = SITE_CONFIG.pricing.equipmentRental;
  const residentialRate = packages.residential.hourlyRate;
  const industrialRate = packages.industrial.hourlyRate;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <svg 
                className="w-8 h-8 text-blue-100" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7" 
                />
              </svg>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Equipment Rental</h2>
                <p className="text-sm text-blue-100">{minimumHours}-hour minimum</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">Residential ${residentialRate}/hr • Industrial ${industrialRate}/hr</div>
                <div className="text-sm text-blue-100">Professional laser cleaning equipment</div>
              </div>
            </div>
          </div>
          
          <Link
            href="/rental"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
          >
            Rental Info
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
