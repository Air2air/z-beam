// app/components/EnhancedChartComponent.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { generateChartColors, CHART_DEFAULTS } from '../../utils/chart';

interface EnhancedChartProps {
  chartId: string;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  data?: any; // Keep flexible for now, can be typed more strictly later
  options?: any;
  useStandardColors?: boolean; // New prop to use our standard color generation
}

const EnhancedChartComponent: React.FC<EnhancedChartProps> = ({ 
  chartId, 
  chartType, 
  data, 
  options = {},
  useStandardColors = false
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Apply standard colors if requested
    let processedData = data;
    if (useStandardColors && data?.datasets) {
      processedData = {
        ...data,
        datasets: data.datasets.map((dataset: any) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || generateChartColors(data.labels?.length || 4),
          borderColor: dataset.borderColor || generateChartColors(data.labels?.length || 4),
          borderWidth: dataset.borderWidth ?? 0,
        }))
      };
    }

    // Merge with default options
    const mergedOptions = {
      ...CHART_DEFAULTS.options,
      ...options,
      plugins: {
        ...CHART_DEFAULTS.options.plugins,
        ...options.plugins,
      }
    };

    // Create chart
    chartInstanceRef.current = new Chart(ctx, {
      type: chartType,
      data: processedData,
      options: mergedOptions,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartId, chartType, data, options, useStandardColors]);

  return (
    <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={chartRef} id={chartId} />
    </div>
  );
};

export default EnhancedChartComponent;
