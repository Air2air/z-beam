'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import ClientOnlyChart with dynamic import to ensure it only loads on client
const ClientOnlyChart = dynamic(() => import('./ClientOnlyChart'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 p-4 rounded text-center">Loading chart...</div>
});

// Simple wrapper for the chart component
export default function ChartComponentWrapper(props: any) {
  return <ClientOnlyChart {...props} />;
}
