// A simple script to invalidate the tag cache
import { invalidateTagCache } from '../utils/tags';

// Invalidate the cache
invalidateTagCache()
  .then(() => {
    // Tag cache has been invalidated
  })
  .catch(error => {
    console.error('Error invalidating tag cache:', error);
  });
