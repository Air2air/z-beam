// app/components/MetaTags/MetaTagsLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MetaTagsData } from './MetaTags';

export async function loadMetaTagsData(slug: string): Promise<MetaTagsData | null> {
  try {
    // Load from dedicated metatags component file
    const metatagsPath = path.join(
      process.cwd(),
      'content',
      'components',
      'metatags',
      `${slug}.md`
    );

    if (!fs.existsSync(metatagsPath)) {
      console.log(`No metatags file found for slug: ${slug}`);
      return null;
    }

    const fileContent = fs.readFileSync(metatagsPath, 'utf8');
    const { data } = matter(fileContent); // Only need frontmatter, not content
    
    return data as MetaTagsData;
  } catch (error) {
    console.error(`Error loading meta tags data for ${slug}:`, error);
    return null;
  }
}