const { chromium } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'outputs/renders');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Simple HTTP server
const createServer = () => {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'src/wow', req.url === '/' ? 'index.html' : req.url);

    // Handle asset requests
    if (req.url.startsWith('/assets/')) {
      filePath = path.join(__dirname, 'public', req.url);
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      // Determine content type
      let contentType = 'text/html';
      if (filePath.endsWith('.css')) contentType = 'text/css';
      if (filePath.endsWith('.js')) contentType = 'text/javascript';
      if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
      if (filePath.endsWith('.png')) contentType = 'image/png';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  return server;
};

// Run tests
async function runTests() {
  const server = createServer();
  server.listen(3000, async () => {
    console.log('Server running on http://localhost:3000');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      const sizes = [
        { width: 1440, height: 900, name: '1440px' },
        { width: 1280, height: 1024, name: '1280px' },
        { width: 1024, height: 768, name: '1024px' },
        { width: 768, height: 1024, name: '768px' },
        { width: 390, height: 844, name: '390px' }
      ];

      const results = {};

      for (const size of sizes) {
        console.log(`\nTesting at ${size.width}×${size.height}...`);
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

        // Get full page height
        const fullHeight = await page.evaluate(() => {
          return Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
        });

        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        results[size.name] = {
          height: fullHeight,
          hasHorizontalScroll: hasHorizontalScroll
        };

        console.log(`  Height: ${fullHeight}px`);
        console.log(`  Horizontal scroll: ${hasHorizontalScroll ? 'YES' : 'NO'}`);

        // Take screenshot of full page
        await page.screenshot({
          path: path.join(outputDir, `screenshot-${size.width}.png`),
          fullPage: true
        });
        console.log(`  Screenshot saved: screenshot-${size.width}.png`);
      }

      // Save results
      fs.writeFileSync(
        path.join(__dirname, 'outputs/done.md'),
        `# Скриншоты и измерения\n\n${Object.entries(results).map(([size, data]) => {
          return `## ${size}\n- Высота страницы: ${data.height}px\n- Горизонтальный скролл: ${data.hasHorizontalScroll ? 'ДА' : 'НЕТ'}\n`;
        }).join('\n')}`
      );

      console.log('\n✓ All tests completed');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      await browser.close();
      server.close();
      process.exit(0);
    }
  });
}

runTests();
