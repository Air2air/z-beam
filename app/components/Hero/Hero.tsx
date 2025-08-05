// app/components/Hero/Hero.tsx
import './styles.css';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
  frontmatter?: any; // Frontmatter contains all image path information
  cta?: {
    text: string;
    href: string;
  };
}

export function Hero({ 
  title, 
  subtitle, 
  image, 
  align = 'center', 
  theme = 'dark',
  frontmatter,
  cta 
}: HeroProps) {
  const alignClass = align !== 'center' ? `text-${align}` : 'text-center';
  const themeClass = `theme-${theme}`;
  
  // Determine image source, prioritizing frontmatter
  let imageSource = image;
  
  if (!imageSource && frontmatter?.images?.hero?.url) {
    // Use the hero image URL from frontmatter
    imageSource = frontmatter.images.hero.url;
  }
  
  return (
    <div className={`hero-section ${themeClass}`}>
      {imageSource && (
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${imageSource})` }}
        />
      )}
      
      <div className={`hero-content ${alignClass}`}>
        <h1 className="hero-title">{title}</h1>
        
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        
        {cta && (
          <a href={cta.href} className="hero-cta">
            {cta.text}
          </a>
        )}
      </div>
    </div>
  );
}