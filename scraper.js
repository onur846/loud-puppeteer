const puppeteer = require('puppeteer');

async function scrapeTop25() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  const page = await browser.newPage();
  await page.goto('https://www.stayloud.io', { waitUntil: 'networkidle2' });

  // ✅ Wait for the leaderboard rows to appear
  await page.waitForSelector('tr[data-slot="table-row"]', { timeout: 15000 });

  // ✅ Scrape the top 25 rows
  const users = await page.evaluate(() => {
    const rows = document.querySelectorAll('tr[data-slot="table-row"]');
    const top25 = [];

    rows.forEach(row => {
      const username = row.querySelector('a[href*="twitter.com"]')?.textContent?.trim();
      const handleSpan = row.querySelector('span.text-sm.text-gray-500');
      const handle = handleSpan?.textContent?.trim().replace(/^@/, '');

      if (username && handle) {
        top25.push({ username, handle });
      }
    });

    return top25;
  });

  await browser.close();
  return users;
}

module.exports = scrapeTop25;
