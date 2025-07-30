// app/components/Table/Table.tsx - Handle converted Markdown
import './styles.css';

interface TableConfig {
  maxRows?: number;
  showHeader?: boolean;
  zebraStripes?: boolean;
  tableType?: 'default' | 'comparison' | 'pricing';
  size?: 'default' | 'dense' | 'large';
  showAllTables?: boolean; // New option for multiple tables
}

const DEFAULT_CONFIG: Required<TableConfig> = {
  maxRows: 10,
  showHeader: true,
  zebraStripes: false,
  tableType: 'default',
  size: 'default',
  showAllTables: true,
};

export function Table({ 
  htmlContent, 
  config = {} 
}: { 
  htmlContent: string; 
  config?: TableConfig; 
}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Clean up the HTML content
  const cleanedContent = htmlContent
    .replace(/<!-- Category:.*?-->/g, '') // Remove category comments
    .replace(/^\s*\n/gm, '') // Remove empty lines
    .trim();
  
  return (
    <div className="overflow-x-auto">
      <div 
        className={`
          table-container
          ${finalConfig.zebraStripes ? 'zebra-stripes' : ''}
          ${!finalConfig.showHeader ? 'no-header' : ''}
          ${finalConfig.tableType !== 'default' ? `${finalConfig.tableType}-table` : ''}
          ${finalConfig.size !== 'default' ? `size-${finalConfig.size}` : ''}
        `}
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
      />
    </div>
  );
}