// app/components/MetaTags/MetaTags.tsx
import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export function MetaTags({ 
  title = 'Z-Beam',
  description,
  keywords = [], // Provide a default empty array
  canonical,
  ogImage,
  ogType = 'website',
  noindex
}: MetaTagsProps) {
  const formattedTitle = title.includes('Z-Beam') ? title : `${title} | Z-Beam`;
  
  return (
    <Head>
      <title>{formattedTitle}</title>
      
      {description && <meta name="description" content={description} />}
      
      {keywords.length > 0 && ( // Now safe to access .length
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex" />}
    </Head>
  );
}