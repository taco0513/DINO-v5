const { chromium } = require('playwright');

async function testApp() {
  console.log('🚀 Starting DINO app comprehensive test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Test results
  const issues = [];
  const improvements = [];
  
  try {
    // 1. Homepage Test
    console.log('📍 Testing Homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check page load time
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart
      };
    });
    
    if (timing.loadComplete > 3000) {
      issues.push(`⚠️ Slow page load: ${timing.loadComplete}ms (should be < 3000ms)`);
    }
    
    // Check sidebar
    const sidebar = await page.locator('[class*="MuiDrawer-paper"]').first();
    if (await sidebar.isVisible()) {
      console.log('✅ Sidebar is visible');
      
      // Test collapse functionality
      const collapseBtn = await page.locator('button').filter({ has: page.locator('svg[data-testid*="ChevronLeft"]') }).first();
      if (await collapseBtn.count() > 0) {
        await collapseBtn.click();
        await page.waitForTimeout(500);
        console.log('✅ Sidebar collapse works');
      } else {
        issues.push('❌ Sidebar collapse button not found');
      }
    } else {
      issues.push('❌ Sidebar not visible on homepage');
    }
    
    // Check Add Stay button
    const addStayBtn = await page.locator('button:has-text("Add Stay")').first();
    if (await addStayBtn.count() > 0) {
      console.log('✅ Add Stay button found');
      await addStayBtn.click();
      await page.waitForTimeout(500);
      
      // Check if modal opens
      const modal = await page.locator('[role="dialog"]').first();
      if (await modal.isVisible()) {
        console.log('✅ Add Stay modal opens');
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      } else {
        issues.push('❌ Add Stay modal does not open');
      }
    } else {
      issues.push('❌ Add Stay button not found');
    }
    
    // Check dashboard content
    const dashboardContent = await page.locator('text=/Dashboard/i').first();
    if (await dashboardContent.count() > 0) {
      console.log('✅ Dashboard content loaded');
    } else {
      issues.push('❌ Dashboard content not found');
    }
    
    // 2. Calendar Page Test
    console.log('\n📍 Testing Calendar Page...');
    await page.click('a[href="/calendar"]');
    await page.waitForLoadState('networkidle');
    
    // Check calendar elements
    const calendarTitle = await page.locator('text=/Calendar/i').first();
    if (await calendarTitle.count() > 0) {
      console.log('✅ Calendar page loaded');
    } else {
      issues.push('❌ Calendar page not loading properly');
    }
    
    // Check tabs
    const tabs = await page.locator('[role="tablist"]').first();
    if (await tabs.isVisible()) {
      console.log('✅ Calendar tabs visible');
      
      // Test tab switching
      const checklistTab = await page.locator('button[role="tab"]:has-text("Checklist")').first();
      if (await checklistTab.count() > 0) {
        await checklistTab.click();
        await page.waitForTimeout(500);
        console.log('✅ Tab switching works');
      }
    } else {
      improvements.push('💡 Consider adding clear tab navigation on calendar page');
    }
    
    // 3. Mobile Responsiveness Test
    console.log('\n📍 Testing Mobile Responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check mobile menu
    const mobileMenuBtn = await page.locator('button[aria-label="open drawer"]').first();
    if (await mobileMenuBtn.isVisible()) {
      console.log('✅ Mobile menu button visible');
      await mobileMenuBtn.click();
      await page.waitForTimeout(500);
      
      const mobileDrawer = await page.locator('[role="presentation"]').first();
      if (await mobileDrawer.isVisible()) {
        console.log('✅ Mobile drawer opens');
        await page.keyboard.press('Escape');
      } else {
        issues.push('❌ Mobile drawer not working');
      }
    } else {
      issues.push('❌ Mobile menu button not visible');
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // 4. Accessibility Check
    console.log('\n📍 Testing Accessibility...');
    const accessibilityIssues = [];
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        const src = await img.getAttribute('src');
        accessibilityIssues.push(`Image without alt text: ${src}`);
      }
    }
    
    // Check for button labels
    const buttons = await page.locator('button').all();
    let unlabeledButtons = 0;
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      if (!ariaLabel && !text?.trim()) {
        unlabeledButtons++;
      }
    }
    if (unlabeledButtons > 0) {
      accessibilityIssues.push(`${unlabeledButtons} buttons without labels`);
    }
    
    // Check color contrast
    const contrast = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const lowContrast = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const fg = style.color;
        
        if (bg !== 'rgba(0, 0, 0, 0)' && fg) {
          // Simple contrast check (should use proper WCAG algorithm)
          const bgLuminance = bg.match(/\d+/g);
          const fgLuminance = fg.match(/\d+/g);
          
          if (bgLuminance && fgLuminance) {
            const bgBrightness = (parseInt(bgLuminance[0]) + parseInt(bgLuminance[1]) + parseInt(bgLuminance[2])) / 3;
            const fgBrightness = (parseInt(fgLuminance[0]) + parseInt(fgLuminance[1]) + parseInt(fgLuminance[2])) / 3;
            const contrast = Math.abs(bgBrightness - fgBrightness);
            
            if (contrast < 50) {
              lowContrast.push(el.tagName);
            }
          }
        }
      });
      
      return lowContrast.length;
    });
    
    if (contrast > 10) {
      accessibilityIssues.push(`${contrast} elements with potential contrast issues`);
    }
    
    if (accessibilityIssues.length > 0) {
      issues.push('🔍 Accessibility issues found:');
      accessibilityIssues.forEach(issue => issues.push(`  - ${issue}`));
    } else {
      console.log('✅ Basic accessibility checks passed');
    }
    
    // 5. Performance Metrics
    console.log('\n📍 Checking Performance Metrics...');
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
        loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
        domInteractive: Math.round(perf.domInteractive - perf.fetchStart),
        resourceCount: performance.getEntriesByType('resource').length
      };
    });
    
    console.log('📊 Performance Metrics:');
    console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  - Page Load Complete: ${metrics.loadComplete}ms`);
    console.log(`  - DOM Interactive: ${metrics.domInteractive}ms`);
    console.log(`  - Resources Loaded: ${metrics.resourceCount}`);
    
    if (metrics.resourceCount > 100) {
      improvements.push('💡 Consider bundling resources (100+ resources loaded)');
    }
    
    // 6. Error Console Check
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      issues.push('🔴 Console errors detected:');
      consoleErrors.forEach(error => issues.push(`  - ${error}`));
    }
    
    // Improvements suggestions
    improvements.push('💡 Add loading skeletons for better perceived performance');
    improvements.push('💡 Implement virtual scrolling for long lists');
    improvements.push('💡 Add keyboard navigation shortcuts');
    improvements.push('💡 Consider adding a dark mode toggle in the UI');
    improvements.push('💡 Add tooltips for icon-only buttons when sidebar is collapsed');
    improvements.push('💡 Implement progressive web app (PWA) features');
    improvements.push('💡 Add data export functionality (CSV/PDF)');
    improvements.push('💡 Consider adding data visualization/charts for stay statistics');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    issues.push(`Test error: ${error.message}`);
  } finally {
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    
    if (issues.length > 0) {
      console.log('\n🔴 Issues Found:');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\n✅ No critical issues found!');
    }
    
    console.log('\n🚀 Suggested Improvements:');
    improvements.forEach(improvement => console.log(improvement));
    
    await browser.close();
  }
}

testApp().catch(console.error);