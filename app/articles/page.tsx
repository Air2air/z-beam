// app/articles/page.tsx
import { ContentList } from '../components/ContentList';
import { SmartTagList } from '../components/SmartTagList';
import { Breadcrumbs } from '../components/breadcrumbs';
import { getAllTags } from '../utils/tags';

export const metadata = {
  title: 'Articles | Z-Beam Laser Cleaning',
  description: 'Explore our comprehensive collection of laser cleaning articles and insights from industry experts.',
};

export default function ArticlesPage() {
  const allTags = getAllTags();

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Topic</h2>
          <p className="text-gray-600">Discover laser cleaning content by subject area</p>
        </div>
        <SmartTagList 
          tags={allTags}
          title=""
          className="mb-4"
          linkable={true}
          sortByPriority={true}
          showByCategory={false}
        />
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
