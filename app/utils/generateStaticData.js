const fs = require('fs');
const yaml = require('js-yaml');

const pages = ['netalux', 'partners', 'rental', 'services', 'contact'];

let output = '// Auto-generated file - do not edit manually\n// Generated from static-pages/*.yaml files\n\n';

pages.forEach(page => {
  const data = yaml.load(fs.readFileSync(`static-pages/${page}.yaml`, 'utf8'));
  output += `export const ${page.toUpperCase()}_DATA = ${JSON.stringify(data, null, 2)} as const;\n\n`;
});

output += `export const STATIC_PAGE_DATA = {\n`;
pages.forEach(page => {
  output += `  ${page}: ${page.toUpperCase()}_DATA,\n`;
});
output += `} as const;\n\n`;

output += `export type StaticPageKey = keyof typeof STATIC_PAGE_DATA;\n\n`;
output += `export function getStaticPageData<T = any>(pageKey: StaticPageKey): T {\n`;
output += `  return STATIC_PAGE_DATA[pageKey] as T;\n`;
output += `}\n`;

fs.writeFileSync('app/utils/staticPageData.ts', output);
console.log('Generated staticPageData.ts');
