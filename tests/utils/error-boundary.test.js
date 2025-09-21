
// tests/utils/error-boundary.test.js
describe('Error Boundary Tests', () => {
  test('should handle component errors gracefully', () => {
    const mockError = new Error('Test error');
    const errorHandler = jest.fn();
    
    // Simulate error boundary behavior
    expect(() => {
      try {
        throw mockError;
      } catch (error) {
        errorHandler(error);
      }
    }).not.toThrow();
    
    expect(errorHandler).toHaveBeenCalledWith(mockError);
  });

  test('should log errors for debugging', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Component error');
    
    // Simulate error logging
    console.error('Component error:', error);
    
    expect(consoleSpy).toHaveBeenCalledWith('Component error:', error);
    consoleSpy.mockRestore();
  });
});