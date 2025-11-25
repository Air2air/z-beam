// tests/app/api.test.ts
/**
 * Tests for API routes in the app directory
 * Tests critical API endpoints for data fetching and error handling
 */

// Mock Next.js response utilities
const mockJson = jest.fn();
const mockNextResponse = {
  json: jest.fn((data, options) => ({
    data,
    status: options?.status || 200,
    ok: options?.status ? options.status < 400 : true,
  })),
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
  })),
}));

describe('API Routes Tests', () => {
  // Helper function for creating mock requests
  const createMockRequest = (searchParams: Record<string, string>) => {
    const url = new URL('http://localhost:3000/api/search');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return { url: url.toString() };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNextResponse.json.mockImplementation((data, options) => ({
      data,
      status: options?.status || 200,
      ok: options?.status ? options.status < 400 : true,
    }));
  });

  describe('Search API (/api/search)', () => {
    it('should return search results for valid query', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: 'aluminum' });
      const response = await GET(request);

      expect(response.data.results).toBeDefined();
      expect(response.data.results.length).toBeGreaterThan(0);
      expect(response.data.query).toBe('aluminum');
      expect(response.data.totalCount).toBe(response.data.results.length);
      expect(response.status).toBe(200);
    });

    it('should return empty results for missing query', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({});
      const response = await GET(request);

      expect(response.data.results).toEqual([]);
      expect(response.status).toBe(200);
    });

    it('should filter results based on query relevance', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: 'laser' });
      const response = await GET(request);

      // Results should contain the query term
      response.data.results.forEach((result: any) => {
        const containsQuery = 
          result.title.toLowerCase().includes('laser') ||
          result.excerpt.toLowerCase().includes('laser');
        expect(containsQuery).toBe(true);
      });
    });

    it('should handle search errors gracefully', async () => {
      const { GET } = require('../../app/api/search/route');
      
      // Pass malformed request to trigger error
      const response = await GET(null);

      expect(response.data.error).toBe('Search service error');
      expect(response.status).toBe(500);
    });

    it('should handle empty search query', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: '' });
      const response = await GET(request);

      expect(response.data.results).toEqual([]);
      expect(response.status).toBe(200);
    });

    it('should format search results correctly', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: 'test' });
      const response = await GET(request);

      response.data.results.forEach((result: any) => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('excerpt');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('score');
        expect(typeof result.score).toBe('number');
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should handle case-insensitive search', async () => {
      const { GET } = require('../../app/api/search/route');
      
      const lowerCaseRequest = createMockRequest({ q: 'aluminum' });
      const upperCaseRequest = createMockRequest({ q: 'ALUMINUM' });
      const mixedCaseRequest = createMockRequest({ q: 'AlUmInUm' });

      const lowerResponse = await GET(lowerCaseRequest);
      const upperResponse = await GET(upperCaseRequest);
      const mixedResponse = await GET(mixedCaseRequest);

      // All should return results
      expect(lowerResponse.data.results.length).toBeGreaterThan(0);
      expect(upperResponse.data.results.length).toBeGreaterThan(0);
      expect(mixedResponse.data.results.length).toBeGreaterThan(0);
    });
  });

  describe('API Error Handling', () => {
    it('should handle malformed requests', async () => {
      const { GET } = require('../../app/api/search/route');
      
      // Pass malformed request
      const response = await GET(null);

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('Search service error');
    });
  });

  describe('API Response Format', () => {
    it('should return consistent JSON format for search', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: 'test' });
      const response = await GET(request);

      expect(response.data).toHaveProperty('results');
      expect(response.data).toHaveProperty('totalCount');
      expect(response.data).toHaveProperty('query');
      expect(Array.isArray(response.data.results)).toBe(true);
      expect(typeof response.data.totalCount).toBe('number');
    });
  });

  describe('Performance', () => {
    it('should handle search with reasonable performance', async () => {
      const { GET } = require('../../app/api/search/route');
      const request = createMockRequest({ q: 'aluminum cleaning laser' });
      
      const startTime = performance.now();
      await GET(request);
      const endTime = performance.now();

      // Search should be reasonably fast
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
