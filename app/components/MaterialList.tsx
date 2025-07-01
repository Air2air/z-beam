// app/(materials)/MaterialList.tsx

import Link from "next/link";
import { formatDate, getMaterialList } from "app/(materials)/utils";
import { CardItem } from "app/components/CardItem";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";

export function MaterialList() {
  let allMaterials = getMaterialList();

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
              date={formatDate(post.metadata.publishedAt, false)}
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