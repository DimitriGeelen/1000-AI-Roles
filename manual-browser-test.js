const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting manual browser test...\n');

// Simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/role-editor-final.html' || req.url === '/') {
    const filePath = path.join(__dirname, 'role-editor-final.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
});

server.listen(8081, async () => {
  console.log('✅ Server running at http://localhost:8081\n');
  
  try {
    console.log('🌐 Launching Chrome browser (this will open a REAL browser window!)...\n');
    
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,800',
        '--window-position=100,100'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('📄 Navigating to Role Editor...\n');
    await page.goto('http://localhost:8081/role-editor-final.html');
    
    console.log('🎯 Running automated tests with visual feedback:\n');
    
    // Test 1: Page loads
    console.log('1️⃣ Checking page title...');
    const title = await page.title();
    console.log(`   ✅ Title: "${title}"\n`);
    
    // Test 2: Click first role
    console.log('2️⃣ Clicking first role item...');
    await page.waitForSelector('.role-item');
    await page.click('.role-item:first-child');
    await new Promise(r => setTimeout(r, 1000));
    console.log('   ✅ Clicked!\n');
    
    // Test 3: Click second role
    console.log('3️⃣ Clicking second role item...');
    await page.click('.role-item:nth-child(2)');
    await new Promise(r => setTimeout(r, 1000));
    console.log('   ✅ Clicked!\n');
    
    // Test 4: Search functionality
    const searchInput = await page.$('#searchRoles');
    if (searchInput) {
      console.log('4️⃣ Testing search functionality...');
      console.log('   Typing "Project" in search...');
      await searchInput.type('Project', { delay: 200 });
      await new Promise(r => setTimeout(r, 1500));
      
      console.log('   Clearing search...');
      await page.evaluate(() => document.querySelector('#searchRoles').value = '');
      await searchInput.type(' ');
      await page.keyboard.press('Backspace');
      await new Promise(r => setTimeout(r, 1000));
      console.log('   ✅ Search tested!\n');
    }
    
    // Test 5: Click through multiple roles
    console.log('5️⃣ Clicking through multiple roles...');
    const roleCount = await page.$$eval('.role-item', items => items.length);
    console.log(`   Found ${roleCount} roles\n`);
    
    for (let i = 0; i < Math.min(5, roleCount); i++) {
      console.log(`   Clicking role ${i + 1}...`);
      await page.click(`.role-item:nth-child(${i + 1})`);
      await new Promise(r => setTimeout(r, 800));
    }
    console.log('   ✅ Role navigation complete!\n');
    
    console.log('🎉 All tests completed!\n');
    console.log('The browser will stay open for 30 seconds so you can interact with it manually.');
    console.log('Feel free to click around and test the role editor yourself!\n');
    console.log('Press Ctrl+C to close the browser and exit.\n');
    
    // Keep browser open for manual testing
    await new Promise(r => setTimeout(r, 30000));
    
    await browser.close();
    server.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    server.close();
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing browser and server...');
  process.exit(0);
});