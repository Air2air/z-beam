// app/components/MaterialList.tsx

import Link from "next/link";
// Make sure this path is correct: app/utils/utils if it's in app/utils/utils.ts
// Or app/lib/utils if you moved it to app/lib/utils.ts
import { formatDate, getMaterialList } from "app/utils/utils"; // <-- Confirm this path is absolute and correct
import { CardItem } from "app/components/CardItem";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import type { MaterialPost } from 'app/types';

// Make the component an async function
export async function MaterialList() {
  // getMaterialList is now called in a guaranteed server environment
  let allMaterials: MaterialPost[] = getMaterialList();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {allMaterials
        .sort((a, b) => {
          // Safely get nameShort, defaulting to an empty string if undefined
          const nameA = (a.metadata.nameShort || "").toLowerCase();
          const nameB = (b.metadata.nameShort || "").toLowerCase();

          if (nameA < nameB) {
            return -1; // nameA comes before nameB
          }
          if (nameA > nameB) {
            return 1; // nameA comes after nameB
          }
          return 0; // names are equal
        })
        .map((post, index) => (
          <FadeInOnScroll
            key={post.slug}
            delay={0.05 * index}
            yOffset={20}
            amount={0.1}
          >
            <CardItem
              href={`/${post.slug}`}
              imageUrl={post.metadata.thumbnail || "/path/to/default-image.jpg"}
              imageAlt={post.metadata.title}
              title={post.metadata.title}
              description={post.metadata.summary}
              date={post.metadata.publishedAt ? formatDate(post.metadata.publishedAt) : 'Date not available'}
              nameShort={post.metadata.nameShort}
              atomicNumber={post.metadata.atomicNumber}
              chemicalSymbol={post.metadata.chemicalSymbol}
              materialType={post.metadata.materialType}
              metalClass={post.metadata.metalClass}
              crystalStructure={post.metadata.crystalStructure}
              primaryApplication={post.metadata.primaryApplication}
            />
          </FadeInOnScroll>
        ))}
    </div>
  );
}