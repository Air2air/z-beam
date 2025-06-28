import Link from 'next/link';
import { formatDate, getArticlePosts } from 'app/articles/utils';
import Thumbnail from 'app/components/thumbnail'; // <-- Import your new component

export function ArticlePosts() {
  let allArticles = getArticlePosts();

  return (
    <div>
      <div className="bg-gray-200 !bg-gray-200">Test</div>
      {allArticles
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-2 mb-6 group"
            href={`/articles/${post.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row gap-4 items-center md:items-start">
              {post.metadata.thumbnail && (
                <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                  <Thumbnail
                    src={post.metadata.thumbnail}
                    alt={post.metadata.title}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-neutral-600 dark:text-neutral-400 tabular-nums">
                  {formatDate(post.metadata.publishedAt, false)}
                </p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight font-medium text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {post.metadata.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
