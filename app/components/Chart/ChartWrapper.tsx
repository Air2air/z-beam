'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import for the actual ChartComponent
const ActualChartComponent = dynamic(() => import('./ChartComponent'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading chart...</div>,
  ssr: false,
});

// Client wrapper that handles the chart rendering
export default function ChartWrapper(props: any) {
  return <ActualChartComponent {...props} />;
}
