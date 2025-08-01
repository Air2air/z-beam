// app/components/Table/TableConfig.ts
export interface TableConfig {
  maxRows?: number;
  showHeader?: boolean;
  zebraStripes?: boolean;
  tableType?: 'default' | 'spec' | 'comparison' | 'pricing';
  size?: 'default' | 'dense' | 'large';
  bordered?: boolean;
  caption?: string;
  className?: string;
}

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  maxRows: 50,
  showHeader: true,
  zebraStripes: true,
  tableType: 'default',
  size: 'default',
  bordered: true,
};