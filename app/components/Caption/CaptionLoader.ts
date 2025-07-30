// app/components/Caption/CaptionLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { CaptionConfig, DEFAULT_CAPTION_CONFIG } from './CaptionConfig';
import { FrontmatterData } from '@/app/utils/frontmatterLoader';

export interface CaptionData {
  content: string;
  config: CaptionConfig;
}

// Configure marked for captions (inline formatting)
marked.setOptions({
  gfm: true,
  breaks: true, // Allow line breaks in captions
});

export async function loadCaptionData(slug: string, frontmatter: FrontmatterData | null): Promise<CaptionData | null> {
  try {
    // Load caption content
    const captionPath = path.join(
      process.cwd(),
      'content',
      'components',
      'caption',
      `${slug}.md`
    );

    if (!fs.existsSync(captionPath)) {
      console.log(`No caption file found for slug: ${slug}`);
      return null;
    }

    const fileContent = fs.readFileSync(captionPath, 'utf8');
    const { content } = matter(fileContent);
    
    if (!content || content.trim().length === 0) {
      console.log(`Empty caption content for slug: ${slug}`);
      return null;
    }

    // Convert markdown to HTML - await the Promise
    const rawHtml = await marked(content.trim());
    
    // Clean up the HTML - captions should be single paragraphs
    const htmlContent = rawHtml
      .replace(/<!-- Category:.*?-->/g, '') // Remove comments
      .replace(/^\s*\n/gm, '') // Remove empty lines
      .replace(/<p>/g, '') // Remove wrapping paragraphs
      .replace(/<\/p>/g, '')
      .replace(/\n/g, ' ') // Convert line breaks to spaces
      .trim();

    // Validate caption length
    const textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML for length check
    if (textContent.length > 500) {
      console.warn(`Caption for ${slug} is quite long (${textContent.length} characters)`);
    }

    // Extract config from frontmatter
    const config: CaptionConfig = {
      ...DEFAULT_CAPTION_CONFIG,
      ...frontmatter?.captionConfig,
    };

    return {
      content: htmlContent,
      config,
    };
  } catch (error) {
    console.error(`Error loading caption data for ${slug}:`, error);
    return null;
  }
}

// Helper function to truncate caption if needed
export function truncateCaption(content: string, maxLength: number): string {
  const textContent = content.replace(/<[^>]*>/g, '');
  
  if (textContent.length <= maxLength) {
    return content;
  }
  
  // Find last complete word before maxLength
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
  
  return `${finalText}...`;
}