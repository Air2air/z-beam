// app/(materials)/MaterialList.tsx (or wherever it's located)

import Link from "next/link"; // Keep Link for potential direct usage if needed, though FeatureCard handles it
import { formatDate, getMaterialList } from "app/(materials)/utils";
// Remove the direct import of Thumbnail here, as FeatureCard will handle images
// import Thumbnail from 'app/components/thumbnail'; // <-- REMOVE THIS LINE

import { FeatureCard } from "app/components/FeatureCard"; // <-- IMPORT THE NEW COMPONENT

export function MaterialList() {
  let allMaterials = getMaterialList();

  return (
    // <section className="py-8">
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
      // This creates a responsive grid:
      // - 1 column on extra small screens
      // - 2 columns on small screens and up (sm:)
      // - 3 columns on large screens and up (lg:)
      // - 4 columns on extra large screens and up (xl:)
    >
      {allMaterials
        .sort((a, b) => {
          // Sort by publishedAt, newest first
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <FeatureCard
            key={post.slug}
            href={`/${post.slug}`} // Link to the material page
            imageUrl={post.metadata.thumbnail || "/path/to/default-image.jpg"} // Use thumbnail or a fallback
            imageAlt={post.metadata.title} // Use material title as alt text
            title={post.metadata.title} // Material title
            description={post.metadata.summary} // Material summary
            date={formatDate(post.metadata.publishedAt, false)} // Formatted date
            // You might need to add `tags` to your metadata type if you want to display them
            // tags={post.metadata.tags} // Example if tags exist in metadata
          />
        ))}
    </div>
    // </section>
  );
}
