// app/utils/authorParser.ts
// Utility for parsing author content from markdown

export interface AuthorData {
  author_name: string;
  credentials: string;
  author_country: string;
  avatar: string;
}

/**
 * Parse author information from markdown content
 */
export function parseAuthorContent(content: string): AuthorData | null {
  if (!content) return null;
  
  try {
    // Content might be in HTML format after markdown processing
    // Try HTML patterns first, then fallback to markdown patterns
    
    // Extract author name (HTML format: <strong>Name</strong>, Ph.D.)
    let nameMatch = content.match(/<strong>(.*?)<\/strong>,?\s*Ph\.D\./);
    if (!nameMatch) {
      // Fallback to markdown format (**Name**, Ph.D.)
      nameMatch = content.match(/\*\*(.*?)\*\*,?\s*Ph\.D\./);
    }
    const authorName = nameMatch ? nameMatch[1].trim() : null;
    
    // Extract specialization (HTML: <em>text</em> or markdown: *text*)
    let credentialsMatch = content.match(/<em>(.*?)<\/em>/);
    if (!credentialsMatch) {
      credentialsMatch = content.match(/Ph\.D\.\s*\n\s*\*(.*?)\*/);
    }
    const credentials = credentialsMatch ? credentialsMatch[1].trim() : '';
    
    // Extract country (HTML: <strong>Country</strong>: text or markdown: **Country**: text)
    let countryMatch = content.match(/<strong>Country<\/strong>:\s*(.*?)<\/p>/);
    if (!countryMatch) {
      countryMatch = content.match(/<strong>Country<\/strong>:\s*(.*?)$/m);
      if (!countryMatch) {
        countryMatch = content.match(/\*\*Country\*\*:\s*(.*?)$/m);
      }
    }
    const country = countryMatch ? countryMatch[1].trim() : '';
    
    // Extract avatar path (HTML: <code>path</code> or markdown: `path`)
    let avatarMatch = content.match(/<code>(.*?)<\/code>/);
    if (!avatarMatch) {
      avatarMatch = content.match(/\*\*Author Image\*\*:\s*`(.*?)`/);
    }
    const avatar = avatarMatch ? avatarMatch[1].trim() : '';
    
    if (!authorName) {
      console.warn('No author name found in content:', content.substring(0, 100));
      return null;
    }
    
    return {
      author_name: authorName,
      credentials,
      author_country: country,
      avatar,
    };
  } catch (error) {
    console.error('Error parsing author content:', error);
    return null;
  }
}

/**
 * Validate that author data has required fields
 */
export function validateAuthorData(author: AuthorData): boolean {
  return Boolean(author.author_name && author.author_name.trim().length > 0);
}
