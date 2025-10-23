/**
 * @component ApplicationsList
 * @purpose Displays industry applications and use cases for materials
 * @dependencies @/types (ApplicationsListProps)
 * @related Layout.tsx
 * @complexity Simple (displays application badges with icons)
 * @aiContext Pass frontmatter.applications array. Component renders applications
 *           as badges with industry-specific icons.
 */
// app/components/ApplicationsList/ApplicationsList.tsx
"use client";

import { SectionTitle } from '../SectionTitle/SectionTitle';

export interface ApplicationsListProps {
  applications: string[];
  className?: string;
  showTitle?: boolean;
  title?: string;
  materialName?: string;
}

// Industry icon mapping
const getIndustryIcon = (application: string) => {
  const app = application.toLowerCase();
  
  if (app.includes('aerospace') || app.includes('aviation')) {
    return '✈️';
  }
  if (app.includes('automotive') || app.includes('vehicle')) {
    return '🚗';
  }
  if (app.includes('medical') || app.includes('healthcare')) {
    return '⚕️';
  }
  if (app.includes('electronics') || app.includes('electrical')) {
    return '⚡';
  }
  if (app.includes('marine') || app.includes('ship')) {
    return '⚓';
  }
  if (app.includes('architecture') || app.includes('building') || app.includes('construction')) {
    return '🏗️';
  }
  if (app.includes('art') || app.includes('sculpture') || app.includes('cultural')) {
    return '🎨';
  }
  if (app.includes('energy') || app.includes('power')) {
    return '⚡';
  }
  if (app.includes('manufacturing') || app.includes('industrial')) {
    return '🏭';
  }
  if (app.includes('packaging')) {
    return '📦';
  }
  if (app.includes('food') || app.includes('beverage')) {
    return '🍽️';
  }
  if (app.includes('defense') || app.includes('military')) {
    return '🛡️';
  }
  
  return '🔧'; // Default industrial icon
};

export function ApplicationsList({
  applications,
  className = '',
  showTitle = true,
  title = 'Industry Applications',
  materialName
}: ApplicationsListProps) {
  if (!applications || applications.length === 0) return null;

  return (
    <section 
      className={`applications-list ${className}`}
      aria-labelledby="applications-heading"
    >
      {showTitle && (
        <SectionTitle 
          title={title}
          subtitle={materialName ? `Industries and sectors where ${materialName} laser cleaning is commonly applied` : undefined}
          id="applications-heading"
        />
      )}

      <div className="applications-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {applications.map((application, index) => (
          <div
            key={`${application}-${index}`}
            className="application-badge group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl" role="img" aria-hidden="true">
                {getIndustryIcon(application)}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {application}
              </span>
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Additional context */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        {applications.length} {applications.length === 1 ? 'industry' : 'industries'} utilize laser cleaning technology for this material
      </div>
    </section>
  );
}
