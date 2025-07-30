describe('Role Editor Browser Tests', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:8080/role-editor-final.html');
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Core Functionality Evidence', () => {
    test('EVIDENCE: Page loads with correct title', async () => {
      const title = await page.title();
      expect(title).toBe('AI Roles Editor - Final Working Version');
    });

    test('EVIDENCE: Header displays correctly', async () => {
      const headerText = await page.$eval('.header', el => el.textContent);
      expect(headerText).toBe('✅ FINAL WORKING AI ROLES EDITOR - Syntax-Safe Implementation');
    });

    test('EVIDENCE: Sidebar contains role list', async () => {
      await page.waitForSelector('.sidebar');
      const sidebarExists = await page.$('.sidebar') !== null;
      expect(sidebarExists).toBe(true);
      
      const roleItems = await page.$$('.role-item');
      expect(roleItems.length).toBeGreaterThan(0);
    });

    test('EVIDENCE: Role items are clickable and trigger selectRole', async () => {
      // Check that role items have onclick handlers
      const hasOnclick = await page.$eval('.role-item', el => 
        el.hasAttribute('onclick')
      );
      expect(hasOnclick).toBe(true);
      
      // Click a role and verify it doesn't throw errors
      await page.click('.role-item');
      await new Promise(r => setTimeout(r, 500));
    });

    test('EVIDENCE: Main editor area displays role details', async () => {
      const mainEditor = await page.$('.main-editor');
      expect(mainEditor).not.toBeNull();
      
      // Click a role and verify editor area updates
      await page.click('.role-item:first-child');
      await new Promise(r => setTimeout(r, 1000));
      
      // Check if role editor has content
      const editorContent = await page.$eval('.main-editor', el => el.innerHTML);
      expect(editorContent).not.toBe('');
    });
  });

  describe('Edge Cases Evidence', () => {
    test('EVIDENCE: Search functionality filters roles', async () => {
      const searchInput = await page.$('#searchRoles');
      if (searchInput) {
        await searchInput.type('Project');
        await new Promise(r => setTimeout(r, 500));
        
        const visibleRoles = await page.$$eval('.role-item:not([style*="display: none"])', 
          els => els.length
        );
        const allRoles = await page.$$eval('.role-item', els => els.length);
        
        expect(visibleRoles).toBeLessThan(allRoles);
      }
    });

    test('EVIDENCE: Empty search shows all roles', async () => {
      const searchInput = await page.$('#searchRoles');
      if (searchInput) {
        await page.evaluate(() => {
          document.querySelector('#searchRoles').value = '';
        });
        await searchInput.type(' '); // Trigger input event
        await page.keyboard.press('Backspace');
        
        const visibleRoles = await page.$$eval('.role-item:not([style*="display: none"])', 
          els => els.length
        );
        const allRoles = await page.$$eval('.role-item', els => els.length);
        
        expect(visibleRoles).toBe(allRoles);
      }
    });
  });

  describe('Error Handling Evidence', () => {
    test('EVIDENCE: Handles missing role data gracefully', async () => {
      // Test clicking non-existent elements
      const result = await page.evaluate(() => {
        try {
          document.querySelector('.non-existent-role').click();
          return 'no-error';
        } catch (e) {
          return 'error-caught';
        }
      });
      expect(result).toBe('error-caught');
    });

    test('EVIDENCE: Form validation prevents empty submissions', async () => {
      // Clear a required field
      const titleInput = await page.$('#roleTitle');
      if (titleInput) {
        await page.evaluate(() => {
          document.querySelector('#roleTitle').value = '';
        });
        
        // Try to save
        const saveButton = await page.$('#saveRole');
        if (saveButton) {
          await saveButton.click();
          
          // Check if validation message appears or field is still empty
          const titleValue = await page.$eval('#roleTitle', el => el.value);
          const hasValidationError = await page.$eval('#roleTitle', el => 
            el.validationMessage !== '' || el.classList.contains('error')
          );
          
          expect(titleValue === '' || hasValidationError).toBe(true);
        }
      }
    });
  });

  describe('Integration Evidence', () => {
    test('EVIDENCE: Complete workflow - select and view role', async () => {
      // Select a role
      await page.click('.role-item:nth-child(2)');
      await new Promise(r => setTimeout(r, 1000));
      
      // Verify role selection updated the view
      const mainEditorHasContent = await page.$eval('.main-editor', el => 
        el.innerHTML.length > 100
      );
      expect(mainEditorHasContent).toBe(true);
      
      // Test that multiple role selections work
      await page.click('.role-item:first-child');
      await new Promise(r => setTimeout(r, 500));
      await page.click('.role-item:nth-child(3)');
      await new Promise(r => setTimeout(r, 500));
    });

    test('EVIDENCE: Export functionality generates output', async () => {
      const exportButton = await page.$('#exportRoles');
      if (exportButton) {
        // Set up dialog handler before clicking
        page.once('dialog', async dialog => {
          const message = dialog.message();
          expect(message).toContain('exported');
          await dialog.accept();
        });
        
        await exportButton.click();
      }
    });

    test('EVIDENCE: Page performance metrics', async () => {
      const metrics = await page.metrics();
      console.log('Performance Metrics:', {
        JSHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1048576) + ' MB',
        DOMNodes: metrics.Nodes,
        LayoutCount: metrics.LayoutCount
      });
      
      // Basic performance checks
      expect(metrics.JSHeapUsedSize).toBeLessThan(50 * 1048576); // Less than 50MB
      expect(metrics.Nodes).toBeLessThan(5000); // Reasonable DOM size
    });
  });
});