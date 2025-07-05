// app/utils/chart.ts
// Chart utilities for consistent chart styling and data generation

/**
 * Generates gradient color arrays for charts
 * @param length Number of colors to generate (default: 4)
 * @returns Array of RGBA color strings with gradient effect
 */
export function generateChartColors(length: number = 4): string[] {
  return Array.from({length}, (_, i) => {
    const t = length === 1 ? 0 : i / (length - 1);
    if (t < 0.5) {
      const alpha = 0.6 - 0.3 * (t / 0.5);
      return `rgba(255,255,255,${alpha})`;
    } else {
      const alpha = 0.3 + 0.3 * ((t - 0.5) / 0.5);
      return `rgba(80,80,80,${alpha})`;
    }
  });
}

/**
 * Generates border colors with same gradient logic
 * @param length Number of colors to generate (default: 4)
 * @returns Array of RGBA border color strings
 */
export function generateChartBorderColors(length: number = 4): string[] {
  return generateChartColors(length); // Same logic for borders
}

/**
 * Standard chart configuration objects
 */
export const CHART_DEFAULTS = {
  // Standard 4-color set for most charts
  colors: generateChartColors(4),
  borderColors: generateChartBorderColors(4),
  borderWidth: 0,
  
  // Common chart options
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        // Default tooltip settings - can be overridden per chart
      }
    }
  },

  // Options for charts with legends
  optionsWithLegend: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'left' as const,
      },
      tooltip: {
        // Default tooltip settings
      }
    }
  }
};

/**
 * Creates a standard chart dataset with generated colors
 * @param label Dataset label
 * @param data Data array
 * @param length Number of data points (for color generation)
 * @returns Chart.js compatible dataset object
 */
export function createChartDataset(
  label: string, 
  data: number[], 
  length?: number
) {
  const colorCount = length || data.length;
  return {
    label,
    data,
    backgroundColor: generateChartColors(colorCount),
    borderColor: generateChartBorderColors(colorCount),
    borderWidth: 0,
  };
}

/**
 * Creates a complete chart data object with standard styling
 * @param labels Chart labels
 * @param datasets Array of dataset configurations
 * @returns Complete Chart.js data object
 */
export function createChartData(
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
  }>
) {
  return {
    labels,
    datasets: datasets.map(dataset => 
      createChartDataset(dataset.label, dataset.data, labels.length)
    ),
  };
}

/**
 * Pre-configured chart data for common cleaning comparisons
 */
export const CLEANING_COMPARISON_DATA = {
  labels: ["Laser Cleaning", "Abrasive Blasting", "Chemical Cleaning", "Ultrasonic Cleaning"],
  effectiveness: [90, 70, 60, 80],
  cost: [85, 60, 40, 70],
  safety: [95, 30, 20, 80],
  speed: [80, 90, 50, 60],
};

/**
 * Creates effectiveness comparison chart data
 * @param customData Optional custom data, falls back to standard values
 * @returns Chart data for effectiveness comparison
 */
export function createEffectivenessChart(customData?: number[]) {
  const data = customData || CLEANING_COMPARISON_DATA.effectiveness;
  return createChartData(CLEANING_COMPARISON_DATA.labels, [{
    label: 'Effectiveness',
    data
  }]);
}

/**
 * Creates risk comparison chart data for traditional methods
 * @param customData Optional custom risk data
 * @returns Chart data for risk comparison
 */
export function createRiskComparisonChart(customData?: number[]) {
  const data = customData || [20, 80, 90, 40]; // Inverse of safety scores
  return createChartData(CLEANING_COMPARISON_DATA.labels, [{
    label: 'Risk Level',
    data
  }]);
}

/**
 * Creates performance impact chart for contaminants
 * @param labels Contaminant names
 * @param data Impact values
 * @param yAxisTitle Optional Y-axis title
 * @returns Complete chart configuration
 */
export function createContaminantImpactChart(
  labels: string[],
  data: number[],
  yAxisTitle: string = 'Impact on Performance'
) {
  return {
    data: createChartData(labels, [{
      label: 'Impact on Performance',
      data
    }]),
    options: {
      ...CHART_DEFAULTS.options,
      scales: {
        y: {
          title: { text: yAxisTitle },
          beginAtZero: true,
        },
      },
    }
  };
}
