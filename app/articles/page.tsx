// app/articles/page.tsx

import { ArticlePosts } from 'app/components/articleList'; // Assuming this component exists

// Metadata can still be defined here, and it will be merged with the layout's metadata.
// Specific page metadata will override general layout metadata.
export const metadata = {
  title: 'All Articles', // More specific title for the list page
  description: 'Browse a collection of all my articles.',
};

export default function ArticlesListPage() {
  return (
    // Only the content specific to the articles list page
    <ArticlePosts />
  );
}