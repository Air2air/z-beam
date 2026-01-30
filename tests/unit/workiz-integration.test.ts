/**
 * Workiz Integration Tests
 * 
 * Smoke tests to verify Workiz contact form integration files exist and compile
 */

describe('Workiz Integration', () => {
  describe('Contact Page', () => {
    it('should have contact page file', () => {
      const fs = require('fs');
      const path = require('path');
      const contactPagePath = path.join(process.cwd(), 'app', 'contact', 'page.tsx');
      expect(fs.existsSync(contactPagePath)).toBe(true);
    });

    it('should contain Workiz iframe URL in contact page', () => {
      const fs = require('fs');
      const path = require('path');
      const contactPagePath = path.join(process.cwd(), 'app', 'contact', 'page.tsx');
      const content = fs.readFileSync(contactPagePath, 'utf-8');
      expect(content).toContain('st.sendajob.com');
      expect(content).toContain('bc0bbe1e44d7eda5aed87bb3ababd7c52a171de4_f.html');
    });

    it('should have proper iframe styling', () => {
      const fs = require('fs');
      const path = require('path');
      const contactPagePath = path.join(process.cwd(), 'app', 'contact', 'page.tsx');
      const content = fs.readFileSync(contactPagePath, 'utf-8');
      expect(content).toContain('bg-gray-800');
      expect(content).toContain('rounded-md');
      expect(content).toContain('shadow-md');
    });
  });

  describe('Confirmation Page', () => {
    it('should have confirmation page file', () => {
      const fs = require('fs');
      const path = require('path');
      const confirmationPagePath = path.join(process.cwd(), 'app', 'confirmation', 'page.tsx');
      expect(fs.existsSync(confirmationPagePath)).toBe(true);
    });

    it('should contain thank you message', () => {
      const fs = require('fs');
      const path = require('path');
      const confirmationPagePath = path.join(process.cwd(), 'app', 'confirmation', 'page.tsx');
      const content = fs.readFileSync(confirmationPagePath, 'utf-8');
      expect(content).toContain('Thank You');
      expect(content).toContain('has been received');
    });

    it('should have navigation buttons', () => {
      const fs = require('fs');
      const path = require('path');
      const confirmationPagePath = path.join(process.cwd(), 'app', 'confirmation', 'page.tsx');
      const content = fs.readFileSync(confirmationPagePath, 'utf-8');
      expect(content).toContain('Return to Home');
      expect(content).toContain('Learn More About Equipment Rental');
    });
  });

  describe('Middleware CSP', () => {
    it('should have middleware file', () => {
      const fs = require('fs');
      const path = require('path');
      const middlewarePath = path.join(process.cwd(), 'middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(true);
    });

    it('should include Workiz domains in CSP', () => {
      const fs = require('fs');
      const path = require('path');
      const middlewarePath = path.join(process.cwd(), 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('st.sendajob.com');
    });

    it('should have development CSP configuration', () => {
      const fs = require('fs');
      const path = require('path');
      const middlewarePath = path.join(process.cwd(), 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('NODE_ENV');
      expect(content).toContain('development');
    });

    it('should have production CSP configuration', () => {
      const fs = require('fs');
      const path = require('path');
      const middlewarePath = path.join(process.cwd(), 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('frame-src');
      expect(content).toContain('script-src');
      expect(content).toContain('style-src');
    });
  });

  describe('Documentation', () => {
    it('should have Workiz contact form documentation', () => {
      const fs = require('fs');
      const path = require('path');
      const docsPath = path.join(process.cwd(), 'docs', '02-features', 'WORKIZ_CONTACT_FORM.md');
      expect(fs.existsSync(docsPath)).toBe(true);
    });

    it('should have middleware CSP documentation', () => {
      const fs = require('fs');
      const path = require('path');
      const docsPath = path.join(process.cwd(), 'docs', '01-core', 'MIDDLEWARE_CSP.md');
      expect(fs.existsSync(docsPath)).toBe(true);
    });

    it('should have summary documentation', () => {
      const fs = require('fs');
      const path = require('path');
      const docsPath = path.join(process.cwd(), 'docs', 'CONTACT_FORM_DOCS_AND_TESTS.md');
      expect(fs.existsSync(docsPath)).toBe(true);
    });
  });
});
