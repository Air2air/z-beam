import type { SchemaOrgBase, SchemaOrgGraph } from '@/app/utils/schemas/generators/types';

type JsonLdNode = Record<string, unknown> | SchemaOrgBase | SchemaOrgGraph;

export function normalizeJsonLdGraphEntries(schema: JsonLdNode | null | undefined): JsonLdNode[] {
  if (!schema) {
    return [];
  }

  const graph = schema['@graph'];
  if (Array.isArray(graph)) {
    return graph as JsonLdNode[];
  }

  return [schema];
}

export function mergeJsonLdSchemas(
  primarySchema: JsonLdNode | null | undefined,
  secondarySchema: JsonLdNode | null | undefined,
): JsonLdNode | null {
  if (!primarySchema) {
    return secondarySchema || null;
  }

  if (!secondarySchema) {
    return primarySchema;
  }

  return {
    '@context': primarySchema['@context'] || secondarySchema['@context'] || 'https://schema.org',
    '@graph': [
      ...normalizeJsonLdGraphEntries(primarySchema),
      ...normalizeJsonLdGraphEntries(secondarySchema),
    ],
  };
}

export function serializeJsonLd(schema: JsonLdNode | null | undefined): string | undefined {
  if (!schema) {
    return undefined;
  }

  return JSON.stringify(schema);
}

export function buildJsonLdMetadata(schema: JsonLdNode | null | undefined): Record<string, string> | undefined {
  const serialized = serializeJsonLd(schema);
  if (!serialized) {
    return undefined;
  }

  return {
    'application-ld+json': serialized,
  };
}