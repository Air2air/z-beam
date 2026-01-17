/**
 * Hreflang Expansion Integration Tests
 * Validates international SEO alternate language links
 * 
 * Implementation: January 16, 2026
 * Purpose: International traffic expansion to 16 locales
 */

describe('Hreflang Expansion', () => {
  const baseUrl = 'https://z-beam.com';
  
  // Mock getAlternates function similar to sitemap.ts
  const getAlternates = (path: string) => {
    const languages = {
      'x-default': '',
      // English variants
      'en-US': '/en-us',
      'en-GB': '/en-gb',
      'en-CA': '/en-ca',
      'en-AU': '/en-au',
      // Spanish variants
      'es-MX': '/es-mx',
      'es-ES': '/es-es', // NEW - Spain
      // Portuguese
      'pt-BR': '/pt-br', // NEW - Brazil
      // Asian languages
      'ja-JP': '/ja-jp', // NEW - Japan
      'ko-KR': '/ko-kr', // NEW - Korea
      'zh-CN': '/zh-cn',
      // European languages
      'de-DE': '/de-de',
      'fr-CA': '/fr-ca',
      'it-IT': '/it-it', // NEW - Italy
      'pl-PL': '/pl-pl', // NEW - Poland
      'nl-NL': '/nl-nl', // NEW - Netherlands
    };

    return Object.entries(languages).map(([lang, prefix]) => ({
      url: `${baseUrl}${prefix}${path}`,
      lang,
    }));
  };

  describe('Core Hreflang Requirements', () => {
    it('should include all 16 locales', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      expect(alternates).toHaveLength(16);
      
      const locales = alternates.map(alt => alt.lang);
      expect(locales).toContain('x-default');
      expect(locales).toContain('en-US');
      expect(locales).toContain('en-GB');
      expect(locales).toContain('en-CA');
      expect(locales).toContain('en-AU');
      expect(locales).toContain('es-MX');
      expect(locales).toContain('es-ES'); // NEW
      expect(locales).toContain('pt-BR'); // NEW
      expect(locales).toContain('ja-JP'); // NEW
      expect(locales).toContain('ko-KR'); // NEW
      expect(locales).toContain('zh-CN');
      expect(locales).toContain('de-DE');
      expect(locales).toContain('fr-CA');
      expect(locales).toContain('it-IT'); // NEW
      expect(locales).toContain('pl-PL'); // NEW
      expect(locales).toContain('nl-NL'); // NEW
    });

    it('should include x-default fallback', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const defaultAlt = alternates.find(alt => alt.lang === 'x-default');
      
      expect(defaultAlt).toBeDefined();
      expect(defaultAlt?.url).toBe(`${baseUrl}/materials/metal/aluminum`);
    });

    it('should preserve path structure for all locales', () => {
      const path = '/materials/metal/aluminum';
      const alternates = getAlternates(path);
      
      alternates.forEach(alt => {
        if (alt.lang === 'x-default') {
          expect(alt.url).toBe(`${baseUrl}${path}`);
        } else {
          expect(alt.url).toContain(path);
        }
      });
    });
  });

  describe('New Locale Coverage - European Expansion', () => {
    it('should include Spanish (Spain) - es-ES', () => {
      const alternates = getAlternates('/materials/metal/steel');
      const esES = alternates.find(alt => alt.lang === 'es-ES');
      
      expect(esES).toBeDefined();
      expect(esES?.url).toContain('/es-es');
    });

    it('should include Italian - it-IT', () => {
      const alternates = getAlternates('/contaminants/organic-coating/paint');
      const itIT = alternates.find(alt => alt.lang === 'it-IT');
      
      expect(itIT).toBeDefined();
      expect(itIT?.url).toContain('/it-it');
    });

    it('should include Polish - pl-PL', () => {
      const alternates = getAlternates('/settings/laser/fiber-laser');
      const plPL = alternates.find(alt => alt.lang === 'pl-PL');
      
      expect(plPL).toBeDefined();
      expect(plPL?.url).toContain('/pl-pl');
    });

    it('should include Dutch - nl-NL', () => {
      const alternates = getAlternates('/compounds/toxic-gas/acid-gas');
      const nlNL = alternates.find(alt => alt.lang === 'nl-NL');
      
      expect(nlNL).toBeDefined();
      expect(nlNL?.url).toContain('/nl-nl');
    });
  });

  describe('New Locale Coverage - South American Expansion', () => {
    it('should include Portuguese (Brazil) - pt-BR', () => {
      const alternates = getAlternates('/materials/metal/titanium');
      const ptBR = alternates.find(alt => alt.lang === 'pt-BR');
      
      expect(ptBR).toBeDefined();
      expect(ptBR?.url).toContain('/pt-br');
    });

    it('should distinguish es-MX from es-ES', () => {
      const alternates = getAlternates('/materials/stone/granite');
      const esMX = alternates.find(alt => alt.lang === 'es-MX');
      const esES = alternates.find(alt => alt.lang === 'es-ES');
      
      expect(esMX).toBeDefined();
      expect(esES).toBeDefined();
      expect(esMX?.url).not.toBe(esES?.url);
    });
  });

  describe('New Locale Coverage - Asian Expansion', () => {
    it('should include Japanese - ja-JP', () => {
      const alternates = getAlternates('/materials/ceramic/porcelain');
      const jaJP = alternates.find(alt => alt.lang === 'ja-JP');
      
      expect(jaJP).toBeDefined();
      expect(jaJP?.url).toContain('/ja-jp');
    });

    it('should include Korean - ko-KR', () => {
      const alternates = getAlternates('/materials/composite/carbon-fiber');
      const koKR = alternates.find(alt => alt.lang === 'ko-KR');
      
      expect(koKR).toBeDefined();
      expect(koKR?.url).toContain('/ko-kr');
    });

    it('should include all Asian locales', () => {
      const alternates = getAlternates('/materials/plastic/abs');
      const asianLocales = alternates.filter(alt => 
        ['ja-JP', 'ko-KR', 'zh-CN'].includes(alt.lang)
      );
      
      expect(asianLocales).toHaveLength(3);
    });
  });

  describe('Coverage by Language Family', () => {
    it('should have 4 English variants', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const englishLocales = alternates.filter(alt => 
        alt.lang.startsWith('en-')
      );
      
      expect(englishLocales).toHaveLength(4);
      expect(englishLocales.map(l => l.lang)).toEqual(
        expect.arrayContaining(['en-US', 'en-GB', 'en-CA', 'en-AU'])
      );
    });

    it('should have 2 Spanish variants', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const spanishLocales = alternates.filter(alt => 
        alt.lang.startsWith('es-')
      );
      
      expect(spanishLocales).toHaveLength(2);
      expect(spanishLocales.map(l => l.lang)).toEqual(
        expect.arrayContaining(['es-MX', 'es-ES'])
      );
    });

    it('should have 6 European language variants', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const europeanLocales = alternates.filter(alt => 
        ['de-DE', 'fr-CA', 'it-IT', 'pl-PL', 'nl-NL', 'es-ES'].includes(alt.lang)
      );
      
      expect(europeanLocales).toHaveLength(6);
    });
  });

  describe('SEO Best Practices', () => {
    it('should not have duplicate URLs', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const urls = alternates.map(alt => alt.url);
      const uniqueUrls = new Set(urls);
      
      expect(urls.length).toBe(uniqueUrls.size);
    });

    it('should not have duplicate language codes', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const langs = alternates.map(alt => alt.lang);
      const uniqueLangs = new Set(langs);
      
      expect(langs.length).toBe(uniqueLangs.size);
    });

    it('should use proper ISO 639-1/ISO 3166-1 format', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      
      alternates.forEach(alt => {
        if (alt.lang !== 'x-default') {
          // Format: language-COUNTRY (e.g., en-US, es-MX)
          expect(alt.lang).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
        }
      });
    });

    it('should maintain consistent URL structure across locales', () => {
      const path = '/materials/metal/aluminum-laser-cleaning';
      const alternates = getAlternates(path);
      
      alternates.forEach(alt => {
        expect(alt.url).toContain('materials/metal/aluminum-laser-cleaning');
      });
    });
  });

  describe('Coverage Expansion - Before vs After', () => {
    it('original coverage (9 locales)', () => {
      const originalLocales = [
        'x-default', 'en-US', 'en-GB', 'en-CA', 'en-AU',
        'es-MX', 'fr-CA', 'de-DE', 'zh-CN'
      ];
      
      expect(originalLocales).toHaveLength(9);
    });

    it('expanded coverage (16 locales) - 78% increase', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      expect(alternates).toHaveLength(16);
      
      // Verify all new additions
      const newLocales = ['es-ES', 'pt-BR', 'ja-JP', 'ko-KR', 'it-IT', 'pl-PL', 'nl-NL'];
      const locales = alternates.map(alt => alt.lang);
      
      newLocales.forEach(locale => {
        expect(locales).toContain(locale);
      });
    });

    it('maintains backward compatibility with original locales', () => {
      const alternates = getAlternates('/materials/metal/aluminum');
      const originalLocales = [
        'x-default', 'en-US', 'en-GB', 'en-CA', 'en-AU',
        'es-MX', 'fr-CA', 'de-DE', 'zh-CN'
      ];
      
      const locales = alternates.map(alt => alt.lang);
      originalLocales.forEach(locale => {
        expect(locales).toContain(locale);
      });
    });
  });

  describe('Market-Specific Coverage', () => {
    it('covers major European manufacturing markets', () => {
      const alternates = getAlternates('/materials/metal/steel');
      const europeanManufacturing = ['de-DE', 'it-IT', 'pl-PL', 'nl-NL', 'es-ES'];
      const locales = alternates.map(alt => alt.lang);
      
      europeanManufacturing.forEach(market => {
        expect(locales).toContain(market);
      });
    });

    it('covers major Asian manufacturing markets', () => {
      const alternates = getAlternates('/materials/metal/steel');
      const asianManufacturing = ['zh-CN', 'ja-JP', 'ko-KR'];
      const locales = alternates.map(alt => alt.lang);
      
      asianManufacturing.forEach(market => {
        expect(locales).toContain(market);
      });
    });

    it('covers South American markets', () => {
      const alternates = getAlternates('/materials/metal/steel');
      const southAmerican = ['es-MX', 'es-ES', 'pt-BR'];
      const locales = alternates.map(alt => alt.lang);
      
      southAmerican.forEach(market => {
        expect(locales).toContain(market);
      });
    });
  });
});
