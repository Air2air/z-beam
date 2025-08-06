// app/utils/listContentLoader.ts
// This is a specialized version of the content integrator to break circular dependencies
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Single interface for article metadata
export interface ArticleMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  subject?: string;
  category?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
  author?: string;
  articleType?: string;
  chemicalSymbol?: string;
  atomicNumber?: number;
  chemicalFormula?: string;
  properties?: {
    chemicalFormula?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
    laserType?: string;
    wavelength?: string;
    fluenceRange?: string;
  };
  composition?: Array<{
    component: string;
    percentage: string;
    type: string;
    formula?: string;
  }>;
  // Include any other fields from your metatags files
  [key: string]: any; // Allow any other properties
}

export interface ArticleData {
  metadata: ArticleMetadata;
  components: Record<string, any> | null;
}

export async function getArticleForList(slug: string): Promise<ArticleData | null> {
  try {
    // Load metadata directly from metatags
    const metatagPath = path.join(
      process.cwd(),
      'content',
      'components',
      'metatags',
      `${slug}.md`
    );
    
    let metadata: ArticleMetadata = {};
    
    if (fs.existsSync(metatagPath)) {
      const metatagContent = fs.readFileSync(metatagPath, 'utf8');
      const { data } = matter(metatagContent);
      metadata = data;
    }
    
    // Check if there are any component files for this slug
    const componentsDir = path.join(process.cwd(), 'content', 'components');
    const components: Record<string, any> = {};
    let hasComponents = false;
    
    if (fs.existsSync(componentsDir)) {
      const componentTypes = fs.readdirSync(componentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const type of componentTypes) {
        if (type === 'metatags') continue; // Skip metatags as we already loaded it
        
        const componentPath = path.join(componentsDir, type, `${slug}.md`);
        if (fs.existsSync(componentPath)) {
          const componentContent = fs.readFileSync(componentPath, 'utf8');
          const { data, content } = matter(componentContent);
          
          components[type] = {
            ...data,
            content
          };
          
          hasComponents = true;
        }
      }
    }
    
    return {
      metadata,
      components: hasComponents ? components : null
    };
  } catch (error) {
    console.error(`Error loading article: ${slug}`, error);
    return null;
  }
}
