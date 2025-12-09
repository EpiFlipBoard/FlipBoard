import { writeFileSync } from 'fs';
import { launch } from 'puppeteer';

export async function getPageScrap(url) {
  if (!url) {
    console.error("Usage: node saveRenderedHTML.js <url>");
    process.exit(1);
  }

  const browser = await launch();
  const page = await browser.newPage();

  // Go to the webpage and wait for network to be idle
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Extract the rendered HTML (same as copy outerHTML in Inspect)
  const renderedHTML = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  await browser.close();
  return renderedHTML;
};
