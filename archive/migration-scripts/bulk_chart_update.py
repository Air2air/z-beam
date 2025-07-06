#!/usr/bin/env python3
"""
Bulk update script to replace duplicate chart color generation code
in all MDX files with imports and usage of the new chart utilities.
"""

import os
import re
import glob
from pathlib import Path

# Path to the MDX files
MDX_DIR = "app/(materials)/posts/"

# The long duplicate color generation pattern
OLD_BACKGROUND_PATTERN = r"backgroundColor: Array\.from\(\{length: \d+\}, \(_, i\) => \{ const t = i / \d+; if \(t < 0\.5\) \{ const alpha = 0\.6 - 0\.3 \* \(t / 0\.5\); return `rgba\(255,255,255,\$\{alpha\}\)`; \} else \{ const alpha = 0\.3 \+ 0\.3 \* \(\(t - 0\.5\) / 0\.5\); return `rgba\(80,80,80,\$\{alpha\}\)`; \} \}\)"

OLD_BORDER_PATTERN = r"borderColor: Array\.from\(\{length: \d+\}, \(_, i\) => \{ const t = i / \d+; if \(t < 0\.5\) \{ const alpha = 0\.6 - 0\.3 \* \(t / 0\.5\); return `rgba\(255,255,255,\$\{alpha\}\)`; \} else \{ const alpha = 0\.3 \+ 0\.3 \* \(\(t - 0\.5\) / 0\.5\); return `rgba\(80,80,80,\$\{alpha\}\)`; \} \}\)"

# Import statement to add at the top of MDX files
IMPORT_STATEMENT = """import { createContaminantImpactChart, createEffectivenessChart, createRiskComparisonChart, generateChartColors, generateChartBorderColors, CHART_DEFAULTS } from '@/app/utils/chart';
"""


def process_mdx_file(file_path):
    """Process a single MDX file to update chart configurations."""
    print(f"Processing: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # Add import statement if not already present
    if "from '@/app/utils/chart'" not in content:
        # Find where to insert the import (after existing imports or at the top)
        import_match = re.search(r"(import .+?;[\s\S]*?)(\n\n|$)", content)
        if import_match:
            # Insert after existing imports
            content = (
                content[: import_match.end()]
                + IMPORT_STATEMENT
                + content[import_match.end() :]
            )
        else:
            # Insert at the very beginning
            content = IMPORT_STATEMENT + "\n" + content

    # Replace backgroundColor patterns
    content = re.sub(
        OLD_BACKGROUND_PATTERN, "backgroundColor: generateChartColors(4)", content
    )

    # Replace borderColor patterns
    content = re.sub(
        OLD_BORDER_PATTERN, "borderColor: generateChartBorderColors(4)", content
    )

    # Handle specific chart patterns for common contaminants
    # Replace the contaminant impact charts with the utility function
    contaminant_pattern = r'<ChartComponent\s+chartId="chartCommonContaminantsFor\w+"\s+chartType="bar"\s+data=\{\{\s+labels: \[([^\]]+)\],\s+datasets: \[\{\s+label: \'Impact on Performance\',\s+data: \[([^\]]+)\],\s+backgroundColor: generateChartColors\(4\),\s+borderColor: generateChartBorderColors\(4\),\s+borderWidth: 0\s+\}\]\s+\}\}\s+options=\{\{\s+scales: \{\s+y: \{\s+title: \{ text: \'Impact on Performance\' \},?\s+\},?\s+\},?\s+\}\}\s*/>'

    def replace_contaminant_chart(match):
        labels = match.group(1)
        data = match.group(2)
        return f"""<ChartComponent
  chartId="chartCommonContaminants"
  chartType="bar"
  {{...createContaminantImpactChart([{labels}], [{data}])}}
/>"""

    # Apply contaminant chart replacement
    content = re.sub(
        contaminant_pattern, replace_contaminant_chart, content, flags=re.DOTALL
    )

    # Handle effectiveness comparison charts
    effectiveness_pattern = r'<ChartComponent\s+chartId="chartCleaningEfficiencyComparisonFor\w+"\s+chartType="bar"\s+data=\{\{\s+labels: \["Laser Cleaning", "Abrasive Blasting", "Chemical Cleaning", "Ultrasonic Cleaning"\],\s+datasets: \[\{\s+label: \'Effectiveness\',\s+data: \[([^\]]+)\],\s+backgroundColor: generateChartColors\(4\),\s+borderColor: generateChartBorderColors\(4\),\s+borderWidth: 0\s+\}\]\s+\}\}\s+options=\{\{[^}]+\}\}\s*/>'

    def replace_effectiveness_chart(match):
        data = match.group(1)
        return f"""<ChartComponent
  chartId="chartCleaningEfficiencyComparison"
  chartType="bar"
  {{...createEffectivenessChart([{data}])}}
  options={{{{ scales: {{ y: {{ title: {{ text: 'Effectiveness (%)' }} }} }} }}}}
/>"""

    # Apply effectiveness chart replacement
    content = re.sub(
        effectiveness_pattern, replace_effectiveness_chart, content, flags=re.DOTALL
    )

    # Handle risk comparison charts
    risk_pattern = r'<ChartComponent\s+chartId="chartRisksTraditionalCleaningFor\w+"\s+chartType="bar"\s+data=\{\{\s+labels: \["Laser Cleaning", "Abrasive Blasting", "Chemical Cleaning", "Ultrasonic Cleaning"\],\s+datasets: \[\{\s+label: \'Risk Level\',\s+data: \[([^\]]+)\],\s+backgroundColor: generateChartColors\(4\),\s+borderColor: generateChartBorderColors\(4\),\s+borderWidth: 0\s+\}\]\s+\}\}\s+options=\{\{[^}]+\}\}\s*/>'

    def replace_risk_chart(match):
        data = match.group(1)
        return f"""<ChartComponent
  chartId="chartRisksTraditionalCleaning"
  chartType="bar"
  {{...createRiskComparisonChart([{data}])}}
  options={{{{ plugins: {{ legend: {{ display: true, position: 'left' }} }} }}}}
/>"""

    # Apply risk chart replacement
    content = re.sub(risk_pattern, replace_risk_chart, content, flags=re.DOTALL)

    # Save the file if changes were made
    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✓ Updated {file_path}")
        return True
    else:
        print(f"  - No changes needed for {file_path}")
        return False


def main():
    """Main function to process all MDX files."""
    mdx_files = glob.glob(os.path.join(MDX_DIR, "*.mdx"))

    if not mdx_files:
        print(f"No MDX files found in {MDX_DIR}")
        return

    print(f"Found {len(mdx_files)} MDX files to process")
    print("Starting bulk chart utility update...\n")

    updated_files = 0
    for file_path in sorted(mdx_files):
        if process_mdx_file(file_path):
            updated_files += 1

    print(f"\n✅ Bulk update complete!")
    print(f"📊 Updated {updated_files} out of {len(mdx_files)} files")
    print(f"🎯 Chart color generation code has been replaced with utility functions")


if __name__ == "__main__":
    main()
