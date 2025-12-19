// app/components/ErrorBoundary/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Title } from '../Title';
import { Button } from '../Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError } = this.props;
    
    console.error(
      `Error boundary caught error in ${componentName || 'unknown component'}`,
      error,
      { 
        componentStack: errorInfo.componentStack,
        errorBoundary: componentName 
      }
    );

    if (onError) {
      onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback p-6 bg-red-950 border border-red-200800 rounded-md">
          <Title level="section" title="Something went wrong" className="text-lg text-red-800200 mb-2" />
          <p className="text-red-600300 mb-4">
            {this.props.componentName 
              ? `There was an error loading the ${this.props.componentName} component.`
              : 'An unexpected error occurred.'
            }
          </p>
          <Button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="danger"
            size="md"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Component error caught by error handler', error, errorInfo);
  };
}
