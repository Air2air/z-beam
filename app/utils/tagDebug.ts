// Debug utility for the tag system
import { getAllArticles } from './contentUtils';
import { invalidateTagCache } from './tags';

export async function debugTagSystem() {
  // Invalidate the cache to ensure fresh data
  await invalidateTagCache();
  
  // Get all articles
  const articles = await getAllArticles();
  
  // Check for articles with author information
  const articlesWithAuthor = articles.filter(article => article.author && article.author.author_name);
  
  // Check for any frontmatter with author
  const articlesWithFrontmatterAuthor = articles.filter(article => 
    article.author && article.author.author_name
  );
  
  // Return debug information instead of logging
  return {
    totalArticles: articles.length,
    articlesWithAuthor: articlesWithAuthor.length,
    articlesWithFrontmatterAuthor: articlesWithFrontmatterAuthor.length,
    sampleAuthors: articlesWithAuthor.slice(0, 5).map(article => ({
      title: article.title || article.name || article.slug,
      slug: article.slug,
      author: article.author?.author_name || 'Unknown',
      tags: article.tags || []
    }))
  };
}
