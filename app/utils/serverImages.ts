// app/utils/serverImages.ts
// Server-side image resolution utilities.
// These run at build time (static generation), so fs.existsSync is safe.
// Never import this file in client components.

import fs from 'fs';
import path from 'path';

/**
 * Resolve an OG image path, returning the path only if the file exists on disk.
 * Falls back to undefined so createMetadata can use its own /images/og-image.jpg fallback.
 *
 * @param relativePath - Public-relative path, e.g. '/images/materials-og.jpg'
 * @returns The original path if the file exists, otherwise undefined
 */
export function resolveOgImage(relativePath: string): string | undefined {
  if (!relativePath) return undefined;
  const absolutePath = path.join(process.cwd(), 'public', relativePath);
  return fs.existsSync(absolutePath) ? relativePath : undefined;
}
