// app/components/Table/TableConfig.ts
export interface TableConfig {
  maxRows?: number;
  showHeader?: boolean;
  zebraStripes?: boolean;
  tableType?: 'default' | 'comparison' | 'pricing';
  size?: 'default' | 'dense' | 'large';
  showAllTables?: boolean;
}

export const DEFAULT_TABLE_CONFIG: Required<TableConfig> = {
  maxRows: 10,
  showHeader: true,
  zebraStripes: false,
  tableType: 'default',
  size: 'default',
  showAllTables: true,
};