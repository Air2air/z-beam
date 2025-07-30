// app/components/Table/TableConfig.ts
export interface TableConfig {
  maxRows?: number;
  showHeader?: boolean;
  zebraStripes?: boolean;
  tableType?: 'default' | 'comparison' | 'pricing';
  size?: 'default' | 'dense' | 'large';
}

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  maxRows: 50,
  showHeader: true,
  zebraStripes: false,
  tableType: 'default',
  size: 'default',
};