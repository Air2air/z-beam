// app/utils/badgeSymbolLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BadgeSymbolData } from '@/types/core';

/**
 * Load badge symbol data from the badgesymbol content folder
 */
export async function loadBadgeSymbolData(slug: string): Promise<BadgeSymbolData | null> {
  try {
    // Try to load data from the badgesymbol folder
    const badgeSymbolPath = path.join(
      process.cwd(),
      'content',
      'components',
      'badgesymbol',
      `${slug}.md`
    );
    
    if (fs.existsSync(badgeSymbolPath)) {
      const fileContent = fs.readFileSync(badgeSymbolPath, 'utf8');
      const { data } = matter(fileContent);
      
      return {
        symbol: data.symbol,
        materialType: data.materialType,
        atomicNumber: data.atomicNumber,
        formula: data.formula,
        description: data.description
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading badge symbol data for ${slug}:`, error);
    return null;
  }
}

/**
 * Load all available badge symbol data
 */
export async function loadAllBadgeSymbolData(): Promise<Record<string, BadgeSymbolData>> {
  const badgeSymbolData: Record<string, BadgeSymbolData> = {};
  
  try {
    const badgeSymbolDir = path.join(
      process.cwd(),
      'content',
      'components',
      'badgesymbol'
    );
    
    if (fs.existsSync(badgeSymbolDir)) {
      const files = fs.readdirSync(badgeSymbolDir);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const slug = file.replace('.md', '');
          const data = await loadBadgeSymbolData(slug);
          if (data) {
            badgeSymbolData[slug] = data;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading all badge symbol data:', error);
  }
  
  return badgeSymbolData;
}
