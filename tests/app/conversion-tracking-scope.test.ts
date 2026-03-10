import fs from 'fs';
import path from 'path';

function readAppFile(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('Conversion Tracking Route Scope', () => {
  it('mounts ThankYouConversionTracker on /thank-you page', () => {
    const thankYouPage = readAppFile('app/thank-you/page.tsx');

    expect(thankYouPage).toContain("import ThankYouConversionTracker from './ThankYouConversionTracker';");
    expect(thankYouPage).toContain('<ThankYouConversionTracker />');
  });

  it('does not mount conversion tracker on /contact page load', () => {
    const contactPage = readAppFile('app/contact/page.tsx');

    expect(contactPage).not.toContain('WorkizConversionBridge');
    expect(contactPage).not.toContain('ThankYouConversionTracker');
  });

  it('does not mount conversion tracker on /confirmation page', () => {
    const confirmationPage = readAppFile('app/confirmation/page.tsx');

    expect(confirmationPage).not.toContain('ThankYouConversionTracker');
  });
});
