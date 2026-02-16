const fs = require('fs');
const { globSync } = require('glob');

const files = [
  ...globSync('frontmatter/materials/*.yaml'),
  ...globSync('frontmatter/contaminants/*.yaml'),
  ...globSync('frontmatter/compounds/*.yaml'),
  ...globSync('frontmatter/settings/*.yaml'),
  ...globSync('app/**/page.yaml')
];

const sample50 = files.slice(0, 50);
const sample30 = files.slice(0, 30);

const badDesc = [];
for (const f of sample50) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/pageDescription:\s*["']?([^"\n]+)["']?/);
  if (m) {
    const d = m[1].trim();
    if (d.length < 50 || d.length > 160) {
      badDesc.push({ file: f, len: d.length, value: d });
    }
  }
}

const badFaq = [];
for (const f of sample30) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(/question:|name:.*\?/gi);
  const n = m ? m.length : 0;
  if (c.includes('FAQ') && n < 3) {
    badFaq.push({ file: f, count: n });
  }
}

const badBc = [];
for (const f of sample30) {
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes('breadcrumb:') || c.includes('breadcrumbs:')) {
    const hasPosition = c.includes('position:');
    const hasItemOrHref = c.includes('item:') || c.includes('href:');
    if (!(hasPosition && hasItemOrHref)) {
      badBc.push({ file: f, hasPosition, hasItemOrHref });
    }
  }
}

console.log(JSON.stringify({ totalFiles: files.length, badDesc, badFaq, badBc }, null, 2));
