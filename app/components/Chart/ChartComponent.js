// components/ChartComponent.tsx
"use client"; // ESSENTIAL: This marks it as a Client Component

import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';



// Define common Chart.js options/callbacks that are functions here.
// This keeps them out of the server-side payload.
const getCommonChartOptions = (chartType, textColor) => ({
  responsive: true,
  maintainAspectRatio: false, // Often useful for controlling height with CSS
  plugins: {
    legend: {
      display: true, // You might want to control this via config props if needed
      position: 'top', // Or 'left' for pie charts
      labels: {
        font: { size: 15 },
        color: textColor, // Use dynamic color
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.5)',
      titleFont: { size: 15 },
      bodyFont: { size: 15 },
      titleColor: 'rgba(255,255,255,0.3)',
      bodyColor: 'rgba(255,255,255,0.5)',
      callbacks: {
        label: function(context) { // This is the problematic function from before
          // You can customize this based on the chart type or specific needs
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (chartType === 'bar' || chartType === 'line') {
             if (context.raw !== null) {
                label += context.raw; // For bar/line, just show raw value
             }
          } else if (chartType === 'pie' || chartType === 'doughnut') {
             // For pie, you often want to show percentage
             const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
             const value = context.raw;
             const percentage = ((value / total) * 100).toFixed(1) + '%';
             label += `${value} (${percentage})`;
          }
          return label;
        },
        // You might have other tooltip callbacks like title, footer etc.
        // title: function(context) { return context[0].label; }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Impact on Performance', // Default, can be overridden by passed config
        font: { size: 15 },
        color: textColor,
      },
      ticks: {
        font: { size: 15 },
        color: textColor,
      },
      grid: { display: false } // Default, can be overridden
    },
    x: {
      ticks: {
        font: { size: 15 },
        color: textColor,
      },
      grid: { display: false } // Default, can be overridden
    }
  }
});


const ChartComponent = ({ chartId, chartType, data, options: passedOptions = {} }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // Memoize the options to prevent unnecessary re-renders
  const chartOptions = useMemo(() => {
    const isLightSection = chartId.includes('cost') || chartId.includes('CommonContaminants');
    const textColor = isLightSection ? 'rgba(80,80,80,0.5)' : 'rgba(255,255,255,0.5)';
    
    const commonOptions = getCommonChartOptions(chartType, textColor);
    
    // Deep merge function to combine options
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
            target[key] = deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    const mergedOptions = deepMerge(JSON.parse(JSON.stringify(commonOptions)), passedOptions);

    // Ensure specific overrides for pie chart scales
    if (chartType === 'pie' || chartType === 'doughnut') {
      mergedOptions.scales = {};
      if (mergedOptions.plugins && mergedOptions.plugins.legend) {
        mergedOptions.plugins.legend.position = passedOptions.plugins?.legend?.position || 'left';
      }
    }

    return mergedOptions;
  }, [chartId, chartType, passedOptions]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chartConfig = {
        type: chartType,
        data: data,
        options: chartOptions
      };

      chartInstance.current = new Chart(ctx, chartConfig);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartId, chartType, data, chartOptions]);

  return <canvas id={chartId} ref={canvasRef} style={{ maxHeight: '200px' }} />;
};

export default ChartComponent;