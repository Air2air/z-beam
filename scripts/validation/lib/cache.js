/**
 * Validation Cache
 * Speeds up repeated validations by caching results for unchanged files
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = '.validation-cache';
const CACHE_TTL = 3600000; // 1 hour in milliseconds

class ValidationCache {
  constructor(validationType) {
    this.type = validationType;
    this.cacheDir = path.join(process.cwd(), CACHE_DIR);
    this.enabled = !process.env.NO_CACHE && !process.env.CI;
    
    if (this.enabled && !fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  
  /**
   * Generate hash of file content
   */
  hash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);
      const data = `${content}:${stats.mtime.getTime()}`;
      return crypto.createHash('md5').update(data).digest('hex');
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if validation result is cached and still valid
   */
  isCached(filePath) {
    if (!this.enabled) return false;
    
    const hash = this.hash(filePath);
    if (!hash) return false;
    
    const cachePath = this.getCachePath(hash);
    
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const age = Date.now() - cached.timestamp;
      
      // Cache expired
      if (age > CACHE_TTL) {
        fs.unlinkSync(cachePath);
        return false;
      }
      
      return cached.valid;
    } catch (error) {
      // Corrupted cache file, remove it
      try {
        fs.unlinkSync(cachePath);
      } catch {}
      return false;
    }
  }
  
  /**
   * Cache validation result for a file
   */
  set(filePath, isValid, metadata = {}) {
    if (!this.enabled) return;
    
    const hash = this.hash(filePath);
    if (!hash) return;
    
    const cachePath = this.getCachePath(hash);
    
    try {
      const cacheData = {
        timestamp: Date.now(),
        valid: isValid,
        file: filePath,
        metadata
      };
      
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      // Silently fail on cache write errors
      console.warn(`Warning: Could not write cache for ${filePath}`);
    }
  }
  
  /**
   * Get cache file path for hash
   */
  getCachePath(hash) {
    return path.join(this.cacheDir, `${this.type}-${hash}.json`);
  }
  
  /**
   * Clear all cache entries for this validation type
   */
  clear() {
    if (!this.enabled || !fs.existsSync(this.cacheDir)) {
      return;
    }
    
    try {
      const files = fs.readdirSync(this.cacheDir);
      const pattern = new RegExp(`^${this.type}-.*\\.json$`);
      
      let cleared = 0;
      files.forEach(file => {
        if (pattern.test(file)) {
          fs.unlinkSync(path.join(this.cacheDir, file));
          cleared++;
        }
      });
      
      console.log(`🗑️  Cleared ${cleared} cache entries for ${this.type}`);
    } catch (error) {
      console.warn(`Warning: Could not clear cache: ${error.message}`);
    }
  }
  
  /**
   * Clear all expired cache entries
   */
  static clearExpired() {
    const cacheDir = path.join(process.cwd(), CACHE_DIR);
    
    if (!fs.existsSync(cacheDir)) {
      return 0;
    }
    
    try {
      const files = fs.readdirSync(cacheDir);
      let cleared = 0;
      
      files.forEach(file => {
        const filePath = path.join(cacheDir, file);
        try {
          const cached = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const age = Date.now() - cached.timestamp;
          
          if (age > CACHE_TTL) {
            fs.unlinkSync(filePath);
            cleared++;
          }
        } catch {
          // Remove corrupted cache files
          fs.unlinkSync(filePath);
          cleared++;
        }
      });
      
      return cleared;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Get cache statistics
   */
  static getStats() {
    const cacheDir = path.join(process.cwd(), CACHE_DIR);
    
    if (!fs.existsSync(cacheDir)) {
      return { total: 0, size: 0 };
    }
    
    try {
      const files = fs.readdirSync(cacheDir);
      let totalSize = 0;
      
      files.forEach(file => {
        const stats = fs.statSync(path.join(cacheDir, file));
        totalSize += stats.size;
      });
      
      return {
        total: files.length,
        size: totalSize,
        sizeFormatted: (totalSize / 1024).toFixed(2) + ' KB'
      };
    } catch {
      return { total: 0, size: 0 };
    }
  }
}

module.exports = ValidationCache;
