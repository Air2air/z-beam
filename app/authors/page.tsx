// app/authors/page.tsx
import { getAllAuthors } from '../utils/authors';
import Link from 'next/link';
import { ContentList } from '@/app/components/ContentList';

export const metadata = {
  title: 'Authors | Z-Beam',
  description: 'Meet the expert authors behind Z-Beam\'s laser cleaning content and research.',
};

export default async function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Authors
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Browse our authors.
        </p>
        <div className="mt-12">
          <ContentList category="author" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => (
            <Link 
              href={`/authors/${author.slug}`} 
              key={author.id}
              className="flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Author Image */}
                {author.image && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={author.image}
                      alt={author.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-100"
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
          ))}
        </div>
      </div>
    </>
  );
}
