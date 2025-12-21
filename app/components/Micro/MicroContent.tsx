// app/components/Micro/MicroContent.tsx
"use client";

import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { useEffect, useRef } from 'react';
import { FrontmatterType } from '@/types';
import { SITE_CONFIG } from '@/app/config/site';

interface MicroContentProps {
  before: string;
  after: string;
  content: string;
  materialName?: string;
  frontmatter?: FrontmatterType;
  seoData?: {
    description?: string;
    keywords?: string[];
    author?: string;
  };
}

export default function MicroContent({
  before: _before,
  after: _after,
  content,
  materialName: _materialName,
  frontmatter,
  seoData,
}: MicroContentProps) {
  const microTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const transformParagraphs = () => {
      if (microTextRef.current) {
        // Remove any existing markdown wrapper div to prevent nesting
        const markdownDiv = microTextRef.current.querySelector('div');
        if (markdownDiv && markdownDiv.children.length > 0) {
          // Move children up one level and remove the wrapper
          const children = Array.from(markdownDiv.children);
          children.forEach(child => microTextRef.current!.appendChild(child));
          markdownDiv.remove();
        }
        
        const paragraphs = microTextRef.current.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
          if (index === 0) {
            const div = document.createElement('div');
            div.className = 'micro-before mb-3';
            div.innerHTML = p.innerHTML;
            div.setAttribute('itemProp', 'before');
            p.replaceWith(div);
          } else if (index === 1) {
            const div = document.createElement('div');
            div.className = 'micro-after';
            div.innerHTML = p.innerHTML;
            div.setAttribute('itemProp', 'after');
            p.replaceWith(div);
          }
        });
      }
    };

    if (microTextRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedNode = mutation.addedNodes[0] as Element;
            if (addedNode.nodeName === 'DIV') {
              setTimeout(transformParagraphs, 0);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(microTextRef.current, {
        childList: true,
        subtree: true
      });

      const timeoutId = setTimeout(transformParagraphs, 10);

      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [content]);

  return (
    <article 
      ref={microTextRef} 
      itemScope 
      itemType={`${SITE_CONFIG.schema.context}/TechnicalArticle`}
      role="article"
      aria-labelledby="micro-content"
    >
      <meta itemProp="description" content={seoData?.description || frontmatter?.description || "Laser cleaning surface analysis"} />
      {seoData?.keywords && <meta itemProp="keywords" content={seoData.keywords.join(', ')} />}
      {seoData?.author && <meta itemProp="author" content={typeof seoData.author === 'string' ? seoData.author : (seoData.author as any)?.name || 'Unknown Author'} />}
      <MarkdownRenderer content={content} />
    </article>
  );
}
