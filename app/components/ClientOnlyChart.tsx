'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';

// Client-only Chart component
export default function ClientOnlyChart(props: any) {
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Ensure we only render on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the options to prevent unnecessary re-renders
  const chartOptions = useMemo(() => {
    if (!props.chartId || !props.chartType) return {};
    
    const isLightSection = props.chartId.includes('cost') || props.chartId.includes('CommonContaminants');
    const textColor = isLightSection ? 'rgba(80,80,80,0.5)' : 'rgba(255,255,255,0.5)';
    
    const getCommonChartOptions = (chartType: string, textColor: string) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            font: { size: 15 },
            color: textColor,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255,255,255,0.5)',
          titleFont: { size: 15 },
          bodyFont: { size: 15 },
          titleColor: 'rgba(255,255,255,0.3)',
          bodyColor: 'rgba(255,255,255,0.5)',
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (chartType === 'bar' || chartType === 'line') {
                if (context.raw !== null) {
                  label += context.raw;
                }
              } else if (chartType === 'pie' || chartType === 'doughnut') {
                const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                const value = context.raw;
                const percentage = ((value / total) * 100).toFixed(1) + '%';
                label += `${value} (${percentage})`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Impact on Performance',
            font: { size: 15 },
            color: textColor,
          },
          ticks: {
            font: { size: 15 },
            color: textColor,
          },
          grid: { display: false }
        },
        x: {
          ticks: {
            font: { size: 15 },
            color: textColor,
          },
          grid: { display: false }
        }
      }
    });
    
    const commonOptions = getCommonChartOptions(props.chartType, textColor);
    
    // Deep merge with passed options
    const deepMerge = (target: any, source: any) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && 
              typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
            target[key] = deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    const mergedOptions = deepMerge(JSON.parse(JSON.stringify(commonOptions)), props.options || {});

    // Pie chart specific adjustments
    if (props.chartType === 'pie' || props.chartType === 'doughnut') {
      mergedOptions.scales = {};
      if (mergedOptions.plugins && mergedOptions.plugins.legend) {
        mergedOptions.plugins.legend.position = props.options?.plugins?.legend?.position || 'left';
      }
    }

    return mergedOptions;
  }, [props.chartId, props.chartType, props.options]);

  useEffect(() => {
    if (!isClient || !canvasRef.current || !props.data) return;

    // Dynamic import Chart.js only on client
    import('chart.js/auto').then((Chart) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chartConfig = {
        type: props.chartType,
        data: props.data,
        options: chartOptions
      };

      chartInstance.current = new Chart.default(ctx, chartConfig);
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [isClient, props.chartId, props.chartType, props.data, chartOptions]);

  // Only render on client
  if (!isClient) {
    return <div className="flex items-center justify-center p-4">Loading chart...</div>;
  }

  return <canvas id={props.chartId} ref={canvasRef} style={{ maxHeight: '200px' }} />;
}
