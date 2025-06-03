// scraper.js

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export default async function scrapeTop25() {
  console.log('[SCRAPER] Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    console.log('[SCRAPER] Navigating to StayLoud.io...');
    await page.goto('https://www.stayloud.io', { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 10000 });

    const users = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-slot="table-row"]'));

      return rows.map(row => {
        const username = row.querySelector('a[href*="twitter.com"]')?.textContent.trim();
        const handle = row.querySelector('span.text-sm.text-gray-500')?.textContent.trim().replace('@', '');
        const avatar = row.querySelector('img')?.src || '';
        const mindshare = row.querySelector('td:nth-child(5)')?.textContent.trim() || '';
        const change = row.querySelector('td:nth-child(6)')?.textContent.trim() || '';
        const earnings = row.querySelector('td:nth-child(7)')?.textContent.trim() || '';

        return { username, handle, avatar, mindshare, change, earnings };
      }).filter(u => u.username && u.handle);
    });

    await browser.close();
    console.log('[SCRAPER] Extracted:', users.length, 'users');
    return users;
  } catch (error) {
    console.error('[SCRAPER ERROR]', error);
    await browser.close();
    throw new Error('Could not fetch leaderboard data');
  }
}
