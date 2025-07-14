import { getArticleBySlug } from "app/utils/server";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

export default async function ApplicationPage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  // Only show application articles
  if (!article || article.metadata.contentCategory !== "application") {
    notFound();
  }

  return (
    <article>
      <h1>{article.metadata.title}</h1>
      <MDXRemote source={article.content} />
    </article>
  );
}
