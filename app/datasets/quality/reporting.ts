/**
 * Dataset Quality Reporting and Formatting
 */

import type { DatasetQualityMetrics } from './types';

/**
 * Quality policy constants
 */
export const QUALITY_POLICY = {
  tier1: {
    required: true,
    minCompliance: 100,
    description: 'All 8 machine settings parameters with min/max values'
  },
  tier2: {
    required: false,
    minCompliance: 80,
    description: '80%+ material property completeness'
  },
  tier3: {
    required: false,
    minCompliance: 0,
    description: 'Optional safety, regulatory, vendor data'
  }
} as const;

/**
 * Format quality metrics for console output
 */
export function formatQualityReport(metrics: DatasetQualityMetrics): string {
  const lines = [
    '┌─────────────────────────────────────────────────┐',
    '│        DATASET QUALITY REPORT                   │',
    '├─────────────────────────────────────────────────┤',
    `│ Total Materials: ${metrics.totalMaterials.toString().padEnd(31)} │`,
    `│ Complete Datasets: ${metrics.completeDatasets} (${metrics.completionRate}%)${' '.repeat(Math.max(0, 21 - metrics.completeDatasets.toString().length - metrics.completionRate.toString().length))}│`,
    `│ Incomplete Datasets: ${metrics.incompleteDatasets} (${100 - metrics.completionRate}%)${' '.repeat(Math.max(0, 19 - metrics.incompleteDatasets.toString().length - (100 - metrics.completionRate).toString().length))}│`,
    '│                                                 │',
    '│ Missing Parameters:                             │'
  ];
  
  // Add parameter counts
  Object.entries(metrics.missingByParameter).forEach(([param, count]: [string, number]) => {
    if (count > 0) {
      const warning = count > 10 ? ' ⚠️' : '';
      const line = `│   • ${param}: ${count} materials${warning}`;
      lines.push(line.padEnd(50) + '│');
    }
  });
  
  // Add Tier 2 average
  const tier2Status = metrics.avgTier2Completeness >= 80 ? '✅' : '⚠️';
  lines.push('│                                                 │');
  lines.push(`│ Tier 2 Average Completeness: ${metrics.avgTier2Completeness}% ${tier2Status}${' '.repeat(Math.max(0, 11 - metrics.avgTier2Completeness.toString().length))}│`);
  lines.push('└─────────────────────────────────────────────────┘');
  
  return lines.join('\n');
}

/**
 * Format quality metrics as JSON for CI/CD
 */
export function formatQualityJSON(metrics: DatasetQualityMetrics): string {
  return JSON.stringify({
    summary: {
      total: metrics.totalMaterials,
      complete: metrics.completeDatasets,
      incomplete: metrics.incompleteDatasets,
      completionRate: metrics.completionRate
    },
    tier2: {
      avgCompleteness: metrics.avgTier2Completeness,
      passesThreshold: metrics.avgTier2Completeness >= 80
    },
    missingParameters: metrics.missingByParameter,
    timestamp: new Date().toISOString()
  }, null, 2);
}

/**
 * Generate quality dashboard HTML
 */
export function generateQualityDashboard(metrics: DatasetQualityMetrics): string {
  const completionColor = metrics.completionRate >= 90 ? '#22c55e' : 
                         metrics.completionRate >= 70 ? '#eab308' : '#ef4444';
  const tier2Color = metrics.avgTier2Completeness >= 80 ? '#22c55e' : '#eab308';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dataset Quality Dashboard</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      background: #f9fafb;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 24px 0;
      color: #111827;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .metric-label {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .progress-bar {
      width: 100%;
      height: 32px;
      background: #e5e7eb;
      border-radius: 16px;
      overflow: hidden;
      margin: 16px 0;
    }
    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .parameter-list {
      list-style: none;
      padding: 0;
    }
    .parameter-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📊 Dataset Quality Dashboard</h1>
    <p style="color: #6b7280;">Generated: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="card">
    <h2>Overview</h2>
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${metrics.totalMaterials}</div>
        <div class="metric-label">Total Materials</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: ${completionColor}">${metrics.completeDatasets}</div>
        <div class="metric-label">Complete Datasets</div>
      </div>
      <div class="metric">
        <div class="metric-value">${metrics.incompleteDatasets}</div>
        <div class="metric-label">Incomplete Datasets</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: ${completionColor}">${metrics.completionRate}%</div>
        <div class="metric-label">Completion Rate</div>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${metrics.completionRate}%; background: ${completionColor};">
        ${metrics.completionRate}%
      </div>
    </div>
  </div>
  
  <div class="card">
    <h2>Tier 2: Material Properties</h2>
    <div class="metric">
      <div class="metric-value" style="color: ${tier2Color}">${metrics.avgTier2Completeness}%</div>
      <div class="metric-label">Average Completeness</div>
      <span class="badge ${metrics.avgTier2Completeness >= 80 ? 'badge-success' : 'badge-warning'}">
        ${metrics.avgTier2Completeness >= 80 ? '✅ Passes Threshold' : '⚠️ Below Threshold (80%)'}
      </span>
    </div>
  </div>
  
  <div class="card">
    <h2>Missing Parameters</h2>
    <ul class="parameter-list">
      ${Object.entries(metrics.missingByParameter)
        .filter(([, count]: [string, number]) => count > 0)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .map(([param, count]: [string, number]) => `
          <li>
            <span>${param}</span>
            <span class="badge ${count > 10 ? 'badge-danger' : count > 5 ? 'badge-warning' : 'badge-success'}">
              ${count} materials
            </span>
          </li>
        `).join('')}
    </ul>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create summary for PR comments or build logs
 */
export function createQualitySummary(metrics: DatasetQualityMetrics): string {
  const status = metrics.completionRate >= 90 ? '✅' : 
                 metrics.completionRate >= 70 ? '⚠️' : '❌';
  
  return `
${status} **Dataset Quality: ${metrics.completionRate}%**

- **Complete**: ${metrics.completeDatasets}/${metrics.totalMaterials} materials
- **Tier 2 Avg**: ${metrics.avgTier2Completeness}% ${metrics.avgTier2Completeness >= 80 ? '✅' : '⚠️'}

${Object.entries(metrics.missingByParameter)
  .filter(([, count]: [string, number]) => count > 0 && count > 5)
  .map(([param, count]: [string, number]) => `- ⚠️ \`${param}\`: ${count} materials missing`)
  .join('\n')}
  `.trim();
}
