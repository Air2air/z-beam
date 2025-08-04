// script to invalidate tag cache
// Use ES modules syntax
import { invalidateTagCache } from './app/utils/tags.js';

async function main() {
  try {
    await invalidateTagCache();
    console.log('Tag cache invalidated successfully');
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

main();
