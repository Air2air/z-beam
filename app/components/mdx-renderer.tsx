// app/components/mdx-renderer.tsx
"use client";

import React, { useMemo } from 'react';
import { MDXProvider } from '@mdx-js/react';
import mdxComponents from './mdx-components';

interface MDXRendererProps {
  code: string;
  components?: Record<string, React.ComponentType<any>>;
}

export function MDXRenderer({ code, components = {} }: MDXRendererProps) {
  const mergedComponents = useMemo(() => {
    return { ...mdxComponents, ...components };
  }, [components]);

  // For static content loaded via @next/mdx, the code is already compiled
  // and can be rendered directly as a component
  if (typeof code === 'function') {
    const Content = code as React.ComponentType<any>;
    return (
      <MDXProvider components={mergedComponents}>
        <Content />
      </MDXProvider>
    );
  }

  // For now, provide a fallback for when content isn't available
  return (
    <div className="mdx-content">
      <p>No content available</p>
    </div>
  );
}

// Direct replacement for CustomMDX to make migration easier
export function CustomMDX(props: any) {
  // For compatibility with existing code
  if (props.source) {
    return (
      <div className="mdx-content" 
        dangerouslySetInnerHTML={{ __html: props.source }} />
    );
  }
  
  // If content is a React component (compiled MDX), render it
  if (typeof props.code === 'function') {
    return <MDXRenderer code={props.code} components={props.components} />;
  }
  
  // Fallback to displaying the props if we don't have compiled MDX
  return (
    <div className="mdx-content">
      <p>Content is loading or not available</p>
    </div>
  );
}
