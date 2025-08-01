// app/components/Base/MarkdownRenderer.tsx
import React from 'react';
import './styles.css';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  wrapperClassName?: string;
  prose?: boolean;
  withSyntaxHighlighting?: boolean;
  withTableStyles?: boolean;
  withLinkStyles?: boolean;
  optimizeImages?: boolean;
  externalLinksInNewTab?: boolean;
}

export function MarkdownRenderer({ 
  content,
  className = '',
  wrapperClassName = '',
  prose = true,
  withSyntaxHighlighting = false,
  withTableStyles = false,
  withLinkStyles = false,
  optimizeImages = false,
  externalLinksInNewTab = false
}: MarkdownRendererProps) {
  if (!content) return null;
  
  // Process content if needed based on options
  let processedContent = content;
  
  // Build classes based on props
  const proseClasses = prose ? 'prose dark:prose-invert' : '';
  const syntaxClass = withSyntaxHighlighting ? 'with-syntax-highlighting' : '';
  const tableClass = withTableStyles ? 'with-table-styles' : '';
  const linkClass = withLinkStyles ? 'with-link-styles' : '';
  const imageClass = optimizeImages ? 'with-optimized-images' : '';
  
  const combinedClasses = [
    proseClasses,
    syntaxClass,
    tableClass,
    linkClass,
    imageClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`markdown-wrapper ${wrapperClassName}`}>
      <div 
        className={combinedClasses}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}