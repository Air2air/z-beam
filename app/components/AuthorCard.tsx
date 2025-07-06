// app/components/AuthorCard.tsx
import Link from 'next/link';
import type { AuthorMetadata } from 'app/types';

interface AuthorCardProps {
  author: AuthorMetadata;
}

export function AuthorCard({ author }: AuthorCardProps) {
  console.log('AuthorCard component rendering for:', author.name);
  return (
    <Link 
      href={`/authors/${author.slug}`} 
      className="flex flex-col bg-red-500 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-8 border-green-500"
    >
      <div className="p-6">
        {/* Author Image */}
        {author.image && (
          <div className="flex justify-center mb-4">
            <img
              src={author.image}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
            />
          </div>
        )}
        
        {/* Author Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {author.name}
          </h2>
          <p className="text-blue-600 font-medium mb-3">
            {author.title}
          </p>
          <p className="text-gray-600 line-clamp-3">
            {author.bio}
          </p>
        </div>
      </div>
    </Link>
  );
}
