const puppeteer = require('puppeteer');

async function scrapeTop25Users() {
  let browser;
  try {
    console.log('[SCRAPER] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    console.log('[SCRAPER] Navigating to StayLoud.io...');
    await page.goto('https://www.stayloud.io', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('[SCRAPER] Waiting for leaderboard...');
    await page.waitForTimeout(5000); // give time for dynamic content

    const content = await page.content();
    console.log('[SCRAPER] Page content length:', content.length);

    const users = await page.evaluate(() => {
      const rows = document.querySelectorAll('tr[data-slot="table-row"]');
      const extracted = [];

      rows.forEach(row => {
        const usernameEl = row.querySelector('a[href*="twitter.com"]');
        const handleEl = row.querySelector('span.text-gray-500');

        if (usernameEl && handleEl) {
          const username = usernameEl.innerText.trim();
          const handle = handleEl.innerText.trim().replace(/^@/, '');
          extracted.push({ username, handle });
        }
      });

      return extracted.slice(0, 25);
    });

    console.log('[SCRAPER] Extracted users:', users);
    return users;
  } catch (err) {
    console.error('[SCRAPER ERROR]', err);
    throw new Error('Could not fetch leaderboard data');
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapeTop25Users;
