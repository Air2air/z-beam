// app/components/Bullets/BulletsLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BulletsConfig, DEFAULT_BULLETS_CONFIG } from './BulletsConfig';
import { FrontmatterData } from '@/app/utils/frontmatterLoader';

export interface BulletsData {
  content: string;
  config: BulletsConfig;
}

export async function loadBulletsData(slug: string, frontmatter: FrontmatterData | null): Promise<BulletsData | null> {
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
    const { content } = matter(fileContent);
    
    if (!content || content.trim().length === 0) {
      return null;
    }

    const htmlContent = content.trim();

    // Create new config object with only valid properties
    const config: BulletsConfig = {};
    
    // Only add properties that exist in our interface
    if (frontmatter?.bulletConfig?.style === 'bulleted' || frontmatter?.bulletConfig?.style === 'numbered') {
      config.style = frontmatter.bulletConfig.style;
    } else {
      config.style = DEFAULT_BULLETS_CONFIG.style;
    }
    
    if (typeof frontmatter?.bulletConfig?.maxItems === 'number' && frontmatter.bulletConfig.maxItems > 0) {
      config.maxItems = frontmatter.bulletConfig.maxItems;
    } else {
      config.maxItems = DEFAULT_BULLETS_CONFIG.maxItems;
    }
    
    if (typeof frontmatter?.bulletConfig?.showIcons === 'boolean') {
      config.showIcons = frontmatter.bulletConfig.showIcons;
    } else {
      config.showIcons = DEFAULT_BULLETS_CONFIG.showIcons;
    }

    return {
      content: htmlContent,
      config,
    };
  } catch (error) {
    console.error(`Error loading bullets data for ${slug}:`, error);
    return null;
  }
}