import { Article, SearchableArticle } from '@/types';
import { slugToDisplayName, capitalizeWords } from './formatting';

type FrontmatterLike = {
  tags?: unknown;
  keywords?: unknown;
  category?: unknown;
  subject?: unknown;
  articleType?: unknown;
  author?: unknown;
  name?: unknown;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function inferSlugTags(slug: string): string[] {
  if (!slug) return [];

  const tags: string[] = [];
  const parts = slug
    .split('-')
    .map((part) => part.trim())
    .filter((part) => part.length > 2);

  tags.push(
    ...parts.map((part) => (part === 'industrial' ? 'Industrial' : part))
  );

  if (slug.includes('cleaning') || slug.includes('treatment')) {
    tags.push('Surface Treatment');
  }

  if (slug.includes('semiconductor')) {
    tags.push('Electronics');
  }

  if (slug.includes('industrial')) {
    tags.push('Industrial');
  }

  if (slug.includes('precision') && slug.includes('cleaning')) {
    tags.push('Precision Cleaning');
  }

  return tags;
}

function inferContentTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  if (text.includes('medical') || text.includes('biomedical') || text.includes('surgical')) {
    tags.push('Medical');
  }

  if (text.includes('contaminant removal')) {
    tags.push('Contaminant Removal');
  }

  if (text.includes('surface treatment')) {
    tags.push('Surface Treatment');
  }

  return tags;
}

function dedupeCaseInsensitive(tags: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    deduped.push(tag.trim());
  }

  return deduped;
}

// Main article enrichment function
export function enrichArticle(article: Article): SearchableArticle {
  const frontmatter = (article.frontmatter || {}) as FrontmatterLike;
  const slug = asString(article.slug);
  const existingHref = asString(article.href);

  const href = existingHref || (slug ? `/${slug}` : '#');

  const name =
    asString(article.name) ||
    asString(frontmatter.name) ||
    (slug ? slugToDisplayName(slug) : '');

  const inferredTitle = asString(article.title);
  const inferredDescription = asString(article.description);

  const category = asString(frontmatter.category);

  const tagCandidates: string[] = [
    asString(article.author),
    asString(frontmatter.author),
    ...asStringArray(frontmatter.tags),
    ...asStringArray(frontmatter.keywords),
    category ? capitalizeWords(category) : '',
    asString(frontmatter.subject),
    asString(frontmatter.articleType),
    ...inferSlugTags(slug),
    ...inferContentTags(inferredTitle, inferredDescription),
  ];

  const tags = dedupeCaseInsensitive(tagCandidates);

  return {
    ...article,
    href,
    name,
    tags,
  } as SearchableArticle;
}

// Batch process multiple articles
export function enrichArticles(articles: Article[]): SearchableArticle[] {
  return articles.map(article => enrichArticle(article));
}