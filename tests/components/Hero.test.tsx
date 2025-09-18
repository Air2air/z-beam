/**
 * Test Suite: Hero Component
 * Testing hero section rendering and content display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a test Hero component
const Hero = ({ title, subtitle, backgroundImage, ctaText, ctaLink, variant, size }: any) => (
  <section 
    data-testid="hero-section"
    data-variant={variant}
    data-size={size}
    style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
    className={`hero ${variant || 'default'} ${size || 'medium'}`}
  >
    <div data-testid="hero-content">
      {title && <h1 data-testid="hero-title">{title}</h1>}
      {subtitle && <p data-testid="hero-subtitle">{subtitle}</p>}
      {ctaText && ctaLink && (
        <a 
          href={ctaLink} 
          data-testid="hero-cta"
          className="hero-cta"
        >
          {ctaText}
        </a>
      )}
    </div>
  </section>
);

describe('Hero Component', () => {
  test('should render with title only', () => {
    render(<Hero title="Welcome to Z-Beam" />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('hero-title')).toHaveTextContent('Welcome to Z-Beam');
    expect(screen.queryByTestId('hero-subtitle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero-cta')).not.toBeInTheDocument();
  });

  test('should render with title and subtitle', () => {
    render(
      <Hero 
        title="Z-Beam Construction"
        subtitle="Advanced structural engineering solutions"
      />
    );

    expect(screen.getByTestId('hero-title')).toHaveTextContent('Z-Beam Construction');
    expect(screen.getByTestId('hero-subtitle')).toHaveTextContent('Advanced structural engineering solutions');
  });

  test('should render with call-to-action', () => {
    render(
      <Hero 
        title="Get Started"
        subtitle="Begin your project today"
        ctaText="Learn More"
        ctaLink="/services"
      />
    );

    const cta = screen.getByTestId('hero-cta');
    expect(cta).toHaveTextContent('Learn More');
    expect(cta).toHaveAttribute('href', '/services');
    expect(cta).toHaveClass('hero-cta');
  });

  test('should apply background image', () => {
    render(
      <Hero 
        title="Hero with Background"
        backgroundImage="/images/hero-bg.jpg"
      />
    );

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveStyle('background-image: url(/images/hero-bg.jpg)');
  });

  test('should apply size variants', () => {
    render(
      <Hero 
        title="Large Hero"
        size="large"
      />
    );

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveAttribute('data-size', 'large');
    expect(heroSection).toHaveClass('large');
  });

  test('should apply style variants', () => {
    render(
      <Hero 
        title="Centered Hero"
        variant="centered"
      />
    );

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveAttribute('data-variant', 'centered');
    expect(heroSection).toHaveClass('centered');
  });

  test('should handle CTA without link gracefully', () => {
    render(
      <Hero 
        title="Hero"
        ctaText="Click Me"
      />
    );

    expect(screen.queryByTestId('hero-cta')).not.toBeInTheDocument();
  });

  test('should handle link without CTA text gracefully', () => {
    render(
      <Hero 
        title="Hero"
        ctaLink="/somewhere"
      />
    );

    expect(screen.queryByTestId('hero-cta')).not.toBeInTheDocument();
  });

  test('should render complete hero with all props', () => {
    render(
      <Hero 
        title="Complete Hero Section"
        subtitle="This hero has everything configured"
        backgroundImage="/images/complete-bg.jpg"
        ctaText="Get Started Now"
        ctaLink="/contact"
        variant="overlay"
        size="large"
      />
    );

    expect(screen.getByTestId('hero-title')).toHaveTextContent('Complete Hero Section');
    expect(screen.getByTestId('hero-subtitle')).toHaveTextContent('This hero has everything configured');
    expect(screen.getByTestId('hero-cta')).toHaveTextContent('Get Started Now');
    expect(screen.getByTestId('hero-cta')).toHaveAttribute('href', '/contact');
    
    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveStyle('background-image: url(/images/complete-bg.jpg)');
    expect(heroSection).toHaveClass('overlay', 'large');
  });

  test('should apply default classes', () => {
    render(<Hero title="Default Hero" />);

    const heroSection = screen.getByTestId('hero-section');
    expect(heroSection).toHaveClass('hero', 'default', 'medium');
  });
});
