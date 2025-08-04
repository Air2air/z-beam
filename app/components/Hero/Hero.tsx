// app/components/Hero/Hero.tsx
import './styles.css';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  materialSlug?: string; // Add this to support material_slug based image path
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
  cta?: {
    text: string;
    href: string;
  };
}

export function Hero({ 
  title, 
  subtitle, 
  image, 
  materialSlug,
  align = 'center', 
  theme = 'dark',
  cta 
}: HeroProps) {
  const alignClass = align !== 'center' ? `text-${align}` : 'text-center';
  const themeClass = `theme-${theme}`;
  
  // Determine image source with fallbacks
  const imageSource = image || (materialSlug ? `/images/Material/${materialSlug}_hero.jpg` : undefined);
  
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