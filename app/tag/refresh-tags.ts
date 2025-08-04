// A simple script to invalidate the tag cache
import { invalidateTagCache } from '../utils/tags';

// Invalidate the cache
invalidateTagCache()
  .then(() => {
    console.log('Tag cache has been invalidated. Author names are now included as tags.');
  })
  .catch(error => {
    console.error('Error invalidating tag cache:', error);
  });
