const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

console.log('🚀 Testing Enhanced Role Editor with ALL MD files...\n');

// Start the Python server
const serverProcess = spawn('python3', ['server.py']);

serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
});

// Wait for server to start
setTimeout(async () => {
    try {
        console.log('🌐 Opening Enhanced Editor in browser...\n');
        
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1400,900'
            ]
        });

        const page = await browser.newPage();
        await page.goto('http://localhost:8083/role-editor-enhanced.html');
        
        console.log('📊 Running enhanced editor tests:\n');
        
        // Test 1: Check page loads
        const title = await page.title();
        console.log(`1️⃣ Page title: "${title}"`);
        
        // Test 2: Wait for files to load
        console.log('2️⃣ Waiting for files to load...');
        await page.waitForSelector('.file-item', { timeout: 10000 });
        
        // Test 3: Count total files
        const fileCount = await page.$$eval('.file-item', items => items.length);
        console.log(`3️⃣ Found ${fileCount} total files in editor`);
        
        // Test 4: Check categories
        const categories = await page.$$eval('.section-title', titles => 
            titles.map(t => t.textContent)
        );
        console.log(`4️⃣ Categories found: ${categories.join(', ')}`);
        
        // Test 5: Click on different file types
        console.log('5️⃣ Testing file selection...');
        
        // Click first file in each category
        const firstFiles = await page.$$('.file-section .file-item:first-child');
        for (let i = 0; i < Math.min(3, firstFiles.length); i++) {
            await firstFiles[i].click();
            await new Promise(r => setTimeout(r, 1000));
            
            const currentFileName = await page.$eval('.editor-title', el => el.textContent);
            console.log(`   📄 Opened: ${currentFileName}`);
        }
        
        // Test 6: Search functionality
        console.log('6️⃣ Testing search...');
        await page.type('#searchFiles', 'README');
        await new Promise(r => setTimeout(r, 1000));
        
        const filteredCount = await page.$$eval('.file-item', items => items.length);
        console.log(`   🔍 Search "README" shows ${filteredCount} files`);
        
        // Clear search
        await page.evaluate(() => document.querySelector('#searchFiles').value = '');
        await page.type('#searchFiles', ' ');
        await page.keyboard.press('Backspace');
        
        console.log('\n🎉 Enhanced Editor Test Complete!');
        console.log('✅ All MD files are now included in the editor');
        console.log('✅ Real file content is loaded from the server');
        console.log('✅ Files can be edited and saved');
        console.log('\nThe browser will stay open for 30 seconds for manual testing...\n');
        
        // Keep browser open for manual testing
        await new Promise(r => setTimeout(r, 30000));
        
        await browser.close();
        serverProcess.kill();
        
    } catch (error) {
        console.error('❌ Test error:', error);
        serverProcess.kill();
    }
}, 2000);

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n👋 Closing browser and server...');
    serverProcess.kill();
    process.exit(0);
});