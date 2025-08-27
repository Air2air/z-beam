// app/utils/badgeDataLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article } from '../../types/core';
import { BadgeData } from '../../types/core';

export async function loadBadgeData(slug: string): Promise<BadgeData | null> {
  try {
    // Try to load data from the frontmatter file
    const frontmatterPath = path.join(
      process.cwd(),
      'content',
      'components',
      'frontmatter',
      `${slug}.md`
    );
    
    if (fs.existsSync(frontmatterPath)) {
      const fileContent = fs.readFileSync(frontmatterPath, 'utf8');
      const { data } = matter(fileContent);
      
      if (data.chemicalProperties) {
        return {
          symbol: data.chemicalProperties.symbol,
          formula: data.chemicalProperties.formula,
          materialType: data.chemicalProperties.materialType,
          atomicNumber: data.chemicalProperties.atomicNumber
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading badge data for ${slug}:`, error);
    return null;
  }
}
