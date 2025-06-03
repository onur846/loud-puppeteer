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
    await page.goto('https://www.stayloud.io', {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 90000 });

    const users = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tr[data-slot="table-row"]'));

  return rows.map(row => {
    const username = row.querySelector('a[href*="twitter.com"]')?.textContent.trim();
    const handle = row.querySelector('span.text-sm.text-gray-500')?.textContent.trim().replace('@', '');
    const avatar = row.querySelector('img')?.src || '';

    const cells = row.querySelectorAll('td');
    const earnings  = cells[3]?.textContent.trim() || ''; // 4th real column
    const mindshare = cells[4]?.textContent.trim() || ''; // 5th real column
    const change    = cells[5]?.textContent.trim() || ''; // 6th real column

    return { username, handle, avatar, earnings, mindshare, change };
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
