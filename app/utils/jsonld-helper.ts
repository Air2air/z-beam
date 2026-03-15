import { serializeJsonLd } from '@/lib/metadata/jsonld';
import { SchemaFactory } from './schemas/SchemaFactory';

/**
 * @deprecated Compatibility wrapper only. Live JSON-LD generation should use
 * `SchemaFactory` directly or render through `app/components/JsonLD/JsonLD.tsx`.
 */
export function createJsonLdForArticle(articleData: any, slug: string) {
  try {
    if (!articleData) {
      console.warn('No article data provided for JSON-LD generation');
      return null;
    }

    return new SchemaFactory(articleData, slug).generate();
  } catch (error) {
    console.error('Error creating JSON-LD via compatibility helper:', error);
    return null;
  }
}

/**
 * @deprecated Compatibility wrapper for legacy callers that still expect a
 * `<script>` string rather than using the shared serializer directly.
 */
export function createJsonLdScript(schema: any) {
  if (!schema) {
    return '';
  }

  const json = serializeJsonLd(schema);
  return json ? `<script type="application/ld+json">${json}</script>` : '';
}