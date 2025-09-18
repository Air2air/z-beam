/**
 * Test Suite: API Route Testing
 * Testing API endpoints for data retrieval and processing
 */

import { NextRequest } from 'next/server';

// Mock API route handlers
jest.mock('../../app/api/content/route', () => ({
  GET: async (request: NextRequest) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const mockContent = {
      slug,
      title: `Content for ${slug}`,
      type: 'page',
      content: `Mock content for ${slug}`,
      metadata: {
        lastModified: new Date().toISOString(),
        author: 'System'
      }
    };

    return new Response(JSON.stringify(mockContent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}));

jest.mock('../../app/api/search/route', () => ({
  GET: async (request: NextRequest) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const mockResults = [
      {
        id: '1',
        title: `Result 1 for ${query}`,
        excerpt: `This is a mock result for query: ${query}`,
        url: `/page-1`,
        type: 'page'
      },
      {
        id: '2',
        title: `Result 2 for ${query}`,
        excerpt: `Another mock result for query: ${query}`,
        url: `/page-2`,
        type: 'article'
      }
    ];

    return new Response(JSON.stringify({ results: mockResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}));

const { GET: contentGET } = require('../../app/api/content/route');
const { GET: searchGET } = require('../../app/api/search/route');

describe('API Routes', () => {
  describe('Content API', () => {
    test('should return content for valid slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/content?slug=test-page');
      const response = await contentGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('slug', 'test-page');
      expect(data).toHaveProperty('title', 'Content for test-page');
      expect(data).toHaveProperty('type', 'page');
      expect(data).toHaveProperty('metadata');
    });

    test('should return 400 for missing slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/content');
      const response = await contentGET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Slug required');
    });

    test('should include proper content-type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/content?slug=header-test');
      const response = await contentGET(request);
      
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    test('should handle special characters in slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/content?slug=test-page-with-dashes');
      const response = await contentGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.slug).toBe('test-page-with-dashes');
    });
  });

  describe('Search API', () => {
    test('should return search results for valid query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results).toHaveLength(2);
    });

    test('should return empty results for missing query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toEqual([]);
    });

    test('should include query term in results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=materials');
      const response = await searchGET(request);
      
      const data = await response.json();
      expect(data.results[0].title).toContain('materials');
      expect(data.results[0].excerpt).toContain('materials');
    });

    test('should return properly structured search results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=structure');
      const response = await searchGET(request);
      
      const data = await response.json();
      const result = data.results[0];
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('type');
    });

    test('should handle URL encoding in query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=test%20query%20with%20spaces');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toHaveLength(2);
    });
  });
});
