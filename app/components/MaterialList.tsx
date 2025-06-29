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
          // Sort by publishedAt, newest first
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
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
              nameShort={post.metadata.nameShort} // ADDED: Pass the nameShort prop
              // tags={post.metadata.tags}
            />
          </FadeInOnScroll>
        ))}
    </div>
  );
}