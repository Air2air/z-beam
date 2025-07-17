// app/mdx-provider.tsx
"use client";

import { MDXProvider } from '@mdx-js/react';
import mdxComponents from './components/Layout/mdx-components';

export function MDXLayout({ children }: { children: React.ReactNode }) {
  return (
    <MDXProvider components={mdxComponents}>
      <div className="mdx-content">
        {children}
      </div>
    </MDXProvider>
  );
}
