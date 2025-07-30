// app/components/Table/Table.tsx
import './styles.css';
import { TableConfig, DEFAULT_TABLE_CONFIG } from './TableConfig';

interface TableProps {
  content: string;
  config?: TableConfig;
}

export function Table({ content, config = {} }: TableProps) {
  const finalConfig = { ...DEFAULT_TABLE_CONFIG, ...config };
  
  if (!content) {
    return null;
  }
  
  return (
    <div className="table-section">
      <div className="overflow-x-auto">
        <div 
          className={`
            table-container
            ${finalConfig.zebraStripes ? 'zebra-stripes' : ''}
            ${!finalConfig.showHeader ? 'no-header' : ''}
            ${finalConfig.tableType !== 'default' ? `${finalConfig.tableType}-table` : ''}
            ${finalConfig.size !== 'default' ? `size-${finalConfig.size}` : ''}
          `}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

// Export the loader for server-side use
export { loadTableData } from './TableLoader';
export type { TableConfig } from './TableConfig';