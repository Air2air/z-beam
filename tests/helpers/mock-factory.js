
// tests/helpers/mock-factory.js
/**
 * Centralized mock factory for consistent test mocking
 */

class MockFactory {
  static createContentAPIMock() {
    return {
      getArticle: jest.fn().mockResolvedValue({
        slug: 'test-article',
        metadata: { title: 'Test Article' },
        components: {}
      }),
      getAllArticles: jest.fn().mockResolvedValue([]),
      loadComponent: jest.fn().mockResolvedValue(null),
      loadPageData: jest.fn().mockResolvedValue({})
    };
  }

  static createTagsMock() {
    return {
      getTagsContentWithMatchCounts: jest.fn().mockResolvedValue({
        content: ['test', 'mock'],
        counts: { test: 1, mock: 1 }
      }),
      parseTagsFromContent: jest.fn().mockReturnValue(['test']),
      articleMatchesTag: jest.fn().mockReturnValue(true)
    };
  }

  static createLayoutMock() {
    return {
      Layout: ({ children, components, metadata, slug }) => ({
        type: 'Layout',
        props: { children, components, metadata, slug }
      })
    };
  }

  static createNextNavigationMock() {
    return {
      notFound: jest.fn(),
      redirect: jest.fn(),
      useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn()
      })
    };
  }
}

module.exports = MockFactory;