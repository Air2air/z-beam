// app/components/Table/Table.tsx
import React from 'react';
import { SmartTable } from './SmartTable';
import { TableProps, SmartTableData } from '@/types';
import './styles.css';

/**
 * Enhanced Table component with intelligent frontmatter organization
 * Supports Content, Technical, and Hybrid view modes
 */
export function Table({ content, config, frontmatterData }: TableProps & { frontmatterData?: SmartTableData }) {
  // Use the SmartTable implementation
  return (
    <SmartTable 
      content={content} 
      config={config} 
      frontmatterData={frontmatterData} 
    />
  );
}
