// app/components/Table/TableLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { TableConfig, DEFAULT_TABLE_CONFIG } from './TableConfig';

export interface TableData {
  content: string;
  config: TableConfig;
}

// Configure marked for tables
marked.setOptions({
  gfm: true,
  breaks: false,
});

export async function loadTableData(slug: string): Promise<TableData | null> {
  try {
    // Load table content
    const tablePath = path.join(
      process.cwd(),
      'content',
      'components',
      'table',
      `${slug}.md`
    );

    if (!fs.existsSync(tablePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(tablePath, 'utf8');
    const { content, data } = matter(fileContent); // Get both content AND frontmatter
    
    if (!content || content.trim().length === 0) {
      return null;
    }

    // Convert markdown to HTML - handle both sync and async marked
    let rawHtml: string;
    try {
      const result = marked(content.trim());
      rawHtml = typeof result === 'string' ? result : await result;
    } catch (markdownError) {
      console.error(`Error converting markdown for ${slug}:`, markdownError);
      // Fallback to raw content
      rawHtml = content.trim();
    }
    
    // Clean up the HTML
    const htmlContent = rawHtml
      .replace(/<!-- Category:.*?-->/g, '') // Remove comments
      .replace(/^\s*\n/gm, '') // Remove empty lines
      .trim();

    // Get config from component file itself, not external frontmatter
    const config: TableConfig = {
      ...DEFAULT_TABLE_CONFIG,
      ...data?.tableConfig, // Config from the table component file
    };

    return {
      content: htmlContent,
      config,
    };
  } catch (error) {
    console.error(`Error loading table data for ${slug}:`, error);
    return null;
  }
}