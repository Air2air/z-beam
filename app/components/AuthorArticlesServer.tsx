// app/components/AuthorArticlesServer.tsx
import { getAllAuthors, getArticleList } from "app/utils/server";
import { AuthorArticles } from "./AuthorArticles";

interface AuthorArticlesServerProps {
  authorId: number;
  className?: string;
  excludeSlug?: string;
  limit?: number;
}

export function AuthorArticlesServer({ 
  authorId, 
  className = "",
  excludeSlug,
  limit 
}: AuthorArticlesServerProps) {
  const authors = getAllAuthors();
  const allArticles = getArticleList();

  return (
    <AuthorArticles
      authorId={authorId}
      className={className}
      excludeSlug={excludeSlug}
      limit={limit}
      authors={authors}
      allMaterials={allArticles} // Keep the prop name for backwards compatibility
    />
  );
}
