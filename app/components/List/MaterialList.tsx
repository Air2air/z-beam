// app/components/MaterialList.tsx

import Link from "next/link";
import { formatDate } from "app/utils/utils";
import { getMaterialList } from "app/utils/server";
import { CardItem } from "@/app/components/Card/CardItem";
import { FadeInOnScroll } from "@/app/components/Layout/FadeInOnScroll";
import type { MaterialPost } from 'app/types';

// Helper function to format Cloudinary URLs
function formatCloudinaryUrl(materialName: string): string {
  // Convert material name to lowercase and replace spaces with underscores
  const formattedName = materialName.toLowerCase().replace(/\s+/g, '_');
  // Return the formatted Cloudinary URL with transformations
  return `https://res.cloudinary.com/dbzw24uge/image/upload/c_fill,w_400,h_300,q_auto,f_auto/Material/material_${formattedName}.jpg`;
}

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
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })
        .map((post, index) => {
          // Generate thumbnail URL based on the material name if not provided
          const thumbnailUrl = post.metadata.thumbnail || 
            (post.metadata.nameShort ? 
              formatCloudinaryUrl(post.metadata.nameShort) : 
              "/images/material-placeholder.jpg");
          
          return (
            <FadeInOnScroll
              key={post.slug}
              delay={0.05 * index}
              yOffset={20}
              amount={0.1}
            >
              <CardItem
                href={`/${post.slug}`}
                imageUrl={thumbnailUrl}
                imageAlt={post.metadata.title || post.metadata.nameShort || "Material image"}
                title={post.metadata.title}
                description={post.metadata.summary}
                date={post.metadata.publishedAt ? formatDate(post.metadata.publishedAt) : undefined}
                nameShort={post.metadata.nameShort}
                atomicNumber={post.metadata.atomicNumber}
                chemicalSymbol={post.metadata.chemicalSymbol}
                materialType={post.metadata.materialType}
                metalClass={post.metadata.metalClass}
                crystalStructure={post.metadata.crystalStructure}
                primaryApplication={post.metadata.primaryApplication}
              />
            </FadeInOnScroll>
          );
        })}
    </div>
  );
}