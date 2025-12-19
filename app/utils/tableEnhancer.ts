// app/utils/tableEnhancer.ts

/**
 * Enhances HTML content by wrapping tables in styled containers
 * for better visual separation and styling
 */
export function enhanceTablesInHTML(htmlContent: string): string {
  if (!htmlContent || !htmlContent.includes('<table')) {
    return htmlContent;
  }

  // Regular expression to match table elements (including multiline)
  const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
  
  // Replace each table with enhanced wrapper
  const processedContent = htmlContent.replace(tableRegex, (tableMatch) => {
    // Extract the table HTML
    const tableHtml = tableMatch.trim();
    
    // Add Tailwind classes to the table itself
    const processedTable = tableHtml.replace(
      /<table([^>]*)>/i,
      '<table$1 class="w-full border-collapse m-0">'
    );
    
    // Wrap in enhanced containers with Tailwind classes
    return `<div class="my-8 w-full">
  <div class="bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
    ${processedTable}
  </div>
</div>`;
  });

  return processedContent;
}

/**
 * Enhanced version that also processes headings before tables
 * to ensure proper spacing and grouping
 */
export function enhanceTablesWithHeadings(htmlContent: string): string {
  if (!htmlContent || !htmlContent.includes('<table')) {
    return htmlContent;
  }

  // First enhance the basic tables
  let processed = enhanceTablesInHTML(htmlContent);
  
  // Then handle spacing between consecutive table containers
  processed = processed.replace(
    /(<\/div>\s*<\/div>)\s*(<div class="my-8 w-full">)/g,
    '$1\n\n$2'
  );
  
  // Add spacing after headings that precede tables
  processed = processed.replace(
    /((<h[1-6][^>]*>.*?<\/h[1-6]>)\s*)(<div class="my-8 w-full">)/g,
    '$1\n$3'
  );
  
  return processed;
}
