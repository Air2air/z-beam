// app/components/UI/SearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { SearchBarProps } from '@/types';

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  label = "Search",
  id = "search-input",
  'aria-describedby': ariaDescribedBy,
  onSubmit,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  
  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Debounce search to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInputValue("");
      onChange("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} role="search" className={`relative ${className}`}>
      {/* Screen reader accessible label */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500 dark:text-gray-400" 
            aria-hidden="true" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id={id}
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full p-3 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={placeholder}
          aria-describedby={ariaDescribedBy}
          aria-label={`${label}. Press Escape to clear.`}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            onClick={() => {
              setInputValue("");
              onChange("");
            }}
            aria-label="Clear search"
            title="Clear search"
          >
            <svg 
              className="w-4 h-4 text-gray-500 dark:text-gray-400" 
              aria-hidden="true" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}