// app/components/mdx.tsx

import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';
import dynamic from 'next/dynamic';
import type { TableProps } from 'app/types';
import { slugify } from '../../utils/formatting';

// Use dynamic import with no SSR option in a separate client component
const ChartComponentWrapper = dynamic(() => import('../Chart/ChartComponentWrapper'), {
  loading: () => <div className="bg-gray-100 p-4 rounded text-center">Loading chart...</div>
});

// Table component for rendering MDX tables (e.g., laser cleaning metrics)
function Table({ data }: TableProps) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table className="content-table">
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

// CustomLink supports internal links (e.g., /materials/copper-laser-cleaning) and external links
function CustomLink({ href, children, ...props }: { href: string; children: React.ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith('#')) {
    return <a href={href} {...props}>{children}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

// RoundedImage uses next/image for optimized images with Cloudinary
function RoundedImage({ alt, ...props }: { alt: string; src: string; [key: string]: any }) {
  return <Image alt={alt} className="rounded-lg" {...props} />;
}

// Dynamic Heading component for h1–h6 with anchor links
function Heading({ level, children }: { level: number; children: React.ReactNode }) {
  const slug = slugify(children?.toString() || '');
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </Tag>
  );
}

const components = {
  h1: (props: any) => <Heading level={1} {...props} />,
  h2: (props: any) => <Heading level={2} {...props} />,
  h3: (props: any) => <Heading level={3} {...props} />,
  h4: (props: any) => <Heading level={4} {...props} />,
  h5: (props: any) => <Heading level={5} {...props} />,
  h6: (props: any) => <Heading level={6} {...props} />,
  Image: RoundedImage,
  a: CustomLink,
  Table,
  ChartComponent: ChartComponentWrapper,
};

export function CustomMDX(props: any) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
