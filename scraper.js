const puppeteer = require('puppeteer');

async function scrapeLeaderboard() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.stayloud.io/', { waitUntil: 'networkidle0' });

  const users = await page.evaluate(() => {
    const rows = document.querySelectorAll('tr[data-slot="table-row"]');
    const data = [];
    rows.forEach((row) => {
      const usernameEl = row.querySelector('a[href*="twitter.com/i/user/"]');
      const handleEl = row.querySelector('span.text-sm.text-gray-500');
      const avatarEl = row.querySelector('img');

      if (usernameEl && handleEl && avatarEl) {
        data.push({
          username: usernameEl.textContent.trim(),
          handle: handleEl.textContent.trim().replace('@', ''),
          avatar: avatarEl.src,
        });
      }
    });
    return data;
  });

  await browser.close();
  return users;
}

module.exports = scrapeLeaderboard;
