// app/components/Typography/Typography.tsx
import React from 'react';

/**
 * Typography components with consistent Tailwind styling
 * Use these components instead of raw HTML tags for consistent styling
 */

export const H1: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`text-4xl font-extralight tracking-tight mt-6 mb-2 text-neutral-900 dark:text-neutral-100 ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-xl font-extralight tracking-tight mt-6 mb-2 ${className}`}>
    {children}
  </h2>
);

export const H3: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold tracking-tight mt-6 mb-2 ${className}`}>
    {children}
  </h3>
);

export const H4: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h4 className={`text-lg font-medium tracking-tight mt-6 mb-2 ${className}`}>
    {children}
  </h4>
);

export const H5: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h5 className={`text-base font-medium tracking-tight mt-6 mb-2 ${className}`}>
    {children}
  </h5>
);

export const H6: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h6 className={`text-sm font-medium tracking-tight mt-6 mb-2 ${className}`}>
    {children}
  </h6>
);

export const P: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`my-6 text-neutral-800 dark:text-neutral-200 ${className}`}>
    {children}
  </p>
);

export const A: React.FC<{ 
  href?: string; 
  children: React.ReactNode; 
  className?: string;
  target?: string;
  rel?: string;
}> = ({ href = '#', children, className = '', target, rel }) => {
  const isExternal = href?.startsWith('http') ?? false;
  
  return (
    <a 
      href={href}
      className={`underline transition-all decoration-neutral-400 dark:decoration-neutral-600 underline-offset-2 ${className}`}
      target={target || (isExternal ? '_blank' : undefined)}
      rel={rel || (isExternal ? 'noopener noreferrer' : undefined)}
    >
      {children}
    </a>
  );
};

export const Strong: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <strong className={`font-medium ${className}`}>{children}</strong>
);

export const Em: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <em className={`italic ${className}`}>{children}</em>
);

export const UL: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <ul className={`list-disc pl-6 my-6 ${className}`}>{children}</ul>
);

export const OL: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <ol className={`list-decimal pl-6 my-6 ${className}`}>{children}</ol>
);

export const LI: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <li className={`${className}`}>{children}</li>
);

export const Code: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <code className={`px-1 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-sm ${className}`}>
    {children}
  </code>
);

export const Pre: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <pre className={`bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-x-auto border border-neutral-200 dark:border-neutral-700 py-2 px-3 text-sm my-6 ${className}`}>
    {children}
  </pre>
);

export const Blockquote: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <blockquote className={`border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 my-6 italic text-neutral-700 dark:text-neutral-300 ${className}`}>
    {children}
  </blockquote>
);
