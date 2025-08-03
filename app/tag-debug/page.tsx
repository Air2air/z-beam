// app/tag-debug/page.tsx
import { TagDebug } from "../components/Debug/TagDebug";

export default function TagDebugPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tag System Debug</h1>
      <p className="mb-8 text-gray-600">
        This page demonstrates how the tag system filters out tags with zero matching articles.
      </p>
      
      <TagDebug />
      
      <div className="mt-12 bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Implementation Details</h2>
        <p className="mb-4">
          The tag filtering system implements the following features:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Tag Count Calculation:</strong> For each tag, the system counts how many articles match that tag.
          </li>
          <li>
            <strong>Zero-Count Filtering:</strong> Tags with zero matching articles can be hidden using the <code className="bg-gray-200 px-1 py-0.5 rounded">hideEmptyTags</code> config option.
          </li>
          <li>
            <strong>Debug Information:</strong> In development mode, hidden tags are displayed in a debug section with their zero counts.
          </li>
          <li>
            <strong>Configuration Options:</strong> Tag filtering can be enabled/disabled per component instance.
          </li>
        </ul>
      </div>
    </div>
  );
}
