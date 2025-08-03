// app/tag-debug/tag-diagnostics/page.tsx
import { getAllArticles } from "@/app/utils/contentUtils";
import { articleMatchesTag } from "@/app/utils/tagUtils";
import { getArticlesWithTags, getAllUniqueTags, getTagCounts } from "@/app/utils/articleTagsUtils";

export default async function TagDiagnosticsPage() {
  // Get all articles with tags from the tags directory
  const articlesWithTags = await getArticlesWithTags();
  
  // Get all unique tags
  const allUniqueTags = await getAllUniqueTags();
  
  // Get tag counts
  const tagCounts = await getTagCounts();
  
  // Sort tags by count (descending)
  const sortedTags = [...allUniqueTags].sort((a, b) => 
    tagCounts[b] - tagCounts[a]
  );
  
  // Get articles without tags
  const articlesWithoutTags = articlesWithTags.filter(article => 
    !article.tags || article.tags.length === 0
  );
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tag Diagnostics</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Article Statistics</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Total articles: <strong>{articlesWithTags.length}</strong></li>
          <li>Articles with tags: <strong>{articlesWithTags.length - articlesWithoutTags.length}</strong></li>
          <li>Articles without tags: <strong>{articlesWithoutTags.length}</strong></li>
          <li>Unique tags: <strong>{allUniqueTags.length}</strong></li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Tag Counts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTags.map(tag => (
            <div key={tag} className="border rounded-md p-4">
              <span className="font-semibold">{tag}: </span>
              <span className={`${tagCounts[tag] > 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>
                {tagCounts[tag]} articles
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {articlesWithoutTags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Articles Without Tags</h2>
          <ul className="list-disc pl-5 space-y-2">
            {articlesWithoutTags.slice(0, 10).map(article => (
              <li key={article.slug}>
                <strong>{article.title || 'Untitled'}</strong> (<code>{article.slug}</code>)
              </li>
            ))}
            {articlesWithoutTags.length > 10 && (
              <li className="text-gray-500">
                ...and {articlesWithoutTags.length - 10} more
              </li>
            )}
          </ul>
        </div>
      )}
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5 space-y-4">
          <li>
            <strong>Check article tags:</strong> Make sure your articles have tags defined. They can be defined in frontmatter, metadata, or extracted from content.
          </li>
          <li>
            <strong>Verify tag extraction:</strong> Check that tags are being properly extracted from your content and frontmatter.
          </li>
          <li>
            <strong>Debug tag matching algorithm:</strong> The matching logic should correctly identify when an article matches a tag.
          </li>
          <li>
            <strong>Check component integration:</strong> Make sure the article match counts are correctly passed to the Tags component.
          </li>
        </ol>
      </div>
    </div>
  );
}
