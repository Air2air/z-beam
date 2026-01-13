/**
 * @module markdown
 * @purpose Simple markdown to HTML conversion for section descriptions
 * @dependencies None (pure string manipulation for basic markdown)
 * @aiContext Use renderMarkdown() to convert markdown text to HTML.
 *           Supports: headings (###), bold (**text**), numbered lists, line breaks.
 */

/**
 * Convert basic markdown to HTML
 * Supports:
 * - Headings: ### Heading
 * - Bold: **text**
 * - Numbered lists: 1. Item
 * - Line breaks
 */
export function renderMarkdown(markdown: string | undefined | null): string {
  if (!markdown || typeof markdown !== 'string') return '';

  let html = markdown;

  // Convert ### headings to <h3>
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mb-2">$1</h3>');
  
  // Convert ## headings to <h2>
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>');
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert numbered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 mb-2">$1</li>');
  
  // Wrap consecutive <li> items in <ol>
  html = html.replace(/(<li class="ml-6 mb-2">.*?<\/li>\n?)+/gs, (match) => {
    return `<ol class="list-decimal mb-4">${match}</ol>`;
  });
  
  // Convert line breaks (but not inside lists)
  html = html.replace(/\n(?!<\/?(li|ol|h[123]))/g, '<br />');
  
  // Clean up extra breaks around lists and headings
  html = html.replace(/<br \/>\s*(<\/?(?:ol|h[123]))/g, '$1');
  html = html.replace(/(<\/?(?:ol|h[123])>)\s*<br \/>/g, '$1');

  return html;
}

/**
 * Strip markdown formatting and return plain text
 * Useful when you don't want to render markdown at all
 */
export function stripMarkdown(markdown: string | undefined | null): string {
  if (!markdown || typeof markdown !== 'string') return '';

  let text = markdown;

  // Remove headings markers
  text = text.replace(/^#{1,6}\s+/gm, '');
  
  // Remove bold markers
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  
  // Remove numbered list markers
  text = text.replace(/^\d+\.\s+/gm, '');
  
  // Remove word count
  text = text.replace(/\(Word count: \d+\)/g, '');

  return text.trim();
}
