import { readFileSync } from 'fs';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';
import { SmartTable } from '@/app/components/Table/SmartTable';

export default function TestNestedFields() {
  // Load aluminum frontmatter data for testing
  const filePath = join(process.cwd(), 'content/frontmatter/aluminum-laser-cleaning.yaml');
  const fileContents = readFileSync(filePath, 'utf8');
  const frontmatterData = parseYaml(fileContents) as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Enhanced SmartTable - Nested Fields Test</h1>
        <p className="text-gray-600 mb-8">
          Testing the enhanced SmartTable with nested fields: materialCharacteristics, environmentalImpact, 
          regulatoryStandards, outcomeMetrics, description, source, validation_method, and research_basis
        </p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Aluminum Laser Cleaning Data</h2>
          <p className="text-sm text-gray-500 mb-4">
            Material: {frontmatterData.name} | Category: {frontmatterData.category}
          </p>
          <SmartTable frontmatterData={frontmatterData} content="" />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Field Coverage Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>materialCharacteristics:</strong><br />
              {frontmatterData.materialCharacteristics ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>environmentalImpact:</strong><br />
              {frontmatterData.environmentalImpact ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>regulatoryStandards:</strong><br />
              {frontmatterData.regulatoryStandards ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>outcomeMetrics:</strong><br />
              {frontmatterData.outcomeMetrics ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>description:</strong><br />
              {frontmatterData.description ? '✅ Present' : '❌ Missing'}
            </div>
            <div>
              <strong>source:</strong><br />
              {frontmatterData.source ? '✅ Present' : frontmatterData.materialProperties && 
                Object.values(frontmatterData.materialProperties).some((cat: any) => 
                  cat.properties && Object.values(cat.properties).some((prop: any) => prop.source)
                ) ? '✅ In Properties' : '❌ Missing'}
            </div>
            <div>
              <strong>validation_method:</strong><br />
              {frontmatterData.validation_method ? '✅ Present' : frontmatterData.materialProperties && 
                Object.values(frontmatterData.materialProperties).some((cat: any) => 
                  cat.properties && Object.values(cat.properties).some((prop: any) => prop.validation_method)
                ) ? '✅ In Properties' : '❌ Missing'}
            </div>
            <div>
              <strong>research_basis:</strong><br />
              {frontmatterData.research_basis ? '✅ Present' : frontmatterData.materialProperties && 
                Object.values(frontmatterData.materialProperties).some((cat: any) => 
                  cat.properties && Object.values(cat.properties).some((prop: any) => prop.research_basis)
                ) ? '✅ In Properties' : '❌ Missing'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}