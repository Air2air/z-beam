// app/components/breadcrumbs.tsx
"use client"; // This component uses client-side hooks

import { usePathname } from "next/navigation";
import Link from "next/link";

export function Breadcrumbs() {
  const pathname = usePathname();
  // Split the pathname into segments and filter out empty strings (e.g., from leading slash)
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Build the breadcrumbs array
  const breadcrumbs = segments.map((segment, index) => {
    // Construct the href for each segment
    const href = "/" + segments.slice(0, index + 1).join("/");
    // Make the label more readable (e.g., "my-article" -> "My Article")
    const label = segment
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { href, label };
  });

  // Add a "Home" breadcrumb at the beginning
  const homeCrumb = { href: "/", label: "Home" };
  const allBreadcrumbs = [homeCrumb, ...breadcrumbs];

  return (
    <nav className="flex py-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {allBreadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            {index === allBreadcrumbs.length - 1 ? (
              // Last item is the current page, not a link
              <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                {crumb.label}
              </span>
            ) : (
              // Other items are links
              <Link
                href={crumb.href}
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-200 dark:hover:text-white"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
