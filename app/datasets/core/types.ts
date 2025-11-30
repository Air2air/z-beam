/**
 * Shared TypeScript types for Dataset module
 */

export interface MaterialDataset {
  name?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  machineSettings?: Record<string, MachineSettingParam>;
  materialProperties?: Record<string, Record<string, MaterialProperty>>;
  faq?: any[] | { questions?: any[] };
  [key: string]: any;
}

export interface MachineSettingParam {
  value: number;
  unit: string;
  min?: number;
  max?: number;
  description?: string;
}

export interface MaterialProperty {
  value: number | string;
  unit?: string;
  min?: number;
  max?: number;
  description?: string;
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  tier2Completeness: number;
  warnings: string[];
  reason?: string;
}

export interface DatasetQualityMetrics {
  totalMaterials: number;
  completeDatasets: number;
  incompleteDatasets: number;
  completionRate: number;
  missingByParameter: Record<string, number>;
  avgTier2Completeness: number;
}

export interface GenerationOptions {
  formats?: ('json' | 'csv' | 'txt')[];
  outputDir?: string;
  verbose?: boolean;
  skipValidation?: boolean;
}

export interface GenerationResult {
  success: boolean;
  materialSlug: string;
  formats: string[];
  validation: ValidationResult;
  errors?: string[];
}

export interface BatchGenerationResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: GenerationResult[];
  metrics: DatasetQualityMetrics;
}

export interface FrontmatterChange {
  type: 'added' | 'modified' | 'deleted';
  file: string;
  timestamp: Date;
  affectedDatasets: string[];
}

export interface DatasetSyncStatus {
  inSync: boolean;
  outdatedDatasets: string[];
  lastSync: Date;
  pendingChanges: FrontmatterChange[];
}
