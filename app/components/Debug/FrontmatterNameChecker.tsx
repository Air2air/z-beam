'use client';

import { useState, useEffect } from 'react';

// This component helps verify if a given string would be a valid frontmatter name
export function FrontmatterNameChecker() {
  const [nameToCheck, setNameToCheck] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    reason?: string;
    suggestion?: string;
  } | null>(null);
  
  // Function to validate a frontmatter name
  const validateName = (name: string) => {
    if (!name.trim()) {
      return {
        isValid: false,
        reason: 'Name cannot be empty'
      };
    }
    
    // Check for valid kebab-case
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      // Try to generate a suggested kebab-case version
      const suggestion = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .replace(/\s+/g, '-')        // Replace spaces with dashes
        .replace(/-+/g, '-')         // Replace multiple dashes with single dash
        .trim();
        
      return {
        isValid: false,
        reason: 'Name should be in kebab-case (lowercase with hyphens)',
        suggestion: suggestion
      };
    }
    
    // Check for length constraints
    if (name.length < 3) {
      return {
        isValid: false,
        reason: 'Name is too short (minimum 3 characters)'
      };
    }
    
    if (name.length > 60) {
      const suggestion = name.substring(0, 60);
      return {
        isValid: false,
        reason: 'Name is too long (maximum 60 characters)',
        suggestion
      };
    }
    
    return {
      isValid: true
    };
  };
  
  const handleCheckName = () => {
    try {
      const result = validateName(nameToCheck);
      setValidationResult(result);
    } catch (err) {
      console.error('Name validation error', err);
      setValidationResult({
        isValid: false,
        reason: 'Error checking name'
      });
    }
  };
  
  const handleUseSuggestion = () => {
    if (validationResult?.suggestion) {
      setNameToCheck(validationResult.suggestion);
      // Re-validate with the suggestion
      setValidationResult(validateName(validationResult.suggestion));
    }
  };
  
  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="mb-3">Frontmatter Name Checker</h3>
      <p className="text-sm text-gray-600 mb-4">
        Check if a name follows the kebab-case convention used for slugs and filenames.
      </p>
      
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="nameInput" className="block text-sm text-gray-700 mb-1">
            Name to check
          </label>
          <div className="flex space-x-2">
            <input
              id="nameInput"
              type="text"
              value={nameToCheck}
              onChange={(e) => setNameToCheck(e.target.value)}
              placeholder="Enter a name to validate"
              className="flex-1 rounded border-gray-300 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleCheckName}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Check
            </button>
          </div>
        </div>
        
        {validationResult && (
          <div className={`p-3 rounded ${validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-5 w-5 ${validationResult.isValid ? 'text-green-500' : 'text-red-500'}`}>
                {validationResult.isValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={validationResult.isValid ? 'text-green-800' : 'text-red-800'}>
                  {validationResult.isValid ? 'Valid name' : 'Invalid name'}
                </h3>
                {!validationResult.isValid && validationResult.reason && (
                  <div className="mt-1 text-sm text-red-700">
                    {validationResult.reason}
                  </div>
                )}
                
                {validationResult.suggestion && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Suggested format:</p>
                    <div className="flex mt-1">
                      <code className="px-2 py-1 bg-gray-100 text-sm rounded font-mono">
                        {validationResult.suggestion}
                      </code>
                      <button
                        type="button"
                        onClick={handleUseSuggestion}
                        className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                      >
                        Use this
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 border-t pt-4">
        <h4 className="text-gray-700 mb-2">Naming Guidelines</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Use lowercase letters, numbers, and hyphens only</li>
          <li>Start and end with a letter or number, not a hyphen</li>
          <li>Use hyphens to separate words (kebab-case)</li>
          <li>Keep names between 3-60 characters</li>
          <li>Avoid special characters and spaces</li>
          <li>Use descriptive, SEO-friendly names</li>
        </ul>
      </div>
    </div>
  );
}
