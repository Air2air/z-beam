import { ContentList } from '@/app/components/ContentList';

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Applications
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Browse our collection of application articles.
      </p>
      <div className="mt-12">
        <ContentList category="application" />
      </div>
    </div>
  );
}
