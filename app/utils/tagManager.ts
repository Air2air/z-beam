// app/utils/tagManager.ts
// Client-side tag manager utility
'use client';

export interface TagManagerOptions {
  caseSensitive?: boolean;
  allowDuplicates?: boolean;
  normalizeTags?: boolean;
}

export class TagManager {
  private tags: Set<string>;
  private options: TagManagerOptions;
  
  constructor(initialTags: string[] = [], options: TagManagerOptions = {}) {
    this.options = {
      caseSensitive: false,
      allowDuplicates: false,
      normalizeTags: true,
      ...options
    };
    
    this.tags = new Set();
    this.addTags(initialTags);
  }
  
  private normalizeTag(tag: string): string {
    if (!this.options.normalizeTags) return tag;
    return this.options.caseSensitive ? tag : tag.toLowerCase();
  }
  
  public addTag(tag: string): void {
    if (!tag) return;
    this.tags.add(this.normalizeTag(tag));
  }
  
  public addTags(tags: string[]): void {
    if (!tags || !Array.isArray(tags)) return;
    tags.forEach(tag => this.addTag(tag));
  }
  
  public hasTag(tag: string): boolean {
    if (!tag) return false;
    return this.tags.has(this.normalizeTag(tag));
  }
  
  public getTags(): string[] {
    return Array.from(this.tags);
  }
}

/**
 * Export a helper function to create tag managers
 */
export function createTagManager(initialTags?: string[], options?: TagManagerOptions): TagManager {
  return new TagManager(initialTags, options);
}
