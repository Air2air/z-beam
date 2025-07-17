import { ContentList } from '@/app/components/List/ContentList';

export default function RegionsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Regions
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Browse our collection of region articles.
      </p>
      <div className="mt-12">
        <ContentList category="region" />
      </div>
    </div>
  );
}
