// app/utils/yamlSanitizer.ts
// Utility to sanitize YAML frontmatter and fix common formatting issues

import matter from 'gray-matter';
import { logger } from './logger';

/**
 * Sanitizes YAML frontmatter content to fix common formatting issues
 */
export function sanitizeYamlContent(content: string): string {
  try {
    // Split content into frontmatter and body
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      return content; // No frontmatter found
    }
    
    const [, yamlContent, markdownBody] = frontmatterMatch;
    
    // Fix common YAML formatting issues
    let sanitizedYaml = yamlContent
      // Fix nested quotes - remove inner quotes if they're causing issues
      .replace(/:\s*["']([^"']*["'][^"']*["'][^"']*)["']/g, (match, innerContent) => {
        // Clean up nested quotes by escaping them properly
        const cleaned = innerContent.replace(/["']/g, '\\"');
        return `: "${cleaned}"`;
      })
      // Fix malformed quote patterns like useCase: '"Removal of biological...
      .replace(/:\s*["']?["']([^"'\n]*)/g, ': "$1"')
      // Fix sequence entries with bad indentation
      .replace(/^(\s*)(\w+):\s*([^"\n]*)/gm, (match, indent, key, value) => {
        // Skip if this looks like it's already properly formatted
        if (value.startsWith('"') && value.endsWith('"')) {
          return match;
        }
        
        // If value contains special characters or quotes, escape and quote it
        if (value.includes('"') || value.includes("'") || value.includes(':') || value.includes('#')) {
          const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim();
          return `${indent}${key}: "${escapedValue}"`;
        }
        
        return match;
      })
      // Fix sequence list items that aren't properly indented
      .replace(/^(\s*)([-])\s*(\w+):\s*([^\n]+)$/gm, (match, indent, dash, key, value) => {
        // Ensure proper indentation for sequence items
        const properIndent = indent.length < 2 ? '  ' : indent;
        
        // Clean and quote the value if needed
        if (value.includes('"') || value.includes("'") || value.includes(':')) {
          const cleanValue = value.replace(/^["']|["']$/g, '').replace(/"/g, '\\"');
          return `${properIndent}${dash} ${key}: "${cleanValue}"`;
        }
        
        return `${properIndent}${dash} ${key}: ${value}`;
      })
      // Remove any lines that are just quotes or malformed
      .replace(/^\s*["']\s*$/gm, '')
      // Fix lines that start with quotes but aren't key-value pairs
      .replace(/^\s*["']([^"'\n:]+)["']\s*$/gm, '# $1');
    
    return `---\n${sanitizedYaml}\n---\n${markdownBody}`;
  } catch (error) {
    logger.warn('Failed to sanitize YAML content, returning original', { error: error.message });
    return content;
  }
}

/**
 * Safe wrapper around gray-matter that includes YAML sanitization
 */
export function safeMatterParse(content: string, options?: any): {
  data: { [key: string]: any };
  content: string;
  excerpt: string;
  orig: string;
} {
  try {
    // First try parsing as-is
    const result = matter(content, options);
    return {
      data: result.data,
      content: result.content,
      excerpt: result.excerpt || '',
      orig: String(result.orig || content)
    };
  } catch (error) {
    logger.warn('Initial YAML parsing failed, attempting sanitization', { error: error.message });
    
    try {
      // Try with sanitized content
      const sanitizedContent = sanitizeYamlContent(content);
      const result = matter(sanitizedContent, options);
      return {
        data: result.data,
        content: result.content,
        excerpt: result.excerpt || '',
        orig: String(result.orig || content)
      };
    } catch (sanitizationError) {
      logger.error('YAML sanitization failed', sanitizationError);
      
      // Last resort: try to extract just the markdown content without frontmatter
      try {
        const frontmatterMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n?([\s\S]*)$/);
        const markdownContent = frontmatterMatch ? frontmatterMatch[1] : content;
        
        logger.warn('Falling back to content-only parsing due to YAML errors');
        
        return {
          data: {},
          content: markdownContent,
          excerpt: '',
          orig: content
        };
      } catch (fallbackError) {
        // Ultimate fallback - return the content as-is
        logger.error('All parsing attempts failed, returning raw content', fallbackError);
        
        return {
          data: {},
          content: content,
          excerpt: '',
          orig: content
        };
      }
    }
  }
}
