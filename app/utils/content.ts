/**
 * Content Utility Functions
 * For parsing and processing content
 */

interface ParsedContent {
  content: string;
  metadata: {
    title: string;
    wordCount: number;
  };
}

export function parseMarkdown(content: string): ParsedContent {
  // Simple markdown parsing
  const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  const lines = content.split('\n');
  const title = lines[0]?.replace(/^#\s*/, '') || 'Untitled';
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  return {
    content: processedContent,
    metadata: {
      title,
      wordCount
    }
  };
}

export function extractMetadata(content: string): Record<string, string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return {};
  }
  
  const frontmatter = frontmatterMatch[1];
  const metadata: Record<string, string> = {};
  
  frontmatter.split('\n').forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      metadata[key.trim()] = values.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return metadata;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
