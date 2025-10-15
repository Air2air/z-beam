// tests/__mocks__/MarkdownRenderer.tsx
// Mock for MarkdownRenderer component to avoid react-markdown ES module issues

import React from 'react';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`} data-testid="markdown-renderer">
      {content}
    </div>
  );
}

export default MarkdownRenderer;
