// app/components/Table/Table.tsx
import './styles.css';

interface TableProps {
  content: string;
  config?: {
    maxRows?: number;
    showHeader?: boolean;
    zebraStripes?: boolean;
    tableType?: 'default' | 'comparison' | 'pricing';
    size?: 'default' | 'dense' | 'large';
    bordered?: boolean;
    caption?: string;
    className?: string;
  };
}

export function Table({ content, config }: TableProps) {
  if (!content) return null;
  
  // Use default values directly in destructuring
  const {
    zebraStripes = true,
    showHeader = true,
    tableType = 'default',
    size = 'default',
    bordered = true,
    className = '',
    caption
  } = config || {};
  
  return (
    <div className="table-section">
      <div className="overflow-x-auto">
        <div 
          className={`
            table-container
            ${zebraStripes ? 'zebra-stripes' : ''}
            ${!showHeader ? 'no-header' : ''}
            ${tableType !== 'default' ? `table-${tableType}` : ''}
            ${size !== 'default' ? `size-${size}` : ''}
            ${bordered ? 'bordered' : ''}
            ${className}
          `}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      
      {caption && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}
