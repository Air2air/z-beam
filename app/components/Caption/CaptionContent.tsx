// app/components/Caption/CaptionContent.tsx
"use client";

import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { useEffect, useRef } from 'react';
import { FrontmatterType } from './Caption';

interface CaptionContentProps {
  beforeText: string;
  afterText: string;
  content: string;
  materialName?: string;
  frontmatter?: FrontmatterType;
  seoData?: {
    description?: string;
    keywords?: string[];
    author?: string;
  };
}

export function CaptionContent({ content, beforeText, afterText, materialName, frontmatter, seoData }: CaptionContentProps) {
  const captionTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const transformParagraphs = () => {
      if (captionTextRef.current) {
        // Remove any existing markdown wrapper div to prevent nesting
        const markdownDiv = captionTextRef.current.querySelector('div');
        if (markdownDiv && markdownDiv.children.length > 0) {
          // Move children up one level and remove the wrapper
          const children = Array.from(markdownDiv.children);
          children.forEach(child => captionTextRef.current!.appendChild(child));
          markdownDiv.remove();
        }
        
        const paragraphs = captionTextRef.current.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
          if (index === 0) {
            const div = document.createElement('div');
            div.className = 'caption-before text-gray-300 mb-3';
            div.innerHTML = p.innerHTML;
            div.setAttribute('itemProp', 'beforeText');
            p.replaceWith(div);
          } else if (index === 1) {
            const div = document.createElement('div');
            div.className = 'caption-after text-gray-300';
            div.innerHTML = p.innerHTML;
            div.setAttribute('itemProp', 'afterText');
            p.replaceWith(div);
          }
        });
      }
    };

    if (captionTextRef.current) {
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

      observer.observe(captionTextRef.current, {
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
      ref={captionTextRef} 
      itemScope 
      itemType="https://schema.org/TechnicalArticle"
      role="article"
      aria-labelledby="caption-content"
    >
      <meta itemProp="description" content={seoData?.description || frontmatter?.description || "Laser cleaning surface analysis"} />
      {seoData?.keywords && <meta itemProp="keywords" content={seoData.keywords.join(', ')} />}
      {seoData?.author && <meta itemProp="author" content={typeof seoData.author === 'string' ? seoData.author : (seoData.author as any)?.name || 'Unknown Author'} />}
      <MarkdownRenderer content={content} />
    </article>
  );
}
