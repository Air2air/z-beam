// app/components/Table/TableLoader.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { TableConfig, DEFAULT_TABLE_CONFIG } from './TableConfig';
import { FrontmatterData } from '@/app/utils/frontmatterLoader';

export interface TableData {
  content: string;
  config: TableConfig;
}

// Configure marked for tables
marked.setOptions({
  gfm: true,
  breaks: false,
});

export async function loadTableData(slug: string, frontmatter: FrontmatterData | null): Promise<TableData | null> {
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
    const { content } = matter(fileContent);
    
    // Convert markdown to HTML - await the Promise
    const rawHtml = await marked(content.trim());
    
    // Clean up the HTML
    const htmlContent = rawHtml
      .replace(/<!-- Category:.*?-->/g, '') // Remove comments
      .replace(/^\s*\n/gm, '') // Remove empty lines
      .trim();

    // Extract config from frontmatter
    const config: TableConfig = {
      ...DEFAULT_TABLE_CONFIG,
      ...frontmatter?.tableConfig,
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