// app/components/mdx.tsx

/**
 * This file configures how MDX (Markdown with JSX) content is rendered in your Next.js application.
 *
 * In the Next.js App Router, components are Server Components by default.
 * This `CustomMDX` component acts as a wrapper around `next-mdx-remote/rsc` (RSC stands for React Server Components),
 * allowing your MDX content to be processed and initially rendered on the server for better performance and SEO.
 *
 * It defines custom components (like `h1` through `h6`, `Image`, `a`, `code`, `Table`, `ChartComponent`)
 * that will be used when parsing and displaying your .mdx files. This ensures a consistent
 * and rich rendering experience for your markdown content.
 *
 * Key features:
 * - **Server-Side Rendering (SSR) for MDX:** Leveraging `MDXRemote` for efficient content delivery.
 * - **Custom Component Mapping:** Provides specific React components for various MDX elements.
 * - **Client Component Integration:** Uses `next/dynamic` with `ssr: false` to seamlessly
 * include interactive client-side components (like `ChartComponent`) within server-rendered MDX.
 * This means `ChartComponent` will only load and execute on the client browser.
 * - **Slugification for Headings:** Automatically generates unique IDs for headings, enabling
 * anchor links (table of contents, direct section linking).
 *
 * This file itself does NOT need a `"use client"` directive because `MDXRemote` is designed
 * to be used within Server Components. Only the components it imports and renders
 * that *directly* use client-side features (like `useState`, `useEffect`, or `browser APIs`)
 * need to be marked with `"use client"` or dynamically imported with `ssr: false`.
 */

import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { highlight } from 'sugar-high';
import React from 'react';
import dynamic from 'next/dynamic'; // Import next/dynamic

// Dynamically import ChartComponent as a Client Component
// This tells Next.js to only load and render this component on the client side.
const ChartComponent = dynamic(() => import('./ChartComponent'), {
  ssr: false, // This is crucial: prevent server-side rendering of this component
  loading: () => <p>Loading chart...</p>, // Optional: A loading state while the component loads
});


function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

// Ensure ChartComponent is included here
let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
  ChartComponent: ChartComponent, // Add your dynamically imported ChartComponent here
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}