// app/components/Bullets/BulletsLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BulletsConfig, DEFAULT_BULLETS_CONFIG } from './BulletsConfig';

export interface BulletsData {
  content: string;
  config: BulletsConfig;
}

export async function loadBulletsData(slug: string, frontmatter?: any): Promise<BulletsData | null> {
  try {
    const bulletsPath = path.join(
      process.cwd(),
      'content',
      'components',
      'bullets',
      `${slug}.md`
    );

    if (!fs.existsSync(bulletsPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(bulletsPath, 'utf8');
    const { content, data } = matter(fileContent);
    
    if (!content || content.trim().length === 0) {
      return null;
    }

    const htmlContent = content.trim();

    // Get config from component file itself, not frontmatter
    const config: BulletsConfig = {
      ...DEFAULT_BULLETS_CONFIG,
      ...data?.bulletConfig, // Config from the component file
    };

    return {
      content: htmlContent,
      config,
    };
  } catch (error) {
    console.error(`Error loading bullets data for ${slug}:`, error);
    return null;
  }
}