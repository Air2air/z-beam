// app/components/breadcrumbs.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BreadcrumbItem, BreadcrumbsProps } from "../types";

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  // Split the pathname into segments and filter out empty strings (e.g., from leading slash)
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Define a set of known "material" slugs (or a more robust way to identify material pages)
  // For a dynamic site, you might pass a prop or use context/global state
  // to tell the breadcrumb component if the current page is an "material".
  // For now, we'll assume any top-level path that ISN'T a known static route (like /about, /contact)
  // is an material. Or, if you have a list of all material slugs available client-side,
  // you could check if `segments[0]` exists in that list.
  //
  // A more robust approach might involve:
  // 1. Passing a `isMaterialPage: boolean` prop from the material page.
  // 2. Having a `getMaterialSlugsClientSide` utility (less efficient).
  // 3. Using a `context` provider at the layout level that marks if it's an material route.
  //
  // For simplicity and assuming most top-level dynamic routes are materials:
  const knownStaticTopLevelRoutes = new Set([
    "about",
    "contact",
    // Add any other static top-level routes here that should NOT be considered materials
  ]);

  let allBreadcrumbs: BreadcrumbItem[] = [{ href: "/", label: "Home" }];

  let currentPathAccumulator = ""; // To build hrefs correctly

  segments.forEach((segment, index) => {
    currentPathAccumulator += `/${segment}`;

    // Determine if "Materials" needs to be inserted
    // This logic assumes:
    // 1. The current segment is the first one after home.
    // 2. The segment is NOT a known static top-level route.
    // 3. We haven't already inserted "Materials".
    const isFirstSegment = index === 0;
    const isNotStaticRoute = !knownStaticTopLevelRoutes.has(segment);
    const articlesAlreadyInserted = allBreadcrumbs.some(crumb => crumb.label === "Articles");

    if (isFirstSegment && isNotStaticRoute && !articlesAlreadyInserted) {
      // Insert "Articles" before the actual slug
      allBreadcrumbs.push({ href: "/articles", label: "Articles" });
    }

    // Generate the label (e.g., "my-material" -> "My Material")
    const label = segment
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    allBreadcrumbs.push({ href: currentPathAccumulator, label });
  });

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
            ) : crumb.href ? (
              // Other items are links (only if href exists)
              <Link
                href={crumb.href}
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-200 dark:hover:text-white"
              >
                {crumb.label}
              </Link>
            ) : (
              // Item without href (fallback to span)
              <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}