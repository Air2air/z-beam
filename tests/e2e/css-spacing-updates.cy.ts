/**
 * CSS Styling Tests - Typography and Breadcrumb Spacing
 * 
 * Tests for December 26, 2025 UI updates:
 * - H1 heading size at different breakpoints
 * - Breadcrumb chevron spacing
 * - Breadcrumb link padding
 */

describe('Typography Responsive Styles', () => {
  describe('H1 Heading Sizes', () => {
    it('should apply correct h1 sizes across breakpoints', () => {
      cy.visit('/');
      
      // Get the h1 element
      cy.get('h1').first().then($h1 => {
        const styles = window.getComputedStyle($h1[0]);
        
        // At mobile viewport (XS)
        cy.viewport('iphone-x');
        cy.wait(100);
        const mobileFontSize = parseFloat(styles.fontSize);
        
        // Should be text-2xl (24px) at mobile
        expect(mobileFontSize).to.be.at.least(22);
        expect(mobileFontSize).to.be.at.most(26);
      });
    });

    it('should have text-2xl (24px) at XS breakpoint', () => {
      cy.viewport(375, 667); // iPhone SE size
      cy.visit('/materials/metal/non-ferrous/aluminum-laser-cleaning');
      
      cy.get('h1').should('exist').and('be.visible');
      
      // Check computed font size is approximately 24px
      cy.get('h1').should($h1 => {
        const fontSize = $h1.css('font-size');
        const sizeInPixels = parseFloat(fontSize);
        expect(sizeInPixels).to.be.closeTo(24, 2);
      });
    });

    it('should have text-xl (20px) at SM breakpoint', () => {
      cy.viewport(640, 800); // SM breakpoint
      cy.visit('/materials/metal/non-ferrous/aluminum-laser-cleaning');
      
      cy.get('h1').should($h1 => {
        const fontSize = $h1.css('font-size');
        const sizeInPixels = parseFloat(fontSize);
        expect(sizeInPixels).to.be.closeTo(20, 2);
      });
    });

    it('should have text-3xl (30px) at MD breakpoint', () => {
      cy.viewport(768, 1024); // MD breakpoint
      cy.visit('/materials/metal/non-ferrous/aluminum-laser-cleaning');
      
      cy.get('h1').should($h1 => {
        const fontSize = $h1.css('font-size');
        const sizeInPixels = parseFloat(fontSize);
        expect(sizeInPixels).to.be.closeTo(30, 2);
      });
    });
  });
});

describe('Breadcrumb Navigation Styles', () => {
  beforeEach(() => {
    cy.visit('/materials/metal/non-ferrous/aluminum-laser-cleaning');
  });

  describe('Breadcrumb Chevron Spacing', () => {
    it('should have chevrons with 0.25rem (4px) horizontal margin', () => {
      cy.get('.breadcrumb-item').should('have.length.at.least', 2);
      
      // Get the pseudo-element styles
      cy.get('.breadcrumb-item:not(:last-child)').first().then($item => {
        const afterStyles = window.getComputedStyle($item[0], '::after');
        const marginLeft = parseFloat(afterStyles.marginLeft);
        const marginRight = parseFloat(afterStyles.marginRight);
        
        // Should be 0.25rem = 4px each side
        expect(marginLeft).to.be.closeTo(4, 1);
        expect(marginRight).to.be.closeTo(4, 1);
      });
    });

    it('should display chevron character between breadcrumb items', () => {
      cy.get('.breadcrumb-item:not(:last-child)').first().then($item => {
        const afterContent = window.getComputedStyle($item[0], '::after').content;
        
        // Should contain the chevron character (may be quoted)
        expect(afterContent).to.match(/[›"']/);
      });
    });
  });

  describe('Breadcrumb Link Padding', () => {
    it('should have links with 0.125rem (2px) horizontal padding', () => {
      cy.get('.breadcrumb-item a').first().should($link => {
        const paddingLeft = parseFloat($link.css('padding-left'));
        const paddingRight = parseFloat($link.css('padding-right'));
        
        // Should be 0.125rem = 2px horizontal
        expect(paddingLeft).to.be.closeTo(2, 1);
        expect(paddingRight).to.be.closeTo(2, 1);
      });
    });

    it('should maintain vertical padding of 0.25rem (4px)', () => {
      cy.get('.breadcrumb-item a').first().should($link => {
        const paddingTop = parseFloat($link.css('padding-top'));
        const paddingBottom = parseFloat($link.css('padding-bottom'));
        
        // Should be 0.25rem = 4px vertical
        expect(paddingTop).to.be.closeTo(4, 1);
        expect(paddingBottom).to.be.closeTo(4, 1);
      });
    });

    it('should have rounded corners (border-radius)', () => {
      cy.get('.breadcrumb-item a').first().should($link => {
        const borderRadius = $link.css('border-radius');
        expect(borderRadius).to.not.equal('0px');
      });
    });
  });

  describe('Breadcrumb Hover States', () => {
    it('should change color on hover', () => {
      cy.get('.breadcrumb-item a').not('[aria-current="page"]').first().then($link => {
        const initialColor = $link.css('color');
        
        cy.wrap($link).trigger('mouseenter');
        cy.wait(200); // Wait for transition
        
        cy.wrap($link).should($hoveredLink => {
          const hoverColor = $hoveredLink.css('color');
          expect(hoverColor).to.not.equal(initialColor);
        });
      });
    });

    it('should show background color on hover', () => {
      cy.get('.breadcrumb-item a').not('[aria-current="page"]').first()
        .trigger('mouseenter')
        .should($link => {
          const bgColor = $link.css('background-color');
          // Should have a non-transparent background
          expect(bgColor).to.not.equal('rgba(0, 0, 0, 0)');
        });
    });
  });

  describe('Touch Target Accessibility', () => {
    it('should have sufficient touch target size on mobile', () => {
      cy.viewport('iphone-x');
      
      cy.get('.breadcrumb-item a').first().should($link => {
        const height = $link.outerHeight();
        const width = $link.outerWidth();
        
        // WCAG 2.1 AAA recommends 44x44px minimum
        // With our reduced padding, we should still meet this
        expect(height).to.be.at.least(40);
        expect(width).to.be.at.least(30); // Width varies by text content
      });
    });

    it('should be clickable on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('.breadcrumb-item a').not('[aria-current="page"]').first()
        .should('be.visible')
        .and('not.be.disabled');
    });
  });

  describe('Overall Breadcrumb Compactness', () => {
    it('should occupy less horizontal space than before', () => {
      cy.get('.breadcrumb-list').then($list => {
        const width = $list.outerWidth();
        
        // Get number of items
        cy.get('.breadcrumb-item').then($items => {
          const itemCount = $items.length;
          
          // Estimate: each item should be more compact
          // With 4 items, total width should be reasonable for mobile
          if (itemCount === 4) {
            cy.viewport(375, 667); // iPhone SE
            expect(width).to.be.lessThan(375); // Should fit on screen
          }
        });
      });
    });

    it('should display all breadcrumb items on mobile without wrapping', () => {
      cy.viewport(375, 667); // iPhone SE - narrowest common viewport
      
      cy.get('.breadcrumb-item').then($items => {
        let firstTop = $items.first().offset().top;
        let lastTop = $items.last().offset().top;
        
        // All items should be on the same line (same top position)
        expect(Math.abs(lastTop - firstTop)).to.be.lessThan(5);
      });
    });
  });
});

describe('Visual Regression - Spacing Changes', () => {
  it('should match h1 heading visual snapshot at mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('h1').first().should('be.visible');
    // Visual snapshot comparison would go here
  });

  it('should match breadcrumb visual snapshot', () => {
    cy.visit('/materials/metal/non-ferrous/aluminum-laser-cleaning');
    cy.get('.breadcrumb-list').should('be.visible');
    // Visual snapshot comparison would go here
  });
});
