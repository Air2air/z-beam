import type { CategoryMetadata } from '@/types';
import { CATEGORY_METADATA } from '@/app/metadata';
import { CONTAMINANT_CATEGORY_METADATA } from '@/app/contaminantMetadata';
import { COMPOUND_CATEGORY_METADATA } from '@/app/compoundMetadata';

type CategoryMetadataMap = Record<string, CategoryMetadata>;

export type CategoryMetadataContentType = 'materials' | 'contaminants' | 'compounds';
export type ContentType = CategoryMetadataContentType | 'settings' | 'applications';

export const CONTENT_CATEGORY_METADATA_MAP: Record<ContentType, CategoryMetadataMap> = {
  materials: CATEGORY_METADATA,
  contaminants: CONTAMINANT_CATEGORY_METADATA,
  compounds: COMPOUND_CATEGORY_METADATA,
  settings: {},
  applications: {},
};

export function resolveCategoryMetadata(
  contentType: ContentType,
  category: string | undefined | null,
): CategoryMetadata | undefined {
  if (!category) {
    return undefined;
  }

  const categoryMetadata = CONTENT_CATEGORY_METADATA_MAP[contentType];
  const normalizedCategory = category.trim().toLowerCase();

  return (
    categoryMetadata[category] ||
    categoryMetadata[normalizedCategory] ||
    categoryMetadata[normalizedCategory.replace(/-/g, '_')]
  );
}

export function getValidCategoryMetadataSlugs(contentType: CategoryMetadataContentType): string[] {
  return Object.keys(CONTENT_CATEGORY_METADATA_MAP[contentType]);
}