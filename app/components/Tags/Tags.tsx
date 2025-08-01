// app/components/Tags/Tags.tsx
interface TagsProps {
  content: string;
  config?: {
    className?: string;
    title?: string;
    pillColor?: string;
    textColor?: string;
    [key: string]: any;
  };
}

export function Tags({ content, config }: TagsProps) {
  if (!content) return null;
  
  const { 
    className = "my-6", 
    title = "Tags",
    pillColor = "bg-blue-100 dark:bg-blue-900",
    textColor = "text-blue-800 dark:text-blue-200"
  } = config || {};
  
  // Parse tags from HTML content
  // This assumes content contains tags in a format like:
  // <ul><li>Tag1</li><li>Tag2</li>...</ul> or comma-separated list
  const parseTagsFromContent = (htmlContent: string): string[] => {
    // Try to extract from list items first
    const liRegex = /<li>(.*?)<\/li>/g;
    const liMatches = [...htmlContent.matchAll(liRegex)].map(match => match[1]);
    
    if (liMatches.length > 0) {
      return liMatches.map(tag => tag.trim());
    }
    
    // Fallback: treat as comma-separated text
    // Remove HTML tags and split by comma
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    return plainText.split(',').map(tag => tag.trim()).filter(tag => tag);
  };
  
  const tags = parseTagsFromContent(content);
  
  return (
    <div className={`tags-container ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${pillColor} ${textColor} transition-colors duration-200 hover:opacity-90`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}