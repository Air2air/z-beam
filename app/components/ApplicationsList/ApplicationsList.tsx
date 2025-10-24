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

import Link from "next/link";
import { SectionTitle } from "../SectionTitle/SectionTitle";

export interface ApplicationsListProps {
  applications: string[];
  className?: string;
  showTitle?: boolean;
  title?: string;
  materialName?: string;
}

// Industry icon mapping - Returns SVG path data
const getIndustryIcon = (application: string): JSX.Element => {
  const app = application.toLowerCase();
  const iconClass = "w-6 h-6 text-blue-600 dark:text-blue-400";

  // Aerospace/Aviation
  if (
    app.includes("aerospace") ||
    app.includes("aviation") ||
    app.includes("aircraft") ||
    app.includes("canopy")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    );
  }

  // Automotive
  if (app.includes("automotive") || app.includes("vehicle")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
      </svg>
    );
  }

  // Medical/Healthcare
  if (
    app.includes("medical") ||
    app.includes("healthcare") ||
    app.includes("pharmaceutical")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
      </svg>
    );
  }

  // Electronics/Semiconductor
  if (
    app.includes("electronics") ||
    app.includes("electrical") ||
    app.includes("semiconductor") ||
    app.includes("display")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        <path
          d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
          opacity="0.3"
        />
      </svg>
    );
  }

  // Marine/Naval
  if (
    app.includes("marine") ||
    app.includes("ship") ||
    app.includes("naval") ||
    app.includes("window")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" />
      </svg>
    );
  }

  // Architecture/Construction
  if (
    app.includes("architecture") ||
    app.includes("building") ||
    app.includes("construction") ||
    app.includes("facade")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
      </svg>
    );
  }

  // Cultural/Heritage/Museum
  if (
    app.includes("art") ||
    app.includes("sculpture") ||
    app.includes("cultural") ||
    app.includes("heritage") ||
    app.includes("museum") ||
    app.includes("conservation") ||
    app.includes("monument")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
      </svg>
    );
  }

  // Energy/Power/Solar
  if (
    app.includes("energy") ||
    app.includes("power") ||
    app.includes("solar") ||
    app.includes("renewable") ||
    app.includes("panel")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    );
  }

  // Manufacturing/Industrial
  if (
    app.includes("manufacturing") ||
    app.includes("industrial") ||
    app.includes("factory") ||
    app.includes("production") ||
    app.includes("fabrication")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 22H2V10l7 3v9h2v-9l7 3v6h2V10l-7-2.95V3h2l-4-2-4 2h2v4.53z" />
      </svg>
    );
  }

  // Food/Beverage
  if (
    app.includes("food") ||
    app.includes("beverage") ||
    app.includes("processing") ||
    app.includes("equipment")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
      </svg>
    );
  }

  // Defense/Military
  if (app.includes("defense") || app.includes("military")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    );
  }

  // Glass
  if (app.includes("glass")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3z" />
      </svg>
    );
  }

  // Research/Laboratory
  if (
    app.includes("research") ||
    app.includes("laboratory") ||
    app.includes("scientific")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2v2h1v14c0 2.21 1.79 4 4 4s4-1.79 4-4V4h1V2H7zm2 2h6v3h-2V5h-2v2H9V4zm0 5h6v9c0 1.1-.9 2-2 2s-2-.9-2-2V9z" />
      </svg>
    );
  }

  // Religious/Church
  if (
    app.includes("religious") ||
    app.includes("church") ||
    app.includes("temple")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 12.22V9l-5-2.5V5h2V3h-2V1h-2v2H9v2h2v1.5L6 9v3.22L2 14v8h9v-4c0-.55.45-1 1-1s1 .45 1 1v4h9v-8l-4-1.78zM11 20H4v-4.8l3-1.33V12l4-2v10zm9 0h-7v-2c0-1.65-1.35-3-3-3s-3 1.35-3 3v2H4v-1.49l7-3.11 7 3.11V20z" />
      </svg>
    );
  }

  // Educational
  if (
    app.includes("educational") ||
    app.includes("university") ||
    app.includes("school") ||
    app.includes("collection")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
      </svg>
    );
  }

  // Stone/Landscape
  if (
    app.includes("stone") ||
    app.includes("marble") ||
    app.includes("granite") ||
    app.includes("landscape")
  ) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" />
      </svg>
    );
  }

  // Interior Design
  if (app.includes("design") || app.includes("interior")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    );
  }

  // Archaeological
  if (app.includes("archaeological")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.48 12.35c-.29-.74-.84-1.29-1.54-1.52L8.41 8.77c-.75-.26-1.59-.02-2.07.63l-2.48 3.2c-.48.64-.51 1.51-.07 2.19l.9 1.39c.45.68 1.23 1.04 2.04.89l8.96-1.75c.77-.15 1.44-.71 1.71-1.43l.86-2.3c.26-.67.25-1.41-.01-2.08zM7.03 15.3l-1.5-.93 2-2.79 1.5.93-2 2.79z" />
      </svg>
    );
  }

  // Default industrial icon
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 22H2V10l7 3v9h2v-9l7 3v6h2V10l-7-2.95V3h2l-4-2-4 2h2v4.53z" />
    </svg>
  );
};

export function ApplicationsList({
  applications,
  className = "",
  showTitle = true,
  materialName,
  title = `${materialName} Industry Applications`,
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
          // subtitle={
          //   materialName
          //     ? `Industries and sectors where ${materialName} laser cleaning is commonly applied`
          //     : undefined
          // }
          id="applications-heading"
        />
      )}

      <div className="applications-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {applications.map((application, index) => (
          <Link
            key={`${application}-${index}`}
            href={`/search?q=${encodeURIComponent(application)}`}
            className="application-card group relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="flex-shrink-0">
                {getIndustryIcon(application)}
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                {application}
              </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-500 dark:bg-blue-600 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none" />
          </Link>
        ))}
      </div>

      {/* Additional context */}
      {/* <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        {applications.length}{" "}
        {applications.length === 1 ? "industry" : "industries"} utilize laser
        cleaning technology for this material
      </div> */}
    </section>
  );
}
