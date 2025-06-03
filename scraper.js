import puppeteer from 'puppeteer-core';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

export async function scrapeTop25Users() {
  console.log('[SCRAPER] Launching browser...');

  const browser = await puppeteerExtra.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 60000
  });

  try {
    const page = await browser.newPage();
    console.log('[SCRAPER] Navigating to StayLoud.io...');
    await page.goto('https://www.stayloud.io/', { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 10000 });

    const users = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-slot="table-row"]'));
      return rows.slice(0, 25).map(row => {
        const nameEl = row.querySelector('a[href*="twitter.com/i/user/"]');
        const handleEl = row.querySelector('span.text-sm.text-gray-500');
        if (!nameEl || !handleEl) return null;
        return {
          username: nameEl.textContent.trim(),
          handle: handleEl.textContent.trim().replace('@', '')
        };
      }).filter(Boolean);
    });

    await browser.close();
    return users;
  } catch (error) {
    console.error('[SCRAPER ERROR]', error);
    await browser.close();
    throw new Error('Could not fetch leaderboard data');
  }
}
