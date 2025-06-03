import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeTop25() {
  console.log('[SCRAPER] Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('[SCRAPER] Navigating to StayLoud.io...');
  await page.goto('https://www.stayloud.io/', { waitUntil: 'domcontentloaded', timeout: 90000 });

  // Wait for leaderboard rows
  await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 90000 });

  const users = await page.evaluate(() => {
    const rows = document.querySelectorAll('tr[data-slot="table-row"]');
    const data = [];

    rows.forEach((row) => {
      const name = row.querySelector('a[href*="twitter.com/i/user"]')?.textContent.trim() || '';
      const handle = row.querySelector('span.text-sm.text-gray-500')?.textContent.trim().replace('@', '') || '';
      const avatar = row.querySelector('img')?.src || '';

      const cells = row.querySelectorAll('td');

      const earningsSol = cells[3]?.querySelector('div.text-[#01FF99]')?.textContent.trim() || '';
      const earningsUsd = cells[3]?.querySelector('div.text-gray-400')?.textContent.trim() || '';
      const earnings = `${earningsSol} / ${earningsUsd}`;

      const mindshare = cells[4]?.querySelector('div')?.textContent.trim() || '';

      const change = cells[5]?.querySelector('span')?.textContent.trim() || '';

      data.push({ name, handle, avatar, earnings, mindshare, change });
    });

    return data;
  });

  await browser.close();
  console.log(`[SCRAPER] Extracted: ${users.length} users`);
  return users;
}
