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
  const enhancedContent = htmlContent.replace(tableRegex, (tableMatch) => {
    // Extract the table HTML
    const tableHtml = tableMatch.trim();
    
    // Add enhanced classes to the table itself
    const enhancedTable = tableHtml.replace(
      /<table([^>]*)>/i,
      '<table$1 class="table-enhanced">'
    );
    
    // Wrap in enhanced containers
    return `<div class="table-enhanced-container">
  <div class="table-enhanced-inner">
    ${enhancedTable}
  </div>
</div>`;
  });

  return enhancedContent;
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
  let enhanced = enhanceTablesInHTML(htmlContent);
  
  // Then handle spacing between consecutive table containers
  enhanced = enhanced.replace(
    /(<\/div>\s*<\/div>)\s*(<div class="table-enhanced-container">)/g,
    '$1\n\n$2'
  );
  
  // Add spacing after headings that precede tables
  enhanced = enhanced.replace(
    /((<h[1-6][^>]*>.*?<\/h[1-6]>)\s*)(<div class="table-enhanced-container">)/g,
    '$1\n$3'
  );
  
  return enhanced;
}
