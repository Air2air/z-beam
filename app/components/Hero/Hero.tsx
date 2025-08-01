// app/components/Hero/Hero.tsx
import './styles.css';

interface HeroProps {
  title: string;
  subtitle?: string;
  image?: string;
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
  align = 'center', 
  theme = 'dark',
  cta 
}: HeroProps) {
  const alignClass = align !== 'center' ? `text-${align}` : 'text-center';
  const themeClass = `theme-${theme}`;
  
  return (
    <div className={`hero-section ${themeClass}`}>
      {image && (
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${image})` }}
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