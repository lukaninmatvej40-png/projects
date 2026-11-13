import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = 'C:\\Users\\Матвей\\Desktop\\Курс\\E-commerce-Website\\_mobile_screenshots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 800 } });
await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });

const sections = [
  { name: 'fix-01-header-hero', selector: '.hero' },
  { name: 'fix-02-brands', selector: '.brands' },
  { name: 'fix-03-new-arrivals', selector: '#new-arrivals' },
  { name: 'fix-04-top-sellers', selector: '#top-sellers' },
];

for (const s of sections) {
  const el = await page.$(s.selector);
  if (!el) {
    console.log(`MISSING: ${s.selector}`);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await el.screenshot({ path: `${outDir}\\${s.name}.png` });
  console.log(`Captured ${s.name}`);
}

const overflowInfo = await page.evaluate(() => {
  const results = [];
  const docWidth = document.documentElement.clientWidth;
  document.querySelectorAll('*').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > docWidth + 1 || rect.left < -1) {
      results.push({
        tag: el.tagName,
        class: el.className,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      });
    }
  });
  return { docWidth, scrollWidth: document.documentElement.scrollWidth, overflowingElements: results.slice(0, 30) };
});

fs.writeFileSync(`${outDir}\\fix-overflow-report.json`, JSON.stringify(overflowInfo, null, 2));
console.log('doc width', overflowInfo.docWidth, 'scrollWidth', overflowInfo.scrollWidth, 'overflowing count', overflowInfo.overflowingElements.length);

await browser.close();
