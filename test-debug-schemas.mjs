import { SchemaFactory } from './app/utils/schemas/SchemaFactory.ts';

const testData = {
  metadata: {
    name: 'Aluminum',
    title: 'Aluminum Laser Cleaning',
    faq: [
      { question: 'Test Q1?', answer: 'Test A1' },
      { question: 'Test Q2?', answer: 'Test A2' }
    ],
    materialProperties: { density: 2.7 },
    author: { name: 'Test Author' }
  }
};

console.log('Testing SchemaFactory...\n');

try {
  const factory = new SchemaFactory(testData, 'materials/metal/non-ferrous/aluminum');
  const schemas = factory.generate();
  
  const graph = schemas['@graph'] || [];
  console.log(`Generated ${graph.length} schemas:`);
  graph.forEach((s, i) => console.log(`  ${i+1}. ${s['@type']}`));
  
  const hasFAQ = graph.some(s => s['@type'] === 'FAQPage');
  console.log(`\nFAQPage: ${hasFAQ ? '✅ FOUND' : '❌ MISSING'}`);
} catch (e) {
  console.error('ERROR:', e.message);
}
