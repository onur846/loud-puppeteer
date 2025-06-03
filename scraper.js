import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeTop25() {
  console.log('[SCRAPER] Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    console.log('[SCRAPER] Navigating to StayLoud.io...');
    await page.goto('https://www.stayloud.io', { waitUntil: 'networkidle2', timeout: 90000 });

    await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 90000 });

    const users = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[data-slot="table-row"]'));

      return rows.map(row => {
        const username = row.querySelector('a[href*="twitter.com"]')?.textContent.trim();
        const handle = row.querySelector('span.text-sm.text-gray-500')?.textContent.trim().replace('@', '');
        const avatar = row.querySelector('img')?.src || '';

        const cells = row.querySelectorAll('td');

        const earningsSol = cells[3]?.querySelector('div')?.textContent.trim() || '';
        const earningsUsd = cells[3]?.querySelectorAll('div')?.[1]?.textContent.trim() || '';
        const earnings = `${earningsSol} ${earningsUsd}`.trim();

        const mindshare = cells[4]?.querySelector('div')?.textContent.trim() || '';
        const change = cells[5]?.querySelector('span')?.textContent.trim() || '';

        return { handle, username, avatar, mindshare, change, earnings };
      }).filter(u => u.handle && u.username);
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
