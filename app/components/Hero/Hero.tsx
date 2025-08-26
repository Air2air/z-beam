// app/components/Hero/Hero.tsx
import './styles.css';

interface HeroProps {
  image?: string;
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
  frontmatter?: {
    images?: {
      hero?: {
        url?: string;
      };
    };
    [key: string]: unknown;
  }; // Frontmatter contains all image path information
  cta?: {
    text: string;
    href: string;
  };
}

export function Hero({ 
  image, 
  // align = 'center', - unused
  theme = 'dark',
  frontmatter,

}: HeroProps) {
  const themeClass = `theme-${theme}`;
  
  // Determine image source, prioritizing frontmatter
  let imageSource = image;
  
  // Use the hero image URL from frontmatter if no direct image provided
  if (!imageSource && frontmatter?.images?.hero?.url) {
    imageSource = frontmatter.images.hero.url;
  }
  
  return (
    <div className={`hero-section ${themeClass}`}>
      {imageSource ? (
        <div 
          className="hero-background"
          style={{ backgroundImage: `url(${imageSource})` }}
        />
      ) : (
        <div 
          className="hero-background flex items-center justify-center bg-gray-600"
          style={{ 
            backgroundImage: `url(/images/Site/Logo/logo_.png)`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: '0.3'
          }}
        />
      )}

    </div>
  );
}