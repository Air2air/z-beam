// app/search/page.tsx
import { getAllAuthors, getMaterialList } from 'app/utils/server';
import { AuthorSearchResults } from 'app/components/AuthorSearchResults';
import { FadeInOnScroll } from 'app/components/FadeInOnScroll';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Materials by Author | Z-Beam Laser Cleaning',
  description: 'Search and filter laser cleaning materials by expert authors. Find articles by Dr. Evelyn Reed, Mark Johnson, and Todd Dunning.',
  keywords: 'laser cleaning authors, materials search, expert articles, Z-Beam team',
};

export default async function SearchPage() {
  const authors = getAllAuthors();
  const materials = getMaterialList();

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeInOnScroll>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Materials by Author
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore laser cleaning materials and techniques from our expert team of scientists and engineers.
          </p>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Authors Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Authors</h2>
              <div className="space-y-4">
                {authors.map((author) => (
                  <div key={author.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-gray-900">{author.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{author.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-3">{author.bio}</p>
                    {author.specialties && author.specialties.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {author.specialties.slice(0, 2).map((specialty) => (
                          <span
                            key={specialty}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <AuthorSearchResults authors={authors} materials={materials} />
          </div>
        </div>
      </FadeInOnScroll>
    </div>
  );
}
