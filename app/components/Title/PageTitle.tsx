// app/components/Title/PageTitle.tsx
'use client';

import { TitleProps } from '@/types';
import { Title } from './Title';

/**
 * PageTitle - Convenience wrapper around Title component with level='page' preset
 * For backwards compatibility with existing code that imports PageTitle directly
 */
export function PageTitle(props: TitleProps) {
  return <Title {...props} level={props.level || 'page'} />;
}

// Export for backward compatibility
export default PageTitle;
