// app/articles/page.tsx
import { ContentList } from '../components/ContentList';
import { TagDirectoryServer } from '../components/TagDirectoryServer';
import { Breadcrumbs } from '../components/breadcrumbs';

export const metadata = {
  title: 'Articles | Z-Beam Laser Cleaning',
  description: 'Explore our comprehensive collection of laser cleaning articles and insights from industry experts.',
};

export default function ArticlesPage() {
  return (
    <>
      <Breadcrumbs />
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          All Articles
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          Explore our comprehensive collection of laser cleaning guides and insights from industry experts.
        </p>
      </div>

      {/* Tag Directory Section */}
      <div className="mb-12">
        <TagDirectoryServer />
      </div>

      {/* All Articles List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          All Articles
        </h2>
        <ContentList />
      </div>
    </>
  );
}
