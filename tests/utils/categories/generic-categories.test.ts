/**
 * Generic Category Utilities Tests
 * Tests the consolidated category system that works for all content types
 */

import { 
  getAllCategoriesGeneric, 
  getSubcategoryInfoGeneric, 
  getItemInfoGeneric,
  type GenericCategoryInfo,
  type GenericItemInfo
} from '@/app/utils/categories/generic';

describe('Generic Category Utilities', () => {
  describe('getAllCategoriesGeneric', () => {
    it('loads materials categories correctly', async () => {
      const categories = await getAllCategoriesGeneric<GenericItemInfo>('materials');
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check structure
      categories.forEach(cat => {
        expect(cat).toHaveProperty('slug');
        expect(cat).toHaveProperty('label');
        expect(cat).toHaveProperty('items');
        expect(cat).toHaveProperty('subcategories');
        expect(Array.isArray(cat.items)).toBe(true);
        expect(Array.isArray(cat.subcategories)).toBe(true);
      });
    });

    it('loads contaminants categories correctly', async () => {
      const categories = await getAllCategoriesGeneric<GenericItemInfo>('contaminants');
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('loads compounds categories correctly', async () => {
      const categories = await getAllCategoriesGeneric<GenericItemInfo>('compounds');
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('loads settings categories correctly', async () => {
      const categories = await getAllCategoriesGeneric<GenericItemInfo>('settings');
      
      expect(Array.isArray(categories)).toBe(true);
      // Settings may not have categories yet - that's okay
      // Just verify it returns an array without errors
    });
  });

  describe('getSubcategoryInfoGeneric', () => {
    it('finds existing subcategories', async () => {
      const result = await getSubcategoryInfoGeneric<GenericItemInfo>(
        'materials',
        'metal',
        'ferrous'
      );
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.slug).toBe('ferrous');
        expect(result.label).toBeTruthy();
        expect(Array.isArray(result.items)).toBe(true);
      }
    });

    it('returns null for non-existent subcategories', async () => {
      const result = await getSubcategoryInfoGeneric<GenericItemInfo>(
        'materials',
        'non-existent-category',
        'non-existent-subcategory'
      );
      
      expect(result).toBeNull();
    });
  });

  describe('getItemInfoGeneric', () => {
    it('finds existing items', async () => {
      const result = await getItemInfoGeneric<GenericItemInfo>(
        'materials',
        'metal',
        'ferrous',
        'steel-laser-cleaning'
      );
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.slug).toBe('steel-laser-cleaning');
        expect(result.name).toBeTruthy();
        expect(result.category).toBe('metal');
        expect(result.subcategory).toBe('ferrous');
      }
    });

    it('returns null for non-existent items', async () => {
      const result = await getItemInfoGeneric<GenericItemInfo>(
        'materials',
        'metal',
        'ferrous',
        'non-existent-material'
      );
      
      expect(result).toBeNull();
    });
  });

  describe('Type-specific wrappers', () => {
    it('materialCategories maps items to materials', async () => {
      const { getAllCategories } = await import('@/app/utils/materialCategories');
      const categories = await getAllCategories();
      
      expect(categories[0]).toHaveProperty('materials');
      expect(categories[0]).toHaveProperty('subcategories');
      expect(categories[0].subcategories[0]).toHaveProperty('materials');
    });

    it('contaminantCategories maps items to contaminants', async () => {
      const { getAllCategories } = await import('@/app/utils/contaminantCategories');
      const categories = await getAllCategories();
      
      expect(categories[0]).toHaveProperty('contaminants');
      expect(categories[0].subcategories[0]).toHaveProperty('contaminants');
    });

    it('compoundCategories maps items to compounds', async () => {
      const { getAllCategories } = await import('@/app/utils/compoundCategories');
      const categories = await getAllCategories();
      
      expect(categories[0]).toHaveProperty('compounds');
      expect(categories[0].subcategories[0]).toHaveProperty('compounds');
    });

    it('settingsCategories maps items to settings', async () => {
      const { getAllCategories } = await import('@/app/utils/settingsCategories');
      const categories = await getAllCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      // Settings may not have categories yet - just verify structure
      if (categories.length > 0) {
        expect(categories[0]).toHaveProperty('settings');
        expect(categories[0]).toHaveProperty('subcategories');
      }
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains same API as before consolidation', async () => {
      const { 
        getAllCategories, 
        getSubcategoryInfo 
      } = await import('@/app/utils/materialCategories');
      
      // Should work exactly as before
      const categories = await getAllCategories();
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      
      const subcategory = await getSubcategoryInfo('metal', 'ferrous');
      expect(subcategory).toBeDefined();
      expect(subcategory?.materials).toBeDefined();
    });
  });
});
