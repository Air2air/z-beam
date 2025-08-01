// app/components/Table/Table.tsx
import './styles.css';

interface TableProps {
  content: string;
  config?: {
    showHeader?: boolean;
    caption?: string;
    className?: string;
  };
}

export function Table({ content, config }: TableProps) {
  if (!content) return null;
  
  // Use default values directly in destructuring
  const {
    showHeader = true,
    className = '',
    caption
  } = config || {};
  
  return (
    <div className="table-section">
      <div className="overflow-x-auto w-full">
        <div 
          className={`
            table-container w-full
            ${!showHeader ? 'no-header' : ''}
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
