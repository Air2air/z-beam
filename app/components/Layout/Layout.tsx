// app/components/Layout/Layout.tsx
import { Content } from "../Content/Content";
import { Table } from "../Table/Table";
import { Bullets } from "../Bullets/Bullets";
import { Caption } from "../Caption/Caption";

// Define component order directly in Layout
const COMPONENT_ORDER = [
  'content',
  'caption',
  'bullets',
  'table'
] as const;

interface LayoutProps {
  components: Record<string, any> | null; // Make components accept null
  metadata?: any;
  slug?: string;
  title?: string;
  hideHeader?: boolean;
  className?: string;
}

export function Layout({ 
  components, 
  metadata, 
  slug,
  title,
  hideHeader = false,
  className = "max-w-4xl mx-auto px-4 py-8"
}: LayoutProps) {
  // Add null check before accessing components
  if (!components || Object.keys(components).length === 0) {
    // Return a basic layout or message for pages without components
    return (
      <section className={className}>
        {!hideHeader && (
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {title || metadata?.subject || (slug ? `Article: ${slug}` : '')}
            </h1>
          </header>
        )}
        <div className="prose dark:prose-invert">
          <p>No content available for this page.</p>
        </div>
      </section>
    );
  }
  
  // Determine the title to display
  const displayTitle = title || metadata?.subject || (slug ? `Article: ${slug}` : '');
  
  return (
    <section className={className}>
      {!hideHeader && displayTitle && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {displayTitle}
          </h1>
        </header>
      )}

      {/* Render components in specified order */}
      {COMPONENT_ORDER.map(type => {
        if (!components[type]) return null;
        
        const { content, config } = components[type];
        
        switch(type) {
          case 'content':
            return <Content key={type} content={content} config={config} />;
          case 'caption':
            return <Caption key={type} content={content} config={config} />;
          case 'bullets':
            return <Bullets key={type} content={content} config={config} />;
          case 'table':
            return <Table key={type} content={content} config={config} />;
          default:
            return null;
        }
      })}
    </section>
  );
}