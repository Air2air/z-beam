// app/components/AuthorProfile.tsx
import Link from "next/link";
import type { AuthorMetadata } from "app/types";
import { SmartTagList } from "./SmartTagList";

interface AuthorProfileProps {
  author: AuthorMetadata;
  authorTags?: string[]; // Dynamic tags from author's articles
}

export function AuthorProfile({ author, authorTags }: AuthorProfileProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 mb-8">
      {/* Author Image */}
      {author.image && (
        <div className="flex-shrink-0">
          <img
            src={author.image}
            alt={author.name}
            className="w-22 h-22 md:w-24 md:h-24 rounded-full object-cover shadow-lg"
          />
        </div>
      )}

      <div className="flex-1">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {author.name}
        </h1>
        <h2 className="text-xl mb-4">{author.title}</h2>

        {/* Article Tags */}
        <SmartTagList 
          tags={authorTags || []} 
          title="Article Topics"
          className="mb-4"
          sortByPriority={true}
          showByCategory={true}
          maxTags={10}
        />
      </div>
    </div>
  );
}
