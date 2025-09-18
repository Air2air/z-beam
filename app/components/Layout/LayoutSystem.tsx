// app/components/Layout/LayoutSystem.tsx
// Consolidated layout system with multiple variants

import { ReactNode } from 'react';
import { Layout } from './Layout';
import { DebugLayout } from '../Debug/DebugLayout';
import { ArticleMetadata, ComponentData } from '@/types';

export type LayoutVariant = 'default' | 'article' | 'debug' | 'minimal';

interface BaseLayoutProps {
  children?: ReactNode; // Make children optional in base props
  variant?: LayoutVariant;
  className?: string;
}

interface ArticleLayoutProps extends BaseLayoutProps {
  variant: 'article';
  components: Record<string, ComponentData> | null;
  metadata?: ArticleMetadata;
  slug?: string;
  title?: string;
  hideHeader?: boolean;
  children?: ReactNode; // Make children optional for article layouts
}

interface DebugLayoutProps extends BaseLayoutProps {
  variant: 'debug';
  activeSection?: string;
  sections?: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
  }>;
}

interface DefaultLayoutProps extends BaseLayoutProps {
  variant?: 'default' | 'minimal';
  title?: string;
  description?: string;
  showContainer?: boolean;
}

export type UniversalLayoutProps = ArticleLayoutProps | DebugLayoutProps | DefaultLayoutProps;

/**
 * Universal layout system that provides different layout variants
 */
export function UniversalLayout(props: UniversalLayoutProps) {
  const { variant = 'default', children, className } = props;

  switch (variant) {
    case 'article':
      const articleProps = props as ArticleLayoutProps;
      return (
        <div 
          data-testid="universal-layout"
          data-slug={articleProps.slug}
          data-title={articleProps.title || articleProps.metadata?.title}
          data-variant="article"
        >
          <Layout
            components={articleProps.components}
            metadata={articleProps.metadata}
            slug={articleProps.slug}
            title={articleProps.title}
            hideHeader={articleProps.hideHeader}
            className={className}
          />
        </div>
      );

    case 'debug':
      const debugProps = props as DebugLayoutProps;
      if (!children) {
        throw new Error('Debug layout requires children');
      }
      return (
        <div data-testid="universal-layout" data-variant="debug">
          <DebugLayout
            activeSection={debugProps.activeSection}
            sections={debugProps.sections}
          >
            {children}
          </DebugLayout>
        </div>
      );

    case 'minimal':
      const minimalProps = props as DefaultLayoutProps;
      return (
        <div className={className || "py-8"} data-testid="universal-layout" data-variant="minimal">
          {minimalProps.title && (
            <h1 className="text-3xl font-bold mb-4">{minimalProps.title}</h1>
          )}
          {minimalProps.description && (
            <p className="text-gray-600 mb-6">{minimalProps.description}</p>
          )}
          {children}
        </div>
      );

    case 'default':
    default:
      const defaultProps = props as DefaultLayoutProps;
      const containerClass = defaultProps.showContainer !== false 
        ? "max-w-4xl mx-auto px-4 py-8" 
        : "";
      
      return (
        <div className={className || containerClass} data-testid="universal-layout" data-variant="default">
          {defaultProps.title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{defaultProps.title}</h1>
              {defaultProps.description && (
                <p className="text-gray-600">{defaultProps.description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      );
  }
}

/**
 * Layout factory functions for common patterns
 */
export const LayoutFactories = {
  article: (props: Omit<ArticleLayoutProps, 'variant'>) => (
    <UniversalLayout {...props} variant="article" />
  ),
  
  debug: (props: Omit<DebugLayoutProps, 'variant'>) => (
    <UniversalLayout {...props} variant="debug" />
  ),
  
  page: (props: Omit<DefaultLayoutProps, 'variant'>) => (
    <UniversalLayout {...props} variant="default" />
  ),
  
  minimal: (props: Omit<DefaultLayoutProps, 'variant'>) => (
    <UniversalLayout {...props} variant="minimal" />
  ),
};

/**
 * Hook for dynamic layout selection based on context
 */
export function useLayoutVariant(context: {
  isDebug?: boolean;
  hasComponents?: boolean;
  isMinimal?: boolean;
}): LayoutVariant {
  if (context.isDebug) return 'debug';
  if (context.hasComponents) return 'article';
  if (context.isMinimal) return 'minimal';
  return 'default';
}
