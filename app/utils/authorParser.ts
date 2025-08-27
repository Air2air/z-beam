// app/utils/authorParser.ts
// Simplified utility for parsing author content from markdown

import { AuthorData } from '../../types/components/author';

// Re-export for convenience
export type { AuthorData } from '../../types/components/author';

/**
 * Parse author information from markdown content
 * Expected format:
 * Line 1: Author Name
 * Line 2: Ph.D. (credentials)
 * Line 3: Specialization
 * Line 4: Country
 * Line 5: Avatar path
 */
export function parseAuthorContent(content: string): AuthorData | null {
  if (!content?.trim()) return null;
  
  try {
    // Clean content: remove HTML tags, normalize whitespace, and split into lines
    const cleanContent = content
      .replace(/<[^>]*>/g, '\n')  // Replace HTML tags with newlines
      .replace(/&nbsp;/g, ' ')    // Replace non-breaking spaces
      .replace(/\r\n/g, '\n')     // Normalize Windows line endings
      .replace(/\r/g, '\n');      // Normalize old Mac line endings
    
    let lines = cleanContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // If we only got one line, it might be concatenated - try to split by common patterns
    if (lines.length === 1) {
      const singleLine = lines[0];
      
      // Try to split by recognizable patterns
      // Pattern: Name + Ph.D. + Field + Country + Image path
      const parts: string[] = [];
      
      // Extract image path first (most reliable)
      const imageMatch = singleLine.match(/(.*?)(\/images\/author\/[^\s]+\.jpg)$/);
      if (imageMatch) {
        const beforeImage = imageMatch[1].trim();
        const imagePath = imageMatch[2];
        
        // Now split the remaining content
        // Look for Ph.D. to separate name from rest
        const phdMatch = beforeImage.match(/^(.*?)(Ph\.D\.)(.*)$/);
        if (phdMatch) {
          const name = phdMatch[1].trim();
          const phd = phdMatch[2];
          const remaining = phdMatch[3].trim();
          
          // Split remaining by common country names or patterns
          const countryMatch = remaining.match(/^(.*?)(Taiwan|Italy|China|USA|Germany|France|Japan|Korea|UK|Canada|Australia)$/);
          if (countryMatch) {
            const field = countryMatch[1].trim();
            const country = countryMatch[2];
            
            parts.push(name, phd, field, country, imagePath);
          } else {
            // Fallback: assume last word before image is country
            const words = remaining.trim().split(/\s+/);
            if (words.length >= 2) {
              const country = words.pop() || '';
              const field = words.join(' ');
              parts.push(name, phd, field, country, imagePath);
            }
          }
        }
      }
      
      if (parts.length >= 5) {
        lines = parts;
      }
    }
    
    if (lines.length < 5) {
      console.warn('Author content has insufficient lines:', lines.length, lines);
      return null;
    }
    
    // Expected format: exactly 5 lines
    const [name, credentials, specialization, country, avatar] = lines;
    
    if (!name) return null;
    
    const authorData: AuthorData = {
      author_name: name,
    };
    
    // Add optional fields if they exist and are meaningful
    if (credentials && credentials !== name) {
      authorData.credentials = credentials;
    }
    
    if (specialization && specialization !== credentials && specialization !== name) {
      authorData.specialties = [specialization];
    }
    
    if (country && country !== specialization && !country.startsWith('/images/')) {
      authorData.author_country = country;
    }
    
    if (avatar && avatar.startsWith('/images/')) {
      authorData.avatar = avatar;
    }
    
    return authorData;
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
