// app/utils/yamlSanitizer.ts
// Utility to sanitize YAML frontmatter and fix common formatting issues

import matter from 'gray-matter';

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
    
    // Fix only specific YAML formatting issues without breaking valid content
    const sanitizedYaml = yamlContent
      // Fix unquoted array values with special characters like [>300°C] -> [">300°C"]
      .replace(/(\[)([^"\]\[]*[>°][^"\]\[]*)(\])/g, (match, openBracket, content, closeBracket) => {
        // Only fix if content contains special characters and isn't already quoted
        if (content.includes('>') || content.includes('°')) {
          const trimmed = content.trim();
          if (!trimmed.startsWith('"') && !trimmed.endsWith('"')) {
            return `${openBracket}"${trimmed}"${closeBracket}`;
          }
        }
        return match;
      });
    
    return `---\n${sanitizedYaml}\n---\n${markdownBody}`;
  } catch (error) {
    console.warn('Failed to sanitize YAML content, returning original', { error: (error as Error).message });
    return content;
  }
}

/**
 * Safe wrapper around gray-matter that includes YAML sanitization
 */
export function safeMatterParse(content: string, options?: Record<string, unknown>): {
  data: { [key: string]: unknown };
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
    console.warn('Initial YAML parsing failed, attempting sanitization', { error: (error as Error).message });
    
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
      console.error('YAML sanitization failed', sanitizationError);
      
      // Last resort: try to extract just the markdown content without frontmatter
      try {
        const frontmatterMatch = content.match(/^---\s*\n[\s\S]*?\n---\s*\n?([\s\S]*)$/);
        const markdownContent = frontmatterMatch ? frontmatterMatch[1] : content;
        
        console.warn('Falling back to content-only parsing due to YAML errors');
        
        return {
          data: {},
          content: markdownContent,
          excerpt: '',
          orig: content
        };
      } catch (fallbackError) {
        // Ultimate fallback - return the content as-is
        console.error('All parsing attempts failed, returning raw content', fallbackError);
        
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
