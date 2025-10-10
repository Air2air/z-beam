// app/components/Base/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from 'react-markdown';
import { H1, H2, H3, H4, H5, H6, P, A, Strong, Em, UL, OL, LI, Code, Pre } from '../Typography';

export interface MarkdownRendererProps {
  content: string;
  convertMarkdown?: boolean;
}

export function MarkdownRenderer({
  content,
  convertMarkdown = true,
}: MarkdownRendererProps) {
  if (!content) return null;

  if (convertMarkdown) {
    return (
      <ReactMarkdown
        components={{
          h1: ({ children }) => <H1>{children}</H1>,
          h2: ({ children }) => <H2>{children}</H2>,
          h3: ({ children }) => <H3>{children}</H3>,
          h4: ({ children }) => <H4>{children}</H4>,
          h5: ({ children }) => <H5>{children}</H5>,
          h6: ({ children }) => <H6>{children}</H6>,
          p: ({ children }) => <P>{children}</P>,
          a: ({ href, children }) => <A href={href || '#'}>{children}</A>,
          strong: ({ children }) => <Strong>{children}</Strong>,
          em: ({ children }) => <Em>{children}</Em>,
          ul: ({ children }) => <UL>{children}</UL>,
          ol: ({ children }) => <OL>{children}</OL>,
          li: ({ children }) => <LI>{children}</LI>,
          code: ({ children }) => <Code>{children}</Code>,
          pre: ({ children }) => <Pre>{children}</Pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  return <div>{content}</div>;
}
