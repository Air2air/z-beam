// app/authors/page.tsx
import { getAllAuthors } from '../utils/authors';
import { AuthorCard } from '../components/Author/AuthorCard';

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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </div>
    </>
  );
}
