// Debug utility for the tag system
import { getAllArticles } from './contentUtils';
import { invalidateTagCache } from './tags';

export async function debugTagSystem() {
  console.log("🔍 Tag System Debug");
  console.log("==================");
  
  // Invalidate the cache to ensure fresh data
  await invalidateTagCache();
  console.log("✅ Tag cache invalidated");
  
  // Get all articles
  const articles = await getAllArticles();
  console.log(`📚 Found ${articles.length} articles`);
  
  // Check for articles with author information
  const articlesWithAuthor = articles.filter(article => article.author && article.author.author_name);
  console.log(`👤 Found ${articlesWithAuthor.length} articles with author information`);
  
  // Print the first 5 articles with author information
  console.log("\n📝 Sample Articles with Author Info:");
  articlesWithAuthor.slice(0, 5).forEach((article, index) => {
    console.log(`\n[${index + 1}] ${article.title || article.name || article.slug}`);
    console.log(`   - Slug: ${article.slug}`);
    console.log(`   - Author: ${article.author?.author_name || 'Unknown'}`);
    console.log(`   - Tags: ${article.tags?.join(', ') || 'None'}`);
  });
  
  // Check for any frontmatter with author
  const articlesWithFrontmatterAuthor = articles.filter(article => 
    article.author && article.author.author_name
  );
  
  console.log(`\n📄 Found ${articlesWithFrontmatterAuthor.length} articles with author data`);
  
  // Print sample of frontmatter author data
  if (articlesWithFrontmatterAuthor.length > 0) {
    console.log("\n📝 Sample Author Data:");
    articlesWithFrontmatterAuthor.slice(0, 3).forEach((article, index) => {
      console.log(`\n[${index + 1}] ${article.title || article.name || article.slug}`);
      console.log(`   - Author Name: ${article.author?.author_name || 'Unknown'}`);
      console.log(`   - Author ID: ${article.author?.author_id || 'Unknown'}`);
    });
  }
  
  console.log("\n✅ Debug completed");
}
